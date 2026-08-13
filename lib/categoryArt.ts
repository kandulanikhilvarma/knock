// Category imagery — one place to swap the whole set later (Supabase Storage or
// bundled assets = change these URLs only; screens read `categoryPhoto(slug)`).
// Curated professional trade photos (Unsplash CDN, free to hotlink). Each has a
// branded icon fallback in CategoryImage if the photo can't load.

const UNSPLASH: Record<string, string> = {
  electrician: 'photo-1621905251189-08b45d6a269e',
  plumber: 'photo-1607472586893-edb57bdc0e39',
  ac_appliance: 'photo-1581092160607-ee22621dd758',
  carpenter: 'photo-1504148455328-c376907d081c',
  painter: 'photo-1562259949-e8e7689d7828',
  cleaning: 'photo-1581578731548-c64695cc6952',
  pest_control: 'photo-1632829882891-5047ccc421bc',
  two_wheeler: 'photo-1558981403-c5f9899a28bc',
  cctv: 'photo-1557324232-b8917d3c3dcb',
  tutor: 'photo-1522202176988-66273c2fd55f',
  fitness: 'photo-1571019613454-1cb2f99b2d8b',
  beautician: 'photo-1560066984-138dadb4c035',
};

// w sized for the largest on-screen use (retina grid tile / hero band).
export function categoryPhoto(slug: string, w = 640): string | null {
  const id = UNSPLASH[slug];
  if (!id) return null;
  return `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;
}
