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
      // getSession reads local storage; getUser would add a network round trip
      // per event. RLS still checks user_id = auth.uid() on insert.
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid) return; // RLS only accepts rows owned by a signed-in user
      // insert-only table, so it is deliberately absent from the generated types
      await supabase
        .from('analytics_events' as never)
        .insert({ user_id: uid, name, props } as never);
    } catch {
      // dropped by design
    }
  })();
}
