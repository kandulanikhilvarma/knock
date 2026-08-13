// Dispatch engine — master plan §6-2a. Build exactly this, resist cleverness.
// Pure functions only (no Supabase import) so the Edge Function and the unit
// test share one implementation. All offer state lives in `dispatch_offers`;
// this module decides WHO to ping and WHEN, nothing else.

export type Candidate = {
  providerId: string;
  ratingAvg: number | null; // 0–5, null = no ratings yet
  acceptanceRate: number | null; // 0–1
  completionRate: number | null; // 0–1
  jobsDone: number;
  lastActiveAt: string | null; // ISO; null = never
  distanceKm: number;
  verified: boolean;
};

export type ScoredCandidate = Candidate & { score: number; isNewcomer: boolean };

export type Wave = { wave: 1 | 2; providerIds: string[]; windowSec: number };

export type DispatchPlan = {
  waves: Wave[];
  scored: ScoredCandidate[]; // within cap, score desc
  fallback: boolean; // true = nobody to ping, show browse list
  quotaFilled: number; // newcomer slots actually taken in wave 1 (log this)
};

// Tunables — a knob the real world needs, not a magic number to inline.
export const CONFIG = {
  distanceCapKm: 15,
  wave1Size: 3,
  wave1WindowSec: 90,
  wave2Size: 5,
  wave2WindowSec: 120,
  newcomerJobsThreshold: 5, // <5 completed jobs = newcomer
  quotaFraction: 0.2, // ~20% of wave-1 slots reserved for newcomers
  neutralPrior: 0.5, // new providers never zeroed out
  verifiedBonus: 0.03, // small score nudge; never bypasses safety
  recencyHalflifeDays: 7,
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Weighted composite, all factors normalized 0–1. Nulls fall back to the
// neutral 0.5 prior. Verified adds a small bonus (§6-2a "Verified Pro effect").
export function scoreCandidate(c: Candidate, cfg = CONFIG, now = Date.now()): number {
  const p = cfg.neutralPrior;
  const ratingNorm = c.ratingAvg == null ? p : clamp01(c.ratingAvg / 5);
  const distanceDecay = clamp01(1 - c.distanceKm / cfg.distanceCapKm);
  const acceptance = c.acceptanceRate == null ? p : clamp01(c.acceptanceRate);
  const completion = c.completionRate == null ? p : clamp01(c.completionRate);
  const recency = recencyNorm(c.lastActiveAt, cfg, now);

  const base =
    0.3 * ratingNorm +
    0.25 * distanceDecay +
    0.2 * acceptance +
    0.15 * completion +
    0.1 * recency;

  return clamp01(base + (c.verified ? cfg.verifiedBonus : 0));
}

// Exponential decay on days since last activity; null → neutral prior.
function recencyNorm(lastActiveAt: string | null, cfg: typeof CONFIG, now: number): number {
  if (!lastActiveAt) return cfg.neutralPrior;
  const days = (now - new Date(lastActiveAt).getTime()) / 86_400_000;
  if (!Number.isFinite(days) || days < 0) return cfg.neutralPrior;
  return Math.pow(2, -days / cfg.recencyHalflifeDays);
}

// Score desc; verified wins ties, then nearer wins. Deterministic.
function byScore(a: ScoredCandidate, b: ScoredCandidate): number {
  if (b.score !== a.score) return b.score - a.score;
  if (a.verified !== b.verified) return a.verified ? -1 : 1;
  return a.distanceKm - b.distanceKm;
}

// The whole plan: filter to cap, score, reserve the newcomer quota in wave 1,
// then fill by score. Wave 2 is the next 5. Empty plan → fallback to browse.
export function planDispatch(
  candidates: Candidate[],
  cfg = CONFIG,
  now = Date.now(),
): DispatchPlan {
  const scored: ScoredCandidate[] = candidates
    .filter((c) => c.distanceKm <= cfg.distanceCapKm)
    .map((c) => ({
      ...c,
      score: scoreCandidate(c, cfg, now),
      isNewcomer: c.jobsDone < cfg.newcomerJobsThreshold,
    }))
    .sort(byScore);

  if (scored.length === 0) {
    return { waves: [], scored, fallback: true, quotaFilled: 0 };
  }

  // Reserve ~20% of wave-1 slots for newcomers, nearest-first among them.
  const newcomers = scored.filter((c) => c.isNewcomer).sort((a, b) => a.distanceKm - b.distanceKm);
  const quotaSlots = newcomers.length > 0 ? Math.max(1, Math.round(cfg.wave1Size * cfg.quotaFraction)) : 0;
  const reserved = newcomers.slice(0, quotaSlots);
  const reservedIds = new Set(reserved.map((c) => c.providerId));

  // Fill the rest of wave 1 by score, skipping already-reserved providers.
  const wave1Fill = scored
    .filter((c) => !reservedIds.has(c.providerId))
    .slice(0, cfg.wave1Size - reserved.length);
  const wave1 = [...reserved, ...wave1Fill];
  const wave1Ids = new Set(wave1.map((c) => c.providerId));

  const wave2 = scored.filter((c) => !wave1Ids.has(c.providerId)).slice(0, cfg.wave2Size);

  const waves: Wave[] = [];
  if (wave1.length > 0) {
    waves.push({ wave: 1, providerIds: wave1.map((c) => c.providerId), windowSec: cfg.wave1WindowSec });
  }
  if (wave2.length > 0) {
    waves.push({ wave: 2, providerIds: wave2.map((c) => c.providerId), windowSec: cfg.wave2WindowSec });
  }

  return { waves, scored, fallback: waves.length === 0, quotaFilled: reserved.length };
}
