// `submit-review` — review only after a confirmed (done) job, gated server-side
// so fake reviews are impossible (§6 parity: "review only after a confirmed
// job"). Recomputes the provider's rating_avg from all their reviews.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { booking_id, rating, tags, body } = await req.json();
    if (!booking_id || !(rating >= 1 && rating <= 5)) {
      return json({ error: 'booking_id and rating 1-5 required' }, 400);
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: userRes } = await asUser.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return json({ error: 'unauthenticated' }, 401);

    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: b } = await db
      .from('bookings')
      .select('id, customer_id, assigned_provider_id, status')
      .eq('id', booking_id)
      .single();
    if (!b) return json({ error: 'booking not found' }, 404);
    if (b.customer_id !== uid) return json({ error: 'only the customer' }, 403);
    if (b.status !== 'done') return json({ error: `cannot review from ${b.status}` }, 409);
    if (!b.assigned_provider_id) return json({ error: 'no provider on booking' }, 409);

    const { error: iErr } = await db.from('reviews').insert({
      booking_id,
      customer_id: uid,
      provider_id: b.assigned_provider_id,
      rating: Math.round(rating),
      tags: Array.isArray(tags) ? tags : [],
      body: body ?? null,
    });
    if (iErr) {
      if (iErr.code === '23505') return json({ error: 'already reviewed' }, 409);
      return json({ error: iErr.message }, 500);
    }

    // recompute rating_avg across all this provider's reviews
    const { data: rs } = await db
      .from('reviews')
      .select('rating')
      .eq('provider_id', b.assigned_provider_id);
    const list = rs ?? [];
    const avg = list.reduce((s, r) => s + r.rating, 0) / (list.length || 1);
    await db
      .from('provider_stats')
      .update({ rating_avg: Number(avg.toFixed(2)), updated_at: new Date().toISOString() })
      .eq('provider_id', b.assigned_provider_id);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
