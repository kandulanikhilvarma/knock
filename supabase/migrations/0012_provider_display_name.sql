-- profiles is owner-only by RLS (it holds phone), so a customer browsing the
-- directory could never read a pro's name. Mirror just the public display name
-- onto provider_profiles, which is already public-readable.
alter table public.provider_profiles add column if not exists display_name text;

update public.provider_profiles pp
set display_name = p.full_name
from public.profiles p
where p.id = pp.user_id and pp.display_name is distinct from p.full_name;

create or replace function public.sync_provider_display_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.provider_profiles
  set display_name = new.full_name
  where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_sync_provider_display_name on public.profiles;
create trigger trg_sync_provider_display_name
after update of full_name on public.profiles
for each row execute function public.sync_provider_display_name();

-- new provider rows pick the name up on insert too
create or replace function public.fill_provider_display_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.display_name is null then
    select full_name into new.display_name from public.profiles where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_fill_provider_display_name on public.provider_profiles;
create trigger trg_fill_provider_display_name
before insert or update on public.provider_profiles
for each row execute function public.fill_provider_display_name();
