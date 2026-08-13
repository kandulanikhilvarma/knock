-- Dispatch timeout sweep (§6-2a): expire offers past their window and drop
-- stuck bookings to `failed` so the customer gets the browse-list fallback —
-- "dispatch failing must never mean a dead end". Pure SQL on pg_cron: no
-- secrets, no HTTP.
--
-- ponytail: this does timeout → fallback only, not wave-2 escalation. When
-- wave-1 acceptance proves too thin, add a wave-2 step (re-run the engine over
-- not-yet-pinged providers, insert wave=2 offers) before marking failed.
-- Escalation lifts match rate; this sweep is the correctness floor.

create extension if not exists pg_cron;

create or replace function public.sweep_dispatch()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 1. expire pending offers whose window elapsed
  update public.dispatch_offers
     set response = 'expired', responded_at = now()
   where response = 'pending'
     and now() > sent_at + (window_sec || ' seconds')::interval;

  -- 2. a booking still finding_pro with every offer resolved and none accepted
  --    (accepted → already 'assigned') has run out of pros → browse fallback
  update public.bookings b
     set status = 'failed'
   where b.status = 'finding_pro'
     and exists (select 1 from public.dispatch_offers o where o.booking_id = b.id)
     and not exists (
       select 1 from public.dispatch_offers o
        where o.booking_id = b.id and o.response = 'pending'
     );
end;
$$;

-- only cron (owner) may run it — never exposed to clients via RPC
revoke execute on function public.sweep_dispatch() from public, anon, authenticated;

-- run every 30s; falls to the fallback within ~a window of wave-1 timing out
select cron.schedule('dispatch-sweep', '30 seconds', $$select public.sweep_dispatch()$$);
