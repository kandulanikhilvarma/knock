// `respond` — a pinged provider accepts or declines an offer.
// Server-enforced so a client can never self-assign: acceptance is a
// conditional claim on the booking (status flips only if still finding_pro),
// which makes first-accept-wins atomic and forgery impossible (§7 P7).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { offer_id, action } = await req.json();
    if (!offer_id || !['accept', 'decline'].includes(action)) {
      return json({ error: 'offer_id and action (accept|decline) required' }, 400);
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: userRes } = await asUser.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return json({ error: 'unauthenticated' }, 401);

    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: offer, error: oErr } = await db
      .from('dispatch_offers')
      .select('id, booking_id, provider_id, window_sec, sent_at, response')
      .eq('id', offer_id)
      .single();
    if (oErr || !offer) return json({ error: 'offer not found' }, 404);
    if (offer.provider_id !== uid) return json({ error: 'forbidden' }, 403);
    if (offer.response !== 'pending') return json({ error: `already ${offer.response}` }, 409);

    const elapsedSec = (Date.now() - new Date(offer.sent_at).getTime()) / 1000;
    if (elapsedSec > offer.window_sec) {
      await db.from('dispatch_offers').update({ response: 'expired', responded_at: new Date().toISOString() }).eq('id', offer_id);
      return json({ accepted: false, expired: true });
    }

    if (action === 'decline') {
      await db.from('dispatch_offers').update({ response: 'declined', responded_at: new Date().toISOString() }).eq('id', offer_id);
      return json({ accepted: false, declined: true });
    }

    // accept: claim the booking only if still open. first-accept-wins.
    const { data: claimed } = await db
      .from('bookings')
      .update({ status: 'assigned', assigned_provider_id: uid })
      .eq('id', offer.booking_id)
      .eq('status', 'finding_pro')
      .select('id');

    if (!claimed || claimed.length === 0) {
      // lost the race (or booking moved on) — mark this offer expired.
      await db.from('dispatch_offers').update({ response: 'expired', responded_at: new Date().toISOString() }).eq('id', offer_id);
      return json({ accepted: false, taken: true });
    }

    await db.from('dispatch_offers').update({ response: 'accepted', responded_at: new Date().toISOString() }).eq('id', offer_id);
    // expire every other still-pending offer for this booking.
    await db
      .from('dispatch_offers')
      .update({ response: 'expired', responded_at: new Date().toISOString() })
      .eq('booking_id', offer.booking_id)
      .eq('response', 'pending');

    // issue the doorstep token (QR = token, 4-digit PIN fallback). Reset on
    // re-accept after a swap so an old code can't verify a new assignment.
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    await db
      .from('job_tokens')
      .upsert(
        { booking_id: offer.booking_id, pin, token: crypto.randomUUID(), verified_at: null, gps_lat: null, gps_lng: null },
        { onConflict: 'booking_id' },
      );

    return json({ accepted: true, booking_id: offer.booking_id });
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
