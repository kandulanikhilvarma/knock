import { supabase } from './supabase';
import type { Database } from './database.types';

export type Category = Database['public']['Tables']['categories']['Row'];
type ProviderProfileRow = Database['public']['Tables']['provider_profiles']['Row'];
type ProviderStatsRow = Database['public']['Tables']['provider_stats']['Row'];

export type ProviderCard = ProviderProfileRow & {
  profiles: { full_name: string | null } | null;
  provider_stats: ProviderStatsRow | null;
};

type Lang = 'en' | 'te' | 'hi';

// profiles is owner-only by RLS (it holds phone), so the join is null for
// anyone browsing. provider_profiles.display_name is the public mirror.
export function providerName(p: {
  display_name?: string | null;
  profiles?: { full_name: string | null } | null;
}): string {
  return p.display_name ?? p.profiles?.full_name ?? '';
}

// Pick the localized category name for the active language.
export function categoryName(cat: Category, lang: string): string {
  const key = (['en', 'te', 'hi'].includes(lang) ? lang : 'en') as Lang;
  return { en: cat.name_en, te: cat.name_te, hi: cat.name_hi }[key];
}

// Readable only by the pro the booking is assigned to, and only while that job
// is live (RLS policy profiles_select_assigned_customer). Null for anyone else.
export async function getCustomerContact(
  id: string,
): Promise<{ full_name: string | null; phone: string | null } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort');
  if (error) throw error;
  return data ?? [];
}

export async function getProvidersByCategory(slug: string): Promise<ProviderCard[]> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*, profiles(full_name), provider_stats(*)')
    .contains('services', [slug]);
  if (error) throw error;
  const rows = (data ?? []) as unknown as ProviderCard[];
  return rows.sort(
    (a, b) => (b.provider_stats?.rating_avg ?? 0) - (a.provider_stats?.rating_avg ?? 0),
  );
}

// Top-rated available provider in a live category — the Home "near you" feature.
export async function getFeaturedProvider(): Promise<ProviderCard | null> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*, profiles(full_name), provider_stats(*)')
    .eq('availability_status', 'available')
    .limit(20);
  if (error) throw error;
  const rows = (data ?? []) as unknown as ProviderCard[];
  rows.sort((a, b) => (b.provider_stats?.rating_avg ?? 0) - (a.provider_stats?.rating_avg ?? 0));
  return rows[0] ?? null;
}

export async function getProvider(id: string): Promise<ProviderCard | null> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*, profiles(full_name), provider_stats(*)')
    .eq('user_id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ProviderCard) ?? null;
}

// Real total paid to workers — the Home counter (public single-row cache).
export async function getCityEarnings(): Promise<number> {
  const { data, error } = await supabase
    .from('city_stats' as never)
    .select('total_paid')
    .single();
  if (error) throw error;
  return (data as { total_paid?: number } | null)?.total_paid ?? 0;
}

// Indian digit grouping (1,23,456) — Hermes Intl can't be relied on for this.
export function formatINR(n: number): string {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

export async function joinWaitlist(categoryId: string, phone: string, city: string) {
  const { error } = await supabase
    .from('waitlist_signups')
    .insert({ category_id: categoryId, phone, city });
  if (error) throw error;
}
