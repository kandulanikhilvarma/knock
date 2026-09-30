-- Trigger functions have no business being callable over PostgREST.
revoke execute on function public.sync_provider_display_name() from anon, authenticated;
revoke execute on function public.fill_provider_display_name() from anon, authenticated;
