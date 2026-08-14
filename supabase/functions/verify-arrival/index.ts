// `verify-arrival` (§6-2b) — the doorstep handshake. Customer submits the
// provider's QR token or the 4-digit PIN; server checks it against the job and
// flips assigned → in_progress with a GPS+timestamp stamp. No verify, no
// payment screen — and a client can never fake it (status write is server-only).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { booking_id, code, lat, lng } = await req.json();
    if (!booking_id || !code) return json({ error: 'booking_id and code required' }, 400);

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
      .select('id, customer_id, status')
      .eq('id', booking_id)
      .single();
    if (!b) return json({ error: 'booking not found' }, 404);
    if (b.customer_id !== uid) return json({ error: 'forbidden' }, 403);
    if (b.status !== 'assigned') return json({ error: `cannot verify from ${b.status}` }, 409);

    const { data: tok } = await db
      .from('job_tokens')
      .select('id, token, pin, verified_at')
      .eq('booking_id', booking_id)
      .single();
    if (!tok) return json({ error: 'no token for booking' }, 404);

    const submitted = String(code).trim();
    if (submitted !== tok.pin && submitted !== tok.token) {
      return json({ verified: false, error: 'wrong code' }, 403);
    }

    await db
      .from('job_tokens')
      .update({ verified_at: new Date().toISOString(), gps_lat: lat ?? null, gps_lng: lng ?? null })
      .eq('id', tok.id);
    await db.from('bookings').update({ status: 'in_progress' }).eq('id', booking_id);

    return json({ verified: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
