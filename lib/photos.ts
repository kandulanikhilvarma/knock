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

// One square profile photo. Editing is forced on so the crop is a real 1:1 head
// shot — a provider's face is the trust signal customers judge before booking.
// ponytail: library only; add a camera branch when providers ask for it.
export async function pickAvatar(): Promise<PickedPhoto | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Photo access denied');
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
    base64: true,
  });
  if (res.canceled) return null;
  const a = res.assets[0];
  return a?.base64 ? { uri: a.uri, base64: a.base64 } : null;
}

// Profile photo → public bucket, stable URL, stored on provider_profiles.photo_url.
// upsert:true so re-uploading replaces the old face instead of orphaning files.
export async function uploadAvatar(photo: PickedPhoto): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('Not signed in');
  const bytes = Uint8Array.from(atob(photo.base64), (c) => c.charCodeAt(0));
  const path = `${uid}/avatar.jpg`;
  const { error } = await supabase.storage
    .from('provider-gallery')
    .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  // Cache-bust so a replaced photo shows immediately instead of the stale one.
  const base = supabase.storage.from('provider-gallery').getPublicUrl(path).data.publicUrl;
  return `${base}?v=${Date.now()}`;
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
