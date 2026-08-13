import { supabase } from './supabase';
import type { Database } from './database.types';

export type Message = Database['public']['Tables']['messages']['Row'];

export async function getMessages(bookingId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(bookingId: string, body: string) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('not signed in');
  const { error } = await supabase
    .from('messages')
    .insert({ booking_id: bookingId, sender_id: uid, body: body.trim() });
  if (error) throw error;
}

// Realtime: fire cb on every new message in this booking's thread.
export function subscribeMessages(bookingId: string, cb: (m: Message) => void) {
  const ch = supabase
    .channel(`messages:${bookingId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
      (payload) => cb(payload.new as Message),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(ch);
  };
}

// Threads = my bookings that have an assigned pro (someone to talk to).
export type Thread = Database['public']['Tables']['bookings']['Row'];
export async function getMyThreads(): Promise<Thread[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .not('assigned_provider_id', 'is', null)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
