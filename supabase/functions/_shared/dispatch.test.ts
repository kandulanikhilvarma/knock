// Runnable check for the dispatch engine — no framework, just assert.
//   node --experimental-strip-types lib/dispatch.test.ts
// Simulates 20 providers and asserts wave behavior, quota fills, timeouts.
import assert from 'node:assert';
import { planDispatch, scoreCandidate, CONFIG, type Candidate } from './dispatch.ts';

const now = Date.parse('2026-08-13T12:00:00Z');
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

// 20 fake providers: mix of veterans, newcomers, near, far, one beyond cap.
const providers: Candidate[] = Array.from({ length: 20 }, (_, i) => ({
  providerId: `p${i}`,
  ratingAvg: i < 15 ? 3.5 + (i % 5) * 0.3 : null, // last 5 are new (no ratings)
  acceptanceRate: i < 15 ? 0.6 + (i % 4) * 0.1 : null,
  completionRate: i < 15 ? 0.7 + (i % 3) * 0.1 : null,
  jobsDone: i < 15 ? 20 + i : i - 15, // p15..p19 are newcomers (0–4 jobs)
  lastActiveAt: daysAgo(i % 10),
  distanceKm: i === 19 ? 40 : 1 + (i % 12), // p19 is beyond the 15km cap
  verified: i % 6 === 0,
}));

const plan = planDispatch(providers, CONFIG, now);

// Beyond-cap provider excluded.
assert.ok(!plan.scored.some((c) => c.providerId === 'p19'), 'p19 (40km) must be filtered out');
assert.strictEqual(plan.scored.length, 19, 'exactly 19 within cap');

// Wave sizes and timeout windows exact.
const w1 = plan.waves.find((w) => w.wave === 1)!;
const w2 = plan.waves.find((w) => w.wave === 2)!;
assert.strictEqual(w1.providerIds.length, 3, 'wave 1 = 3');
assert.strictEqual(w1.windowSec, 90, 'wave 1 window 90s');
assert.strictEqual(w2.providerIds.length, 5, 'wave 2 = 5');
assert.strictEqual(w2.windowSec, 120, 'wave 2 window 120s');

// No provider appears in both waves.
const overlap = w1.providerIds.filter((id) => w2.providerIds.includes(id));
assert.strictEqual(overlap.length, 0, 'no overlap between waves');

// Fairness quota: at least one newcomer pinged in wave 1.
const newcomerIds = new Set(plan.scored.filter((c) => c.isNewcomer).map((c) => c.providerId));
const newcomersInW1 = w1.providerIds.filter((id) => newcomerIds.has(id));
assert.ok(newcomersInW1.length >= 1, 'wave 1 reserves >=1 newcomer slot');
assert.strictEqual(plan.quotaFilled, newcomersInW1.length, 'quotaFilled matches');

// Score ordering sanity: identical provider closer beats farther.
const near = scoreCandidate({ ...providers[0], distanceKm: 1 }, CONFIG, now);
const far = scoreCandidate({ ...providers[0], distanceKm: 14 }, CONFIG, now);
assert.ok(near > far, 'nearer scores higher, all else equal');

// New provider gets neutral priors, never a zero score.
const brandNew = scoreCandidate(
  { providerId: 'x', ratingAvg: null, acceptanceRate: null, completionRate: null, jobsDone: 0, lastActiveAt: null, distanceKm: 5, verified: false },
  CONFIG,
  now,
);
assert.ok(brandNew > 0.3, `new provider not zeroed (got ${brandNew.toFixed(3)})`);

// Verified nudges score above an otherwise-identical unverified provider.
const base = { providerId: 'v', ratingAvg: 4, acceptanceRate: 0.8, completionRate: 0.8, jobsDone: 30, lastActiveAt: daysAgo(1), distanceKm: 3, verified: false };
assert.ok(
  scoreCandidate({ ...base, verified: true }, CONFIG, now) > scoreCandidate(base, CONFIG, now),
  'verified bonus applies',
);

// Empty input → fallback to browse list, no waves.
const empty = planDispatch([], CONFIG, now);
assert.strictEqual(empty.fallback, true, 'no candidates → fallback');
assert.strictEqual(empty.waves.length, 0, 'no waves when empty');

// All beyond cap → also fallback.
const allFar = planDispatch(providers.map((p) => ({ ...p, distanceKm: 99 })), CONFIG, now);
assert.strictEqual(allFar.fallback, true, 'all beyond cap → fallback');

console.log('dispatch.test.ts — all assertions passed');
