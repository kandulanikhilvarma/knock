-- Replace the SECURITY DEFINER view (0010, advisor ERROR) with a public-readable
-- single-row cache kept current by a trigger. Clients read the aggregate
-- without a definer view and without seeing any individual booking.
drop view if exists public.earnings_public;

create table public.city_stats (
  id boolean primary key default true,
  total_paid bigint not null default 0,
  jobs_paid bigint not null default 0,
  constraint city_stats_singleton check (id)
);
insert into public.city_stats (id) values (true);

alter table public.city_stats enable row level security;
create policy city_stats_read on public.city_stats for select using (true);

-- bump the totals the moment a booking is marked paid
create or replace function public.bump_city_stats()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.paid_at is not null and old.paid_at is null then
    update public.city_stats
       set total_paid = total_paid + coalesce(new.price_agreed, 0),
           jobs_paid = jobs_paid + 1;
  end if;
  return new;
end;
$$;
revoke execute on function public.bump_city_stats() from public, anon, authenticated;

create trigger bookings_paid_stats
  after update of paid_at on public.bookings
  for each row execute function public.bump_city_stats();
