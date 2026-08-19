import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Placeholder until the Mumbai project is created and .env is filled.
  // Auth/data calls (P1+) will fail loudly rather than silently — intended.
  console.warn('Supabase env missing — set EXPO_PUBLIC_SUPABASE_URL and _ANON_KEY in .env');
}

export const supabase = createClient<Database>(url ?? '', anonKey ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Web returns OAuth/magic-link sessions in the URL and must parse them;
    // native uses an explicit deep-link handler instead (app/_layout).
    detectSessionInUrl: Platform.OS === 'web',
  },
});
