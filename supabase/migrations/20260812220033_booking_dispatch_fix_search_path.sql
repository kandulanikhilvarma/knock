-- Pin search_path on the updated_at trigger function (advisor: mutable search_path).
create or replace function public.touch_updated_at() returns trigger
  language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
