import { supabase } from './supabase';

// The §8 event list, spelled out so a typo can't quietly create a new event.
export type EventName =
  | 'signup'
  | 'category_view'
  | 'booking_created'
  | 'dispatch_wave_sent'
  | 'offer_accepted'
  | 'offer_declined'
  | 'dispatch_failed'
  | 'swap_used'
  | 'arrival_verified'
  | 'booking_done'
  | 'payment_marked'
  | 'review_left'
  | 'waitlist_join';

// Fire and forget. Analytics must never break a flow or make the user wait, so
// failures are swallowed on purpose.
export function track(name: EventName, props: Record<string, unknown> = {}) {
  void (async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return; // RLS only accepts rows owned by a signed-in user
      // insert-only table, so it is deliberately absent from the generated types
      await supabase
        .from('analytics_events' as never)
        .insert({ user_id: data.user.id, name, props } as never);
    } catch {
      // dropped by design
    }
  })();
}
