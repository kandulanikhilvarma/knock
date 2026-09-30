-- bookings_select_offered ↔ offers_select_customer referenced each other's
-- table, so each policy re-triggered the other's RLS → infinite recursion
-- (Postgres 42P17). Break the cycle with SECURITY DEFINER helpers that read the
-- other table without invoking its RLS. Each only tests the caller's own
-- auth.uid(), so exposing them leaks nothing.
create or replace function public.is_offered_provider(bk uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.dispatch_offers o
     where o.booking_id = bk and o.provider_id = auth.uid()
  );
$$;

create or replace function public.owns_booking(bk uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.bookings b
     where b.id = bk and b.customer_id = auth.uid()
  );
$$;

drop policy if exists bookings_select_offered on public.bookings;
create policy bookings_select_offered on public.bookings
  for select using (public.is_offered_provider(id));

drop policy if exists offers_select_customer on public.dispatch_offers;
create policy offers_select_customer on public.dispatch_offers
  for select using (public.owns_booking(booking_id));
