import { supabase } from './supabase';
import type { Database } from './database.types';
import { track } from './analytics';

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingStatus = Database['public']['Enums']['booking_status'];
export type DispatchOffer = Database['public']['Tables']['dispatch_offers']['Row'];

export type NewBooking = {
  categoryId: string | null;
  categorySlug: string;
  description: string;
  address: string;
  timePref?: string;
  custLat?: number | null;
  custLng?: number | null;
};

// Insert the booking, then kick the dispatch engine. Returns the booking id.
export async function createBooking(input: NewBooking): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('not signed in');

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: uid,
      category_id: input.categoryId,
      category_slug: input.categorySlug,
      description: input.description || null,
      address: input.address || null,
      time_pref: input.timePref ?? 'asap',
      cust_lat: input.custLat ?? null,
      cust_lng: input.custLng ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;

  track('booking_created', { booking_id: data.id, category: input.categorySlug });
  await runDispatch(data.id);
  return data.id;
}

export async function runDispatch(bookingId: string) {
  const { data, error } = await supabase.functions.invoke('dispatch', { body: { booking_id: bookingId } });
  if (error) throw error;
  const res = data as { dispatched: boolean; fallback?: boolean; pinged?: number; wave?: number };
  // The two numbers §8 says to watch: did a wave go out, or did we fall back?
  if (res.dispatched) track('dispatch_wave_sent', { booking_id: bookingId, wave: res.wave ?? 1, pinged: res.pinged ?? 0 });
  else track('dispatch_failed', { booking_id: bookingId });
  return res;
}

// Solo-demo: auto-accept the first offered pro so the whole loop is visible
// without a second device. Server-side, own booking only. See demo-accept fn.
export async function demoAccept(bookingId: string) {
  const { data, error } = await supabase.functions.invoke('demo-accept', { body: { booking_id: bookingId } });
  if (error) throw error;
  return data as { assigned: boolean; provider_id?: string; reason?: string };
}

// One tap runs the entire flow: guest sign-in (if needed) → request → dispatch →
// a pro auto-accepts → returns the booking and the pro who took it.
export async function startDemoBooking(
  categoryId: string | null,
  categorySlug: string,
  coords?: { lat: number; lng: number },
): Promise<{ id: string; providerId: string | null }> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
  const id = await createBooking({
    categoryId,
    categorySlug,
    description: 'AC not cooling (demo request)',
    address: 'Benz Circle, Vijayawada (demo)',
    custLat: coords?.lat ?? null,
    custLng: coords?.lng ?? null,
  });
  await new Promise((r) => setTimeout(r, 700)); // let dispatch seat the offers
  const res = await demoAccept(id);
  return { id, providerId: res.provider_id ?? null };
}

export async function getBooking(id: string): Promise<Booking | null> {
  const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Realtime status machine — fires cb on every row change for this booking.
export function subscribeBooking(id: string, cb: (b: Booking) => void) {
  const ch = supabase
    .channel(`booking:${id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${id}` },
      (payload) => cb(payload.new as Booking),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(ch);
  };
}

export async function swapProvider(bookingId: string) {
  const { error } = await supabase.functions.invoke('swap', { body: { booking_id: bookingId } });
  if (error) throw error;
  track('swap_used', { booking_id: bookingId });
  await runDispatch(bookingId);
}

// --- provider side ---

export type OfferWithBooking = DispatchOffer & { bookings: Booking | null };

// Pending offers pinged to the signed-in provider, newest first.
export async function getMyOffers(): Promise<OfferWithBooking[]> {
  const { data, error } = await supabase
    .from('dispatch_offers')
    .select('*, bookings(*)')
    .eq('response', 'pending')
    .eq('scheduled', false) // parked wave-2 offers are not live yet
    .order('sent_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OfferWithBooking[];
}

export async function respondOffer(offerId: string, action: 'accept' | 'decline') {
  const { data, error } = await supabase.functions.invoke('respond', {
    body: { offer_id: offerId, action },
  });
  if (error) throw error;
  const res = data as { accepted: boolean; taken?: boolean; expired?: boolean };
  track(action === 'accept' && res.accepted ? 'offer_accepted' : 'offer_declined', { offer_id: offerId });
  return res;
}

// --- P5: doorstep verify, payment, reviews ---

export type JobToken = Database['public']['Tables']['job_tokens']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];

// The assigned provider reads their job's QR token + PIN to show at the door.
export async function getJobToken(bookingId: string): Promise<JobToken | null> {
  const { data, error } = await supabase
    .from('job_tokens')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Customer confirms the pro at the door via scanned token or typed PIN.
export async function verifyArrival(bookingId: string, code: string, lat?: number, lng?: number) {
  const { data, error } = await supabase.functions.invoke('verify-arrival', {
    body: { booking_id: bookingId, code, lat, lng },
  });
  if (error) throw error;
  const res = data as { verified: boolean; error?: string };
  if (res.verified) track('arrival_verified', { booking_id: bookingId, method: code.length === 4 ? 'pin' : 'qr' });
  return res;
}

export async function markDone(bookingId: string) {
  const { error } = await supabase.functions.invoke('job-action', {
    body: { booking_id: bookingId, action: 'done' },
  });
  if (error) throw error;
  track('booking_done', { booking_id: bookingId });
}

export async function markPaid(bookingId: string, method: 'upi' | 'cash') {
  const { error } = await supabase.functions.invoke('job-action', {
    body: { booking_id: bookingId, action: 'paid', pay_method: method },
  });
  if (error) throw error;
  track('payment_marked', { booking_id: bookingId, method });
}

export async function submitReview(bookingId: string, rating: number, tags: string[], body: string) {
  const { error } = await supabase.functions.invoke('submit-review', {
    body: { booking_id: bookingId, rating, tags, body },
  });
  if (error) throw error;
  track('review_left', { booking_id: bookingId, rating });
}

export async function getProviderReviews(providerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Has this booking already been reviewed? (reviews are public-readable)
export async function getBookingReview(bookingId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
