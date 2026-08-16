import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

// Phone OTP only (master-plan §159). Phone stored E.164: +91XXXXXXXXXX.
export function toE164(tenDigits: string): string {
  return '+91' + tenDigits.replace(/\D/g, '').slice(-10);
}

export async function sendOtp(phoneE164: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone: phoneE164 });
  if (error) throw error;
}

export async function verifyOtp(phoneE164: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneE164,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// App Store 5.1.1(v): delete the account from inside the app, then sign out.
export async function deleteAccount() {
  const { error } = await supabase.functions.invoke('delete-account');
  if (error) throw error;
  await supabase.auth.signOut();
}

// Fetch the caller's own profile row (RLS: owner-only).
export async function getMyProfile() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Create/confirm the profile row with a chosen role on first sign-in.
export async function setRole(role: 'customer' | 'provider') {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: auth.user.id, role, phone: auth.user.phone ?? null }, { onConflict: 'id' });
  if (error) throw error;
}

// Pull a Supabase session out of a redirect URL and store it. Handles both the
// PKCE (`?code=`) and implicit (`#access_token=`) grants — which one fires
// depends on the project's flow setting. Shared by Google OAuth and the email
// magic link (the deep-link listener in app/_layout calls this too). Returns
// true if a session was set.
export async function setSessionFromUrl(url: string): Promise<boolean> {
  const frag = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
  const params = new URLSearchParams(frag);

  const errDesc = params.get('error_description');
  if (errDesc) throw new Error(errDesc);

  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return true;
  }

  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
    return true;
  }
  return false;
}

// One-tap Google sign-in for Expo Go AND device builds. Ask Supabase for the
// Google consent URL (we open it ourselves, so skipBrowserRedirect), open it in
// the system auth session, and lift the session out of the returned URL.
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('auth-callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Could not start Google sign-in');

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type === 'cancel' || res.type === 'dismiss') return; // user backed out
  if (res.type !== 'success' || !res.url) throw new Error('Google sign-in did not complete');

  const ok = await setSessionFromUrl(res.url);
  if (!ok) throw new Error('Google sign-in returned no session');
}

// Passwordless email: send a one-time magic link. Tapping it in the email
// deep-links back into the app, where the _layout listener finishes sign-in.
// Note: the default Supabase mailer is rate-limited (a few/hour) and sends a
// link, not a 6-digit code — the code variant needs custom SMTP + a template
// edit. shouldCreateUser lets a first-time email sign straight in.
export async function sendEmailLink(email: string): Promise<void> {
  const redirectTo = Linking.createURL('auth-callback');
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });
  if (error) throw error;
}
