// Minimal geo helpers for dispatch. No deps.

// Haversine distance in km between two lat/lng points.
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

// Decode a geohash to its center lat/lng. Enough precision for city dispatch.
export function decodeGeohash(hash: string): { lat: number; lng: number } | null {
  if (!hash) return null;
  let latMin = -90, latMax = 90, lngMin = -180, lngMax = 180;
  let isLng = true;
  for (const ch of hash.toLowerCase()) {
    const idx = BASE32.indexOf(ch);
    if (idx === -1) return null;
    for (let bit = 4; bit >= 0; bit--) {
      const on = (idx >> bit) & 1;
      if (isLng) {
        const mid = (lngMin + lngMax) / 2;
        if (on) lngMin = mid; else lngMax = mid;
      } else {
        const mid = (latMin + latMax) / 2;
        if (on) latMin = mid; else latMax = mid;
      }
      isLng = !isLng;
    }
  }
  return { lat: (latMin + latMax) / 2, lng: (lngMin + lngMax) / 2 };
}
