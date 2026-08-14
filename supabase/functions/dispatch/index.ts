// `dispatch` — triggered by the customer right after a booking insert.
// Runs the engine (§6-2a), writes wave-1 offers, flips status to finding_pro.
// Service role bypasses RLS; ownership is verified from the caller's JWT so a
// customer can only dispatch their own booking.
//
// ponytail: wave-2 escalation + 90/120s timeouts belong in a scheduled
// function reading dispatch_offers.sent_at — add when wave-1 acceptance proves
// too thin. Push/WhatsApp notify is stubbed until Expo push tokens exist.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';
import { planDispatch, CONFIG, type Candidate } from '../_shared/dispatch.ts';
import { distanceKm, decodeGeohash } from '../_shared/geo.ts';

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
    const authHeader = req.headers.get('Authorization') ?? '';

    // Who is calling — verify with anon client + their JWT.
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await asUser.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return json({ error: 'unauthenticated' }, 401);

    // Privileged client for the actual work.
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: booking, error: bErr } = await db
      .from('bookings')
      .select('id, customer_id, category_slug, cust_lat, cust_lng, excluded_provider_ids, status')
      .eq('id', booking_id)
      .single();
    if (bErr || !booking) return json({ error: 'booking not found' }, 404);
    if (booking.customer_id !== uid) return json({ error: 'forbidden' }, 403);
    if (booking.status !== 'requested') return json({ error: `already ${booking.status}` }, 409);

    // Candidate pool: available providers offering this category, not excluded.
    const excluded: string[] = booking.excluded_provider_ids ?? [];
    const { data: rows, error: pErr } = await db
      .from('provider_profiles')
      .select('user_id, area_geohash, verify_tier, provider_stats(rating_avg, acceptance_rate, completion_rate, jobs_done, updated_at)')
      .contains('services', [booking.category_slug])
      .eq('availability_status', 'available');
    if (pErr) return json({ error: pErr.message }, 500);

    const haveCust = booking.cust_lat != null && booking.cust_lng != null;
    const candidates: Candidate[] = (rows ?? [])
      .filter((r: any) => !excluded.includes(r.user_id))
      .map((r: any) => {
        const st = Array.isArray(r.provider_stats) ? r.provider_stats[0] : r.provider_stats;
        const geo = r.area_geohash ? decodeGeohash(r.area_geohash) : null;
        // ponytail: no coords on either side → neutral half-cap distance so the
        // provider still competes on the other factors. Real geo lands at onboarding.
        const dist =
          haveCust && geo
            ? distanceKm(Number(booking.cust_lat), Number(booking.cust_lng), geo.lat, geo.lng)
            : CONFIG.distanceCapKm / 2;
        return {
          providerId: r.user_id,
          ratingAvg: st?.jobs_done ? Number(st.rating_avg) : null,
          acceptanceRate: st ? Number(st.acceptance_rate) : null,
          completionRate: st ? Number(st.completion_rate) : null,
          jobsDone: st?.jobs_done ?? 0,
          lastActiveAt: st?.updated_at ?? null,
          distanceKm: dist,
          verified: r.verify_tier === 'verified',
        };
      });

    const plan = planDispatch(candidates);

    if (plan.fallback) {
      await db.from('bookings').update({ status: 'failed' }).eq('id', booking_id);
      return json({ dispatched: false, fallback: true, reason: 'no providers in range' });
    }

    const wave1 = plan.waves.find((w) => w.wave === 1)!;
    const scoreOf = new Map(plan.scored.map((c) => [c.providerId, c.score]));
    const offers = wave1.providerIds.map((pid) => ({
      booking_id,
      provider_id: pid,
      wave: 1,
      score: scoreOf.get(pid) ?? null,
      window_sec: wave1.windowSec,
    }));
    const { error: oErr } = await db.from('dispatch_offers').insert(offers);
    if (oErr) return json({ error: oErr.message }, 500);

    await db.from('bookings').update({ status: 'finding_pro' }).eq('id', booking_id);

    return json({
      dispatched: true,
      wave: 1,
      pinged: wave1.providerIds.length,
      windowSec: wave1.windowSec,
      quotaFilled: plan.quotaFilled,
    });
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
