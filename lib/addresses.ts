import { supabase } from './supabase';
import type { Database } from './database.types';

export type SavedAddress = Database['public']['Tables']['saved_addresses']['Row'];

// Owner-only by RLS — no need to filter by user_id in the query.
export async function getSavedAddresses(): Promise<SavedAddress[]> {
  const { data, error } = await supabase
    .from('saved_addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addSavedAddress(a: {
  label: string;
  line: string;
  lat?: number | null;
  lng?: number | null;
  makeDefault?: boolean;
}): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('Not signed in');
  // First address is the default automatically.
  const { count } = await supabase
    .from('saved_addresses')
    .select('id', { count: 'exact', head: true });
  const isDefault = a.makeDefault || (count ?? 0) === 0;
  if (isDefault) await clearDefault(uid);
  const { error } = await supabase.from('saved_addresses').insert({
    user_id: uid,
    label: a.label.trim(),
    line: a.line.trim(),
    lat: a.lat ?? null,
    lng: a.lng ?? null,
    is_default: isDefault,
  });
  if (error) throw error;
}

export async function deleteSavedAddress(id: string): Promise<void> {
  const { error } = await supabase.from('saved_addresses').delete().eq('id', id);
  if (error) throw error;
}

export async function makeDefaultAddress(id: string, uid: string): Promise<void> {
  await clearDefault(uid);
  const { error } = await supabase.from('saved_addresses').update({ is_default: true }).eq('id', id);
  if (error) throw error;
}

async function clearDefault(uid: string): Promise<void> {
  await supabase.from('saved_addresses').update({ is_default: false }).eq('user_id', uid).eq('is_default', true);
}
