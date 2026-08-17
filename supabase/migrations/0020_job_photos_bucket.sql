-- Private Storage bucket for booking/job photos + provider work gallery.
-- Path convention: <uid>/<booking_id>/<file> — owner (first path segment) CRUD.
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', false)
on conflict (id) do nothing;

create policy jp_select_own on storage.objects for select
  using (bucket_id = 'job-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy jp_insert_own on storage.objects for insert
  with check (bucket_id = 'job-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy jp_delete_own on storage.objects for delete
  using (bucket_id = 'job-photos' and (storage.foldername(name))[1] = auth.uid()::text);
