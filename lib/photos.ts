import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

export type PickedPhoto = { uri: string; base64: string };

// Pick up to `limit` images from the library. Base64 comes back inline so we can
// upload without expo-file-system. Returns [] if the user cancels.
export async function pickImages(limit = 5): Promise<PickedPhoto[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Photo access denied');
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.5,
    base64: true,
  });
  if (res.canceled) return [];
  return res.assets
    .filter((a) => a.base64)
    .map((a) => ({ uri: a.uri, base64: a.base64! }));
}

// Upload picked photos under job-photos/<uid>/<folder>/<ts>.jpg. Returns storage
// paths (store these in bookings.photos / provider_profiles work gallery).
export async function uploadPhotos(folder: string, photos: PickedPhoto[]): Promise<string[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('Not signed in');
  const paths: string[] = [];
  for (const p of photos) {
    const bytes = Uint8Array.from(atob(p.base64), (c) => c.charCodeAt(0));
    const path = `${uid}/${folder}/${Date.now()}-${paths.length}.jpg`;
    const { error } = await supabase.storage
      .from('job-photos')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    paths.push(path);
  }
  return paths;
}

// Signed URL for a private photo path (1h). Bad paths return null, never throw.
export async function signedPhotoUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from('job-photos').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

// Provider work gallery lives in a PUBLIC bucket so any customer can see it.
// Returns stable public URLs to store directly in provider_profiles.work_photos.
export async function uploadGalleryPhotos(photos: PickedPhoto[]): Promise<string[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('Not signed in');
  const urls: string[] = [];
  for (const p of photos) {
    const bytes = Uint8Array.from(atob(p.base64), (c) => c.charCodeAt(0));
    const path = `${uid}/${Date.now()}-${urls.length}.jpg`;
    const { error } = await supabase.storage
      .from('provider-gallery')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    urls.push(supabase.storage.from('provider-gallery').getPublicUrl(path).data.publicUrl);
  }
  return urls;
}
