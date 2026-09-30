-- A category goes live the moment a real provider offers it. Before this, is_live
-- was flipped by hand, so a tradesperson could sign up (row saved, available) and
-- still be invisible to every customer — the category stayed on the waitlist screen.
-- Trigger-owned so it can never drift from the data again.
--
-- ponytail: any authenticated provider can flip a category live by listing it in
-- services. That only makes the category browsable (no data access), and at launch
-- it beats the alternative that caused this bug. Gate on verify_tier if spam appears.
create or replace function private.mark_categories_live()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.services is not null and array_length(new.services, 1) > 0 then
    update public.categories
       set is_live = true
     where slug = any(new.services)
       and is_live = false;
  end if;
  return new;
end;
$$;

revoke all on function private.mark_categories_live() from public, anon, authenticated;

drop trigger if exists provider_marks_category_live on public.provider_profiles;
create trigger provider_marks_category_live
  after insert or update of services on public.provider_profiles
  for each row execute function private.mark_categories_live();

-- Backfill: any category that already has a provider should already be live.
update public.categories c
   set is_live = true
 where c.is_live = false
   and exists (
     select 1 from public.provider_profiles p
      where c.slug = any(p.services)
   );
