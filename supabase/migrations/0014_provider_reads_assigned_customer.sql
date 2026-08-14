-- §6-2b: the assigned pro needs the customer's name and number to reach the
-- door. Scoped tight: only the pro the booking is assigned to, only while that
-- job is live. Everyone else still sees their own profile row and nothing else.
create policy profiles_select_assigned_customer on public.profiles
for select to authenticated
using (
  exists (
    select 1 from public.bookings b
    where b.customer_id = profiles.id
      and b.assigned_provider_id = (select auth.uid())
      and b.status in ('assigned', 'verified', 'in_progress', 'done')
  )
);
