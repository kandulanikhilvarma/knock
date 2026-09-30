-- Only cron (owner) may run the sweep; never exposed to clients via RPC.
revoke execute on function public.sweep_dispatch() from public, anon, authenticated;
