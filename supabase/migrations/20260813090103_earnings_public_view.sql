-- Real "city earnings" for the Home counter (§2/§118) — a single public
-- aggregate over paid bookings, no PII. Runs with owner rights so it can sum
-- across all rows; only the totals are exposed. Replaces the hardcoded figure.
create view public.earnings_public with (security_invoker = false) as
  select
    coalesce(sum(price_agreed), 0)::bigint as total_paid,
    count(*)::bigint as jobs_paid
  from public.bookings
  where paid_at is not null;

grant select on public.earnings_public to anon, authenticated;
