// node --experimental-strip-types lib/geo.test.ts
import assert from 'node:assert';
import { project, distanceKm, decodeGeohash, TILE, CITY_CENTER } from './geo.ts';

const near = (a: number, b: number, eps: number, msg: string) =>
  assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} vs ${b}`);

// distanceKm: zero, symmetric, one degree of latitude ≈ 111.19 km (R = 6371).
assert.strictEqual(distanceKm(CITY_CENTER, CITY_CENTER), 0);
const vizag = { lat: 17.6868, lng: 83.2185 };
near(distanceKm(CITY_CENTER, vizag), distanceKm(vizag, CITY_CENTER), 1e-9, 'symmetric');
near(distanceKm({ lat: 16, lng: 80 }, { lat: 17, lng: 80 }), 111.19, 0.01, '1° latitude');
// Vijayawada → Visakhapatnam is about 300 km as the crow flies.
near(distanceKm(CITY_CENTER, vizag), 300, 15, 'Vijayawada → Vizag');

// decodeGeohash: the Wikipedia example, bad input, case.
const g = decodeGeohash('ezs42')!;
near(g.lat, 42.605, 0.03, 'ezs42 lat');
near(g.lng, -5.603, 0.03, 'ezs42 lng');
assert.deepStrictEqual(decodeGeohash('EZS42'), g, 'case-insensitive');
assert.strictEqual(decodeGeohash(null), null);
assert.strictEqual(decodeGeohash(''), null);
assert.strictEqual(decodeGeohash('ezs4a'), null, "'a' is not a geohash digit");

// project: zoom 0 is one 256 px tile; (0,0) is its centre, lng -180 its left edge.
assert.deepStrictEqual(project({ lat: 0, lng: 0 }, 0), { x: TILE / 2, y: TILE / 2 });
near(project({ lat: 0, lng: -180 }, 0).x, 0, 1e-9, 'left edge');
near(project({ lat: 0, lng: 0 }, 3).x, (TILE * 8) / 2, 1e-9, 'zoom scales by 2^z');
assert.ok(project({ lat: 60, lng: 0 }, 0).y < TILE / 2, 'north is up');

console.log('geo: ok');
