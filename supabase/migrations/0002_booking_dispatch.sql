-- Booking loop + dispatch offers per §6-2a / §8. RLS on every table.
-- SECURITY: booking status + offer acceptance are server-only (Edge Function,
-- service role). Clients may INSERT a booking and READ their own; they may
-- never flip status or self-accept an offer. A forged 'verified' or
-- self-accepted offer must be impossible from the client (§7 P7).

create type public.booking_status as enum (
  'requested', 'finding_pro', 'assigned', 'verified', 'in_progress', 'done', 'cancelled', 'failed'
);
create type public.offer_response as enum ('pending', 'accepted', 'declined', 'expired');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  category_slug text not null,
  description text,
  photos text[] not null default '{}',
  address text,
  area_geohash text,
  cust_lat numeric,
  cust_lng numeric,
  time_pref text not null default 'asap',
  status public.booking_status not null default 'requested',
  assigned_provider_id uuid references public.provider_profiles(user_id) on delete set null,
  price_agreed int,
  swap_used boolean not null default false,
  excluded_provider_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index bookings_status_idx on public.bookings (status);

-- One row per provider pinged per booking. The audit trail is also the legal
-- defense for "published dispatch rules" (§6-2a). Restartable state lives here.
create table public.dispatch_offers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider_id uuid not null references public.provider_profiles(user_id) on delete cascade,
  wave int not null,
  score numeric(5,4),
  window_sec int not null,
  sent_at timestamptz not null default now(),
  responded_at timestamptz,
  response public.offer_response not null default 'pending',
  unique (booking_id, provider_id)
);
create index dispatch_offers_provider_idx on public.dispatch_offers (provider_id, response);
create index dispatch_offers_booking_idx on public.dispatch_offers (booking_id);

-- keep updated_at honest
create or replace function public.touch_updated_at() returns trigger
  language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.bookings enable row level security;
alter table public.dispatch_offers enable row level security;

-- bookings: customer owns the row. Insert + read own; NO client status writes.
create policy bookings_insert_own on public.bookings
  for insert with check (auth.uid() = customer_id);
create policy bookings_select_own on public.bookings
  for select using (auth.uid() = customer_id);
-- a pinged provider may read the booking they were offered
create policy bookings_select_offered on public.bookings
  for select using (
    exists (select 1 from public.dispatch_offers o
            where o.booking_id = bookings.id and o.provider_id = auth.uid())
  );

-- dispatch_offers: read-only for clients. All writes go through the Edge
-- Function (service role bypasses RLS). No update/insert policy on purpose —
-- this is what makes self-accept impossible from the client.
create policy offers_select_provider on public.dispatch_offers
  for select using (auth.uid() = provider_id);
create policy offers_select_customer on public.dispatch_offers
  for select using (
    exists (select 1 from public.bookings b
            where b.id = dispatch_offers.booking_id and b.customer_id = auth.uid())
  );
