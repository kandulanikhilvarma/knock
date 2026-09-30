-- §8 product events. Own table rather than a vendor SDK: the numbers that
-- matter here (time-to-assign, dispatch_failed) are joins against bookings, and
-- this keeps user data in the same region as the rest of it.
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_time_idx
  on public.analytics_events (name, created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists analytics_insert_own on public.analytics_events;
create policy analytics_insert_own on public.analytics_events
for insert to authenticated
with check (user_id = (select auth.uid()));
