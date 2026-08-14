// `demo-accept` — solo-demo aid. Lets a customer watch the real dispatch loop
// end to end without a second device: it accepts the oldest pending offer on the
// caller's OWN booking, on behalf of that offered provider, using the exact same
// server path as `respond` (claim booking → accept offer → expire others → issue
// doorstep token). Not a way to forge assignments: it only touches a booking the
// caller owns, and only a provider the dispatch engine already offered.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { booking_id } = await req.json();
    if (!booking_id) return json({ error: 'booking_id required' }, 400);

    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: userRes } = await asUser.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return json({ error: 'unauthenticated' }, 401);

    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // only the booking's own customer may drive the demo.
    const { data: booking } = await db
      .from('bookings')
      .select('id, customer_id, status')
      .eq('id', booking_id)
      .single();
    if (!booking) return json({ error: 'booking not found' }, 404);
    if (booking.customer_id !== uid) return json({ error: 'forbidden' }, 403);
    if (booking.status !== 'finding_pro' && booking.status !== 'requested') {
      return json({ assigned: false, reason: `booking is ${booking.status}` });
    }

    // pick the first pro the engine pinged.
    const { data: offer } = await db
      .from('dispatch_offers')
      .select('id, provider_id')
      .eq('booking_id', booking_id)
      .eq('response', 'pending')
      .order('sent_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!offer) return json({ assigned: false, reason: 'no pending offers' });

    // claim the booking only if still open (same guard as respond).
    const { data: claimed } = await db
      .from('bookings')
      .update({ status: 'assigned', assigned_provider_id: offer.provider_id })
      .eq('id', booking_id)
      .in('status', ['finding_pro', 'requested'])
      .select('id');
    if (!claimed || claimed.length === 0) return json({ assigned: false, reason: 'already taken' });

    await db.from('dispatch_offers').update({ response: 'accepted', responded_at: new Date().toISOString() }).eq('id', offer.id);
    await db
      .from('dispatch_offers')
      .update({ response: 'expired', responded_at: new Date().toISOString() })
      .eq('booking_id', booking_id)
      .eq('response', 'pending');

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    await db.from('job_tokens').upsert(
      { booking_id, pin, token: crypto.randomUUID(), verified_at: null, gps_lat: null, gps_lng: null },
      { onConflict: 'booking_id' },
    );

    return json({ assigned: true, provider_id: offer.provider_id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
