-- P4: booking-scoped chat between the customer and the assigned provider.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_booking_idx on public.messages (booking_id, created_at);

alter table public.messages enable row level security;

-- a participant is the booking's customer or its assigned provider. Helper in
-- the private schema (not exposed via /rpc) to keep the linter clean.
create or replace function private.is_booking_participant(bk uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.bookings b
     where b.id = bk and (b.customer_id = auth.uid() or b.assigned_provider_id = auth.uid())
  );
$$;
grant execute on function private.is_booking_participant(uuid) to authenticated, anon;

create policy messages_select_participant on public.messages
  for select using (private.is_booking_participant(booking_id));
create policy messages_insert_participant on public.messages
  for insert with check (private.is_booking_participant(booking_id) and sender_id = auth.uid());

-- realtime: chat needs messages; booking status machine needs bookings too
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.bookings;
