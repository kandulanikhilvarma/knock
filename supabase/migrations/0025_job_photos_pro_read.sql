-- /enhance B25: the pro on a job could not see the customer's photos. 0020 only
-- lets the uploader read job-photos. Path is <customer_uid>/<booking_id>/<file>,
-- so let a pro read a file when the second segment is a booking they hold an
-- open offer on or are assigned to, and the first segment is that booking's
-- customer (stops a pro reading another folder by guessing a booking id).
-- CASE keeps the uuid cast behind the format check.
create policy jp_select_booking_pro on storage.objects for select
  using (
    bucket_id = 'job-photos'
    and case
      when (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then private.is_offered_provider(((storage.foldername(name))[2])::uuid)
        and exists (
          select 1 from public.bookings b
           where b.id = ((storage.foldername(name))[2])::uuid
             and b.customer_id::text = (storage.foldername(name))[1]
        )
      else false
    end
  );
