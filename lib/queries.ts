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

// Pick the localized category name for the active language.
export function categoryName(cat: Category, lang: string): string {
  const key = (['en', 'te', 'hi'].includes(lang) ? lang : 'en') as Lang;
  return { en: cat.name_en, te: cat.name_te, hi: cat.name_hi }[key];
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

export async function getProvider(id: string): Promise<ProviderCard | null> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*, profiles(full_name), provider_stats(*)')
    .eq('user_id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ProviderCard) ?? null;
}

export async function joinWaitlist(categoryId: string, phone: string, city: string) {
  const { error } = await supabase
    .from('waitlist_signups')
    .insert({ category_id: categoryId, phone, city });
  if (error) throw error;
}
