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
