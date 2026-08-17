-- Provider work-photo gallery. Public bucket (anyone can view a pro's work);
-- provider owns writes under their <uid>/ prefix. URLs stored in work_photos.
alter table public.provider_profiles add column if not exists work_photos text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('provider-gallery', 'provider-gallery', true)
on conflict (id) do nothing;

create policy pg_insert_own on storage.objects for insert
  with check (bucket_id = 'provider-gallery' and (storage.foldername(name))[1] = auth.uid()::text);
create policy pg_delete_own on storage.objects for delete
  using (bucket_id = 'provider-gallery' and (storage.foldername(name))[1] = auth.uid()::text);
