-- §6-2a wave 2. The engine already ranks the whole pool when a booking comes
-- in, so wave 2 is written at the same time and parked (`scheduled`), then
-- released by the sweep when wave 1 times out. One scoring implementation, and
-- the full plan is auditable from the moment of dispatch.
alter table public.dispatch_offers add column if not exists scheduled boolean not null default false;

create index if not exists dispatch_offers_scheduled_idx
  on public.dispatch_offers (booking_id, scheduled, response);

create or replace function public.sweep_dispatch()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dispatch_offers
     set response = 'expired', responded_at = now()
   where response = 'pending'
     and scheduled = false
     and now() > sent_at + (window_sec || ' seconds')::interval;

  update public.dispatch_offers o
     set scheduled = false, sent_at = now()
   where o.scheduled = true
     and o.response = 'pending'
     and exists (
       select 1 from public.bookings b
        where b.id = o.booking_id and b.status = 'finding_pro'
     )
     and not exists (
       select 1 from public.dispatch_offers x
        where x.booking_id = o.booking_id
          and x.response = 'pending'
          and x.scheduled = false
     );

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
