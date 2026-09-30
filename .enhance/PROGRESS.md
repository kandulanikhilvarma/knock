# Progress — /enhance 2026-09-29

Branch `enhance/2026-09-29`. The plan is the order in [BACKLOG.md](BACKLOG.md).

## Checkpoint 1 (after B13)

| ID | Commit | Verification observed |
|---|---|---|
| — | c9179b9 | Phase 0–3 reports |
| B01 | 91d0df7 | tsc; ink on surface 17.31:1 (was 1.08:1). No screenshot: needs a prod booking in `assigned` |
| B02 | ada6105 | PGlite: 7 of 14 checks fail on 0001–0022, 14/14 pass with 0023. Not applied to prod |
| B03 | 8764183 | Lockfile in sync (`npm ls`), YAML parses. First real run: after push |
| B04 | ca9cfd2 | Computed ratios; web export shows muted text as rgb(103, 99, 90) = `#67635A` |
| B05 | b3905f1 | tsc; key parity 327/327/327. No runtime test (no RN test runner) |
| B06 | 64b918e | tsc; parity; Telugu home shows the new pillar copy (page text) |
| B07 | 1774f17 | Grep: every `ErrorState` has `onRetry` |
| B08 | 21ad304 | tsc; no solid raw hex left in app/components (DoorstepScene art excepted); new pairs ≥ 5:1 |
| B09 | 5c38ca7 | tsc; parity 330/330/330 |
| B10 | cf46517 | tsc; style values |
| B11 | 0fbd3a9 | JSON parses. Live headers need a Vercel deploy (not done) |
| B12 | 0998622 | `lib/validate.test.ts`; old check accepted 9/9 bad IDs; PGlite 0024 checks 18/18. The harness caught an invalid PG regex bound (`{2,256}`) before it shipped |
| B13 | d53fc89 | `npm run check`: tsc + 4 test files pass; new test caught `formatINR(-850)` → `-,850` |

New finding during work: after the 0017 auto-pause, a provider can set `availability_status` back to `available` themselves (no server rule stops it). Logged for BLOCKERS as a product/DB decision.

Screenshots: the Browser pane stopped drawing (window hidden), so later checks use DOM reads until it draws again.

## Checkpoint 2 (after B28, end of run)

| ID | Commit | Verification observed |
|---|---|---|
| B14 | 94554aa | Web export passes; no import of the two font packages |
| B15 | 95a4b45 | tsc |
| B16 | e5da462 | tsc; code review of the realtime → cache path |
| B17, F5 | fb3a0f7 | tsc; parity. No runtime test: needs a prod booking |
| B18 | 8fb01e0 | `lib/errors.test.ts`. Live on 2026-09-30: Supabase DNS failed on this machine, and the Telugu home showed the offline line, not "Failed to fetch" (`screens/after/home-te-offline.jpg`) |
| B19 | 508a54a | tsc |
| B20 | 7ee7153 | Web export DOM: `aria-selected=true` on తె, `false` on EN and हि; tab bar exposes `tab` + selected |
| B21 | 459f2d2 | `dist/index.html` has description, theme-color and OG tags |
| B22 | 931b2e3 | `lib/validate.test.ts` covers `isTrustedAuthRedirect` |
| B23 | bbff085 | Icon fonts in `dist`: 19 (4.08 MB) → 1 (0.39 MB) |
| B24 | 59247ad | tsc |
| B25 | 2c6c4bc | `lib/ids.test.ts`; PGlite: 1 fail on 0024, 22/22 pass with 0025 |
| B26 | 8c486b0 | tsc; grep: no unused `Text` import left (AppText's `Text as RNText` is used) |
| B27 | dbb71b0 | 47 roles added. Web export DOM: 0 focusable elements without a role on welcome and home |
| F1 | 3893b88 | tsc; parity 349. No screenshot: the screens need sign-in (BL-10) |
| F2 | 5edbee2 | Test: en "3 Sept 2026", te "3, సెప్టెం 2026", hi "3 सित॰ 2026" |
| F3 | f4e3a79 | i18next resolves en "1 job" / "4 jobs", te "1 పని" / "4 పనులు"; parity 360 |
| F4 | 3175e19 | tsc. No screenshot: the screen needs sign-in (BL-10) |
| B28 | dc03729 | Found in Phase 6 screenshots. Computed icon colour rgb(143, 80, 41); icon visible (`home-te-trust.jpg`) |
| docs | f2ff27b | README claims checked against package.json, migrations and code |

## Before → after

| Measure | Before | After |
|---|---|---|
| CI | none | GitHub Actions: `npm ci`, tsc, tests on push to main and on PRs |
| Test files | 1 (dispatch) | 6 (errors, format, geo, ids, validate, dispatch) |
| RLS checks | 0 | 22 in `rls-check.mjs` (7 of 14 fail on the old schema) |
| Clients can insert a paid/done booking | yes | no (0023) |
| Pro can set own Verified tier | yes | no (0023) |
| Pro can see job photos | no (photos never saved) | yes (B25 + 0025) |
| Card title contrast (verify/pay/review) | 1.08:1 | 17.31:1 |
| Muted text on paper | 3.90:1 | 4.85:1 |
| Danger text on paper | 4.04:1 | 5.15:1 |
| Raw Pressables without a role | 47 | 0 |
| Locale keys (en = te = hi) | 326 | 360 |
| `entry-*.js` raw | 3,548,603 B | 3,146,377 B (−11%) |
| `entry-*.js` gzip | 950,969 B | 822,493 B (−14%) |
| `dist/` total | 22 MB | 18 MB |
| Icon fonts shipped | 19 | 1 |
| Security headers | none | 6 in `vercel.json` (live after deploy) |
