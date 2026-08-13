// `job-action` — the two server-only transitions after the door handshake:
//   done: assigned provider marks work complete (in_progress → done, +1 job)
//   paid: customer or provider logs the UPI/cash payment (done → paid_at set).
// The app never touches the money; it only records that it happened (§0/§7).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { booking_id, action, pay_method } = await req.json();
    if (!booking_id || !['done', 'paid'].includes(action)) {
      return json({ error: 'booking_id and action (done|paid) required' }, 400);
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

    if (action === 'done') {
      if (b.assigned_provider_id !== uid) return json({ error: 'only the assigned pro' }, 403);
      if (b.status !== 'in_progress') return json({ error: `cannot finish from ${b.status}` }, 409);
      await db.from('bookings').update({ status: 'done' }).eq('id', booking_id);
      // completion feeds the directory count + dispatch newcomer quota
      const { data: st } = await db
        .from('provider_stats')
        .select('jobs_done')
        .eq('provider_id', uid)
        .single();
      await db
        .from('provider_stats')
        .update({ jobs_done: (st?.jobs_done ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq('provider_id', uid);
      return json({ ok: true, status: 'done' });
    }

    // paid
    if (uid !== b.customer_id && uid !== b.assigned_provider_id) {
      return json({ error: 'not a party to this booking' }, 403);
    }
    if (b.status !== 'done') return json({ error: `cannot mark paid from ${b.status}` }, 409);
    await db
      .from('bookings')
      .update({ paid_at: new Date().toISOString(), pay_method: pay_method === 'cash' ? 'cash' : 'upi' })
      .eq('id', booking_id);
    return json({ ok: true, paid: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
