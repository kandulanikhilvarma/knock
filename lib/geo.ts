// Web-Mercator / slippy-tile math + geohash decode. No dependency, no API key:
// the map is raster tiles positioned by projection, same as any map library
// does under the hood.

export type LatLng = { lat: number; lng: number };

export const TILE = 256;

// lat/lng → world pixel at a zoom level (origin top-left, 256px tiles).
export function project({ lat, lng }: LatLng, zoom: number): { x: number; y: number } {
  const n = TILE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n;
  const s = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n;
  return { x, y };
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

// Provider location is stored as a geohash (area-level, not a house address).
export function decodeGeohash(hash: string | null): LatLng | null {
  if (!hash) return null;
  let latMin = -90,
    latMax = 90,
    lngMin = -180,
    lngMax = 180,
    isLng = true;
  for (const ch of hash.toLowerCase()) {
    const idx = BASE32.indexOf(ch);
    if (idx === -1) return null;
    for (let bit = 4; bit >= 0; bit--) {
      const on = (idx >> bit) & 1;
      if (isLng) {
        const mid = (lngMin + lngMax) / 2;
        if (on) lngMin = mid;
        else lngMax = mid;
      } else {
        const mid = (latMin + latMax) / 2;
        if (on) latMin = mid;
        else latMax = mid;
      }
      isLng = !isLng;
    }
  }
  return { lat: (latMin + latMax) / 2, lng: (lngMin + lngMax) / 2 };
}

// Vijayawada, Benz Circle — the fallback centre when location is denied.
export const CITY_CENTER: LatLng = { lat: 16.4977, lng: 80.656 };
