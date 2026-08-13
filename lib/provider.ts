import { supabase } from './supabase';
import type { Database } from './database.types';

export type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row'];
export type Availability = 'available' | 'busy' | 'paused';

export async function getMyProviderProfile(): Promise<ProviderProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type ProviderInput = {
  services: string[];
  upiId: string;
  city: string;
  visitingCharge: number | null;
  bio: string;
};

// Create or update the caller's provider profile, mark their role, and ensure a
// stats row exists (dispatch joins it). Blocked for anonymous users by RLS.
export async function saveProviderProfile(input: ProviderInput) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('not signed in');

  const { error: pErr } = await supabase.from('profiles').update({ role: 'provider' }).eq('id', uid);
  if (pErr) throw pErr;

  const { error } = await supabase.from('provider_profiles').upsert(
    {
      user_id: uid,
      services: input.services,
      upi_id: input.upiId || null,
      city: input.city || null,
      visiting_charge: input.visitingCharge,
      bio: input.bio || null,
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;

  // ensure a stats row (idempotent — neutral priors)
  await supabase.from('provider_stats').upsert({ provider_id: uid }, { onConflict: 'provider_id' });
}

export async function setAvailability(status: Availability) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('not signed in');
  const { error } = await supabase
    .from('provider_profiles')
    .update({ availability_status: status })
    .eq('user_id', uid);
  if (error) throw error;
}
