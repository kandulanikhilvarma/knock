# Backlog — /enhance 2026-09-29

Score = Impact (1–5) × Confidence (0.5–1) ÷ Effort (1–5). Order: P0 first, then the highest score. Status: TODO · DONE · PARKED · REJECTED.

Source IDs refer to [AUDIT_REPORT.md](AUDIT_REPORT.md) and the raw reports.

## Fixes and hardening

| ID | Source | Pri | I | C | E | Score | Item | Success check | Status |
|---|---|---|---|---|---|---|---|---|---|
| B01 | VIS-1 | P0 | 5 | 1 | 1 | 5.0 | Verify/pay/review card titles use ink on light cards | Title contrast ≥ 4.5:1 in the web preview | TODO |
| B02 | SEC-1, SEC-2, SEC-12, SEC-11 | P0 | 5 | 0.8 | 2 | 2.0 | Migration 0023: pin server columns on booking insert, lock `verify_tier`, create `provider_stats` on signup, time-bound phone reveal | SQL file reviewed; applying it is PARKED (deploy) | TODO |
| B03 | DX-1 | P1 | 4 | 1 | 1 | 4.0 | CI workflow: install, tsc, tests | Workflow runs on the PR | TODO |
| B04 | A11Y-1, A11Y-2, A11Y-3 | P1 | 4 | 1 | 1 | 4.0 | Token contrast: inkMuted, danger, goldDeep; stars | Computed ratios ≥ 4.5 (text) / ≥ 3 (icons) | TODO |
| B05 | COR-3 / UX-1 | P1 | 4 | 1 | 1 | 4.0 | Chat keeps the draft when a send fails | tsc; code path restores draft in catch | TODO |
| B06 | RULE-2, UX-5 | P1 | 4 | 0.9 | 1 | 3.6 | Honest trust copy (no Aadhaar + PAN claim), role line from data | No "Aadhaar" claim in en/te/hi; screenshot | TODO |
| B07 | UX-9 | P2 | 3 | 1 | 1 | 3.0 | ErrorState gets `onRetry` on the screens that lack it | Grep: each ErrorState has onRetry | TODO |
| B08 | VIS-3, VIS-4, PRD-7 | P2 | 3 | 1 | 1 | 3.0 | Verified badge on success tint; raw hex → tokens; adaptive icon `#0F3A2C` | Grep for raw hex in app/components | TODO |
| B09 | UX-14, RULE-15 | P2 | 3 | 1 | 1 | 3.0 | Hardcoded UI strings → locale keys (en/te/hi) | Key parity script; grep | TODO |
| B10 | A11Y-8 | P2 | 3 | 1 | 1 | 3.0 | Tap targets ≥ 44 px | Style values | TODO |
| B11 | PRD-4 | P1 | 3 | 0.9 | 1 | 2.7 | Security headers in `vercel.json` (no CSP yet) | JSON valid; header list | TODO |
| B12 | SEC-9 | P2 | 3 | 0.9 | 1 | 2.7 | UPI ID regex; `https` allowlist for `voice_intro_url` | Unit test | TODO |
| B13 | TST-1 | P1 | 4 | 1 | 2 | 2.0 | Unit tests: geo, `formatINR`, UPI validation | Tests pass | TODO |
| B14 | ARCH-1, RULE-11 | P3 | 2 | 1 | 1 | 2.0 | Remove unused font packages | Build passes; grep | TODO |
| B15 | PERF-2, PERF-3 | P2 | 2 | 1 | 1 | 2.0 | `track()` uses `getSession`; query staleTime 30 s | tsc | TODO |
| B16 | COR-1 | P1 | 4 | 0.9 | 2 | 1.8 | Realtime writes into the query cache | tsc; code review | TODO |
| B17 | COR-2 | P1 | 4 | 0.9 | 2 | 1.8 | Booking survives a dispatch failure; "Try again" on `requested` | tsc; locale keys | TODO |
| B18 | REL-1, UX-4 | P1 | 4 | 0.9 | 2 | 1.8 | Global query/mutation error sink → Sentry; localized error text | Unit test for `errorMessage` | TODO |
| B19 | UX-3 | P1 | 4 | 0.9 | 2 | 1.8 | Booking-screen mutations show an error | tsc | TODO |
| B20 | A11Y-5, A11Y-6, A11Y-7 | P1 | 4 | 0.9 | 2 | 1.8 | Labels on icon buttons and inputs; selected/checked state | Accessibility tree in preview | TODO |
| B21 | SEO-1 | P3 | 2 | 0.9 | 1 | 1.8 | `app/+html.tsx`: lang, description, theme colour | `dist/index.html` has the meta tags | TODO |
| B22 | SEC-4 | P1 | 4 | 0.7 | 2 | 1.4 | Accept URL session tokens only on the auth-callback path | tsc; code review | TODO |
| B23 | PERF-1 | P2 | 3 | 0.9 | 2 | 1.35 | Ionicons per-family import | Font count in `dist` | TODO |
| B24 | A11Y-9, REL-2 | P2 | 3 | 0.9 | 2 | 1.35 | Shared reduced-motion hook; stop the Loading loop | tsc | TODO |
| B25 | COR-4, RULE-5 | P2 | 3 | 0.8 | 2 | 1.2 | Photos upload before insert, sent in the insert | tsc; storage path policy check | TODO |
| B26 | VIS-7, RULE-14 | NIT | 1 | 1 | 1 | 1.0 | Remove unused `Text` imports and stale token comments | tsc | TODO |
| B27 | A11Y-4 | P1 | 3 | 0.9 | 3 | 0.9 | `accessibilityRole` on Pressables | Grep count | TODO |

## New features (max 5)

| ID | Source | I | C | E | Score | Feature | Success check | Status |
|---|---|---|---|---|---|---|---|---|
| F1 | UX-11 | 3 | 0.9 | 1 | 2.7 | Hint line under a disabled submit that says what is missing | Screenshot | TODO |
| F2 | UX-16 | 2 | 1 | 1 | 2.0 | Dates follow the app language | tsc | TODO |
| F3 | UX-13 | 2 | 0.9 | 1 | 1.8 | Plural forms for count strings | Key parity | TODO |
| F4 | UX-10 | 2 | 0.9 | 1 | 1.8 | Earnings skeleton while loading | Screenshot | TODO |
| F5 | COR-2 | 3 | 0.9 | 2 | 1.35 | "Try again" dispatch button on a stuck booking (part of B17) | tsc | TODO |

## Parked and blocked (see BLOCKERS.md)

| Source | Reason |
|---|---|
| PRD-1 | Privacy, terms and grievance text needs legal input |
| SEC-3 / RULE-3 | UPI column revoke needs an RPC and a live-DB check |
| SEC-5 | Captcha and rate limits are dashboard settings |
| PRD-2 | Consent flow needs a policy decision |
| PRD-5 | Staging needs a second Supabase project (account action) |
| UX-6 | "Request this pro" is a product decision |
| UX-7 | Needs the real domain |
| RULE-17 | `price_agreed` capture is a product decision |
| RULE-10 | Dep pinning policy is a decision (35 of 44 use ^ or ~) |
| ARCH-2 | Type regeneration needs a working Supabase credential |
| VIS-2, A11Y-12 | Palette changes beyond contrast need design sign-off |
| SEC-6, SEC-7, SEC-8, SEC-10, SEC-13, SEC-14, PRD-3, RULE-6, RULE-8 | Edge Function or DB changes: need a deploy to take effect; left for a follow-up run |
| UX-8 | Dispatch cancel needs a server RPC |
