-- Saved addresses (§6 screen map: Profile → Saved addresses). Owner-only.
-- Fills bookings.address / cust_lat / cust_lng at request time so a customer
-- picks "Home"/"Work" instead of re-typing every booking.
create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  line text not null,
  lat numeric,
  lng numeric,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.saved_addresses enable row level security;

create policy sa_select_own on public.saved_addresses
  for select using (auth.uid() = user_id);
create policy sa_insert_own on public.saved_addresses
  for insert with check (auth.uid() = user_id);
create policy sa_update_own on public.saved_addresses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy sa_delete_own on public.saved_addresses
  for delete using (auth.uid() = user_id);

create index if not exists saved_addresses_user_idx on public.saved_addresses (user_id);
