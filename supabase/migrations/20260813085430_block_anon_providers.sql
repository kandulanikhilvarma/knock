-- Now that anonymous sign-in is on, a guest (anonymous) user must not be able
-- to register as a provider. Real providers sign in with a credential.
drop policy if exists pp_insert_own on public.provider_profiles;
create policy pp_insert_own on public.provider_profiles
  for insert with check (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
