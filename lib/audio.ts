import { supabase } from './supabase';

// Upload a recorded voice-intro clip to the public gallery bucket, return its
// public URL (stored in provider_profiles.voice_intro_url; the profile plays it).
export async function uploadVoiceIntro(uri: string): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('Not signed in');
  const bytes = await (await fetch(uri)).arrayBuffer();
  const path = `${uid}/voice-${Date.now()}.m4a`;
  const { error } = await supabase.storage
    .from('provider-gallery')
    .upload(path, bytes, { contentType: 'audio/m4a', upsert: false });
  if (error) throw error;
  return supabase.storage.from('provider-gallery').getPublicUrl(path).data.publicUrl;
}
