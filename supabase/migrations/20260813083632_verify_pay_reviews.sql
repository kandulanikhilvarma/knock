-- P5: doorstep verification + UPI-direct payment + reviews (§6-2b, §6 parity).
-- Status order is enforced server-side by Edge Functions; no client flips a
-- booking to verified/paid or forges a review.

-- provider UPI handle for the payment handoff (deliberately omitted until now)
alter table public.provider_profiles add column upi_id text;

-- payment record on the booking (app never touches the money — just logs it)
alter table public.bookings add column paid_at timestamptz;
alter table public.bookings add column pay_method text check (pay_method in ('upi','cash'));

-- job-bound token: QR payload = token, plus a 4-digit PIN fallback. One per booking.
create table public.job_tokens (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  token uuid not null default gen_random_uuid(),
  pin text not null,
  verified_at timestamptz,
  gps_lat numeric,
  gps_lng numeric,
  created_at timestamptz not null default now()
);

-- review only after a confirmed (done) job — FK + server gating kills fakes
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.provider_profiles(user_id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  tags text[] not null default '{}',
  body text,
  created_at timestamptz not null default now()
);
create index reviews_provider_idx on public.reviews (provider_id, created_at desc);

alter table public.job_tokens enable row level security;
alter table public.reviews enable row level security;

-- only the assigned provider may read their job's token (to render QR/PIN).
-- the customer never reads it — they scan/type it from the provider's screen.
create or replace function private.is_assigned_provider(bk uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.bookings b
     where b.id = bk and b.assigned_provider_id = auth.uid()
  );
$$;
grant execute on function private.is_assigned_provider(uuid) to authenticated, anon;

create policy job_tokens_select_provider on public.job_tokens
  for select using (private.is_assigned_provider(booking_id));

-- reviews are public (shown on provider profiles); writes are server-only.
create policy reviews_select_all on public.reviews for select using (true);
