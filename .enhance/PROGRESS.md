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
