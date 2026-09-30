-- Close client write paths to server-owned columns (/enhance audit SEC-1, SEC-2,
-- SEC-12, SEC-11, RULE-8). NOT yet applied to prod — see .enhance/BLOCKERS.md.

-- SEC-1: bookings_insert_own only checked customer_id, so a client could insert
-- a booking that was already assigned / done / paid, then leave a review
-- against any provider (which also feeds the low-rating auto-pause in 0017).
-- A new booking must start empty; status moves only through Edge Functions.
drop policy if exists bookings_insert_own on public.bookings;
create policy bookings_insert_own on public.bookings
  for insert with check (
    auth.uid() = customer_id
    and status = 'requested'
    and assigned_provider_id is null
    and paid_at is null
    and pay_method is null
    and price_agreed is null
    and swap_used = false
    and excluded_provider_ids = '{}'
  );

-- SEC-2: pp_insert_own / pp_update_own let a provider write verify_tier on their
-- own row, i.e. award themselves the Verified badge and the dispatch bonus.
-- API callers (anon/authenticated) can never set it; service role and
-- migrations still can.
create or replace function private.pin_verify_tier()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.verify_tier := 'basic';
    else
      new.verify_tier := old.verify_tier;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.pin_verify_tier() from public, anon, authenticated;

drop trigger if exists provider_pin_verify_tier on public.provider_profiles;
create trigger provider_pin_verify_tier
  before insert or update on public.provider_profiles
  for each row execute function private.pin_verify_tier();

-- SEC-12: provider_stats has no insert policy, so the client upsert in
-- lib/provider.ts always failed. Without the row, job-action and submit-review
-- update nothing: jobs_done and rating_avg never move. Create it server-side.
create or replace function private.create_provider_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.provider_stats (provider_id)
  values (new.user_id)
  on conflict (provider_id) do nothing;
  return new;
end;
$$;

revoke all on function private.create_provider_stats() from public, anon, authenticated;

drop trigger if exists provider_creates_stats on public.provider_profiles;
create trigger provider_creates_stats
  after insert on public.provider_profiles
  for each row execute function private.create_provider_stats();

insert into public.provider_stats (provider_id)
select p.user_id from public.provider_profiles p
on conflict (provider_id) do nothing;

-- SEC-11: the assigned pro kept the customer's phone for every 'done' booking,
-- forever. Keep it while the job is live and for 24 h after it closes.
drop policy if exists profiles_select_assigned_customer on public.profiles;
create policy profiles_select_assigned_customer on public.profiles
for select to authenticated
using (
  exists (
    select 1 from public.bookings b
    where b.customer_id = profiles.id
      and b.assigned_provider_id = (select auth.uid())
      and (
        b.status in ('assigned', 'verified', 'in_progress')
        or (b.status = 'done' and b.updated_at > now() - interval '24 hours')
      )
  )
);

-- RULE-8: any provider ever pinged kept read access to the booking (address,
-- description, photos) after declining or expiring. Keep it for live offers and
-- for the pro the job is assigned to.
create or replace function private.is_offered_provider(bk uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.dispatch_offers o
     where o.booking_id = bk
       and o.provider_id = auth.uid()
       and o.response = 'pending'
  ) or exists (
    select 1 from public.bookings b
     where b.id = bk and b.assigned_provider_id = auth.uid()
  );
$$;
