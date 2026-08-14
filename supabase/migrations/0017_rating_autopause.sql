-- §6-2a performance feedback loop, the half that must be server-side: a rated
-- provider whose last 20 jobs average under 3.5 is paused pending
-- re-verification. Published rule, applied by the system, never a manual block.
create or replace function public.pause_low_rated_provider()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_recent numeric;
  n_recent int;
begin
  select avg(rating), count(*) into avg_recent, n_recent
  from (
    select rating from public.reviews
     where provider_id = new.provider_id
     order by created_at desc
     limit 20
  ) r;

  if n_recent >= 5 and avg_recent < 3.5 then
    update public.provider_profiles
       set availability_status = 'paused'
     where user_id = new.provider_id
       and availability_status <> 'paused';
  end if;

  return new;
end;
$$;

revoke execute on function public.pause_low_rated_provider() from public, anon, authenticated;

drop trigger if exists trg_pause_low_rated_provider on public.reviews;
create trigger trg_pause_low_rated_provider
after insert on public.reviews
for each row execute function public.pause_low_rated_provider();
