// `swap` — the customer's one free re-dispatch (§6-2a). Excludes the current
// pro, resets the booking to `requested`, burns the single swap. The client
// then calls `dispatch` again. Status writes are server-only, so a client can
// never fake a swap or a re-assignment.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
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
    const { data: b, error } = await db
      .from('bookings')
      .select('id, customer_id, status, swap_used, assigned_provider_id, excluded_provider_ids')
      .eq('id', booking_id)
      .single();
    if (error || !b) return json({ error: 'booking not found' }, 404);
    if (b.customer_id !== uid) return json({ error: 'forbidden' }, 403);
    if (b.swap_used) return json({ error: 'swap already used' }, 409);
    if (!['assigned', 'finding_pro', 'failed'].includes(b.status)) {
      return json({ error: `cannot swap from ${b.status}` }, 409);
    }

    const excluded: string[] = b.excluded_provider_ids ?? [];
    if (b.assigned_provider_id && !excluded.includes(b.assigned_provider_id)) {
      excluded.push(b.assigned_provider_id);
    }

    await db
      .from('bookings')
      .update({ status: 'requested', assigned_provider_id: null, swap_used: true, excluded_provider_ids: excluded })
      .eq('id', booking_id);
    await db
      .from('dispatch_offers')
      .update({ response: 'expired', responded_at: new Date().toISOString() })
      .eq('booking_id', booking_id)
      .eq('response', 'pending');

    return json({ ok: true });
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
