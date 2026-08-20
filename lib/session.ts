import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Best display name for a signed-in user: the name Google/Apple handed us in
// metadata, else the email local-part, else the phone. Null for guests and
// signed-out — anonymous users carry empty-string email/phone, so guard those.
export function displayName(user?: User | null): string | null {
  if (!user || user.is_anonymous) return null;
  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
  const named = (meta.full_name || meta.name)?.trim();
  if (named) return named;
  if (user.email) return user.email.split('@')[0];
  if (user.phone) return user.phone;
  return null;
}

export function firstName(user?: User | null): string | null {
  const n = displayName(user);
  return n ? n.split(' ')[0] : null;
}

// App-wide auth session. Null = signed out.
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
