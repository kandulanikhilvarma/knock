-- The RLS helpers from 0005 must be callable inside policies (so authenticated
-- needs EXECUTE) but should NOT be reachable via PostgREST /rpc. Moving them to
-- a non-exposed `private` schema satisfies both and clears the security linter.
create schema if not exists private;
grant usage on schema private to authenticated, anon;

create or replace function private.is_offered_provider(bk uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.dispatch_offers o
     where o.booking_id = bk and o.provider_id = auth.uid()
  );
$$;

create or replace function private.owns_booking(bk uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.bookings b
     where b.id = bk and b.customer_id = auth.uid()
  );
$$;

grant execute on function private.is_offered_provider(uuid) to authenticated, anon;
grant execute on function private.owns_booking(uuid) to authenticated, anon;

drop policy if exists bookings_select_offered on public.bookings;
create policy bookings_select_offered on public.bookings
  for select using (private.is_offered_provider(id));

drop policy if exists offers_select_customer on public.dispatch_offers;
create policy offers_select_customer on public.dispatch_offers
  for select using (private.owns_booking(booking_id));

drop function if exists public.is_offered_provider(uuid);
drop function if exists public.owns_booking(uuid);
