-- 0013 revoked from anon/authenticated but both still inherit EXECUTE from
-- PUBLIC, which is where the default grant actually lives.
revoke execute on function public.sync_provider_display_name() from public;
revoke execute on function public.fill_provider_display_name() from public;
