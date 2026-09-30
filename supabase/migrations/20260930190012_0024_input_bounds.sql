-- SEC-9 (/enhance audit): the only UPI check was a client-side includes('@'),
-- and free-text columns had no size limit. Applied to prod 2026-10-01.

-- UPI format, same rule as lib/validate.ts. A trigger on writes to upi_id, not
-- a CHECK: a CHECK re-runs on every update of the row, so a pro with an old bad
-- value could no longer even change availability.
create or replace function private.check_upi_format()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.upi_id is not null and new.upi_id !~ '^[A-Za-z0-9._-]{2,255}@[A-Za-z]{2,64}$' then
    raise exception 'invalid upi_id' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.check_upi_format() from public, anon, authenticated;

drop trigger if exists provider_checks_upi on public.provider_profiles;
create trigger provider_checks_upi
  before insert or update of upi_id on public.provider_profiles
  for each row execute function private.check_upi_format();

-- Length caps match the client maxLength. NOT VALID: existing rows are not
-- scanned (none are expected to be this long).
alter table public.provider_profiles
  add constraint provider_profiles_bio_len check (char_length(bio) <= 1000) not valid,
  add constraint provider_profiles_city_len check (char_length(city) <= 60) not valid;
alter table public.bookings
  add constraint bookings_description_len check (char_length(description) <= 1000) not valid,
  add constraint bookings_address_len check (char_length(address) <= 300) not valid;
alter table public.messages
  add constraint messages_body_len check (char_length(body) between 1 and 2000) not valid;
alter table public.reviews
  add constraint reviews_body_len check (char_length(body) <= 1000) not valid;
