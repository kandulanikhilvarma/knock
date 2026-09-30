# Audit report — Knock (branch `enhance/2026-09-29`)

Scope: all 13 dimensions of the /enhance spec. Evidence comes from the repo only. The Supabase MCP rejected the credential, so all database findings are from the repo and are not checked against the live DB.

Raw reports: [raw/a11y-ux-visual.md](raw/a11y-ux-visual.md), [raw/security-prod.md](raw/security-prod.md). Baseline: [baseline.md](baseline.md).

## Scores (0–10)

| Dimension | Score | Main reason |
|---|---|---|
| Correctness | 5 | Realtime state hides refetched data. A dispatch failure leaves the booking stuck. The chat loses the draft if the send fails. |
| Security | 4 | The insert policy accepts forged booking status. A provider can set the Verified tier on their own profile. UPI IDs are public. |
| Performance | 5 | The root Ionicons import ships 19 icon fonts. `track()` makes a network call on each event. staleTime is 0. |
| Reliability | 4 | No global error sink. Many mutations fail with no message. |
| Tests | 2 | Only the dispatch engine has tests. No tests for geo, money format or validation. |
| CI / DX | 2 | No CI. No linter. A module-type warning on each test run. |
| Architecture | 6 | Clear `lib/` layer. The generated DB types are stale, and the code uses `as never` casts. |
| Accessibility | 3 | Invisible card titles (1.08:1). Muted text fails AA. Many controls have no role, label or state. |
| UX | 5 | Error text is raw backend text. Controls are disabled with no reason given. |
| Visual | 6 | Doorstep system in place. Some raw hex values. The Verified badge uses gold. |
| SEO (web preview) | 4 | No `+html.tsx`, so no description or theme colour. |
| Repo hygiene | 6 | README claims that are not true (Zustand, 21 migrations, Aadhaar + PAN). Two font packages are not used. |
| Production readiness | 3 | No privacy/terms pages. No security headers. No staging. DEMO_MODE is on in prod. |

## Findings from the lead review (correctness, reliability, perf, tests, DX, architecture, SEO, repo)

| ID | Sev | Evidence | Impact | Fix |
|---|---|---|---|---|
| COR-1 | P1 | `app/booking/[id].tsx`: `const booking = live ?? q.data` | After one realtime event, a refetch never shows again | Write realtime rows into the query cache |
| COR-2 | P1 | `lib/bookings.ts` `createBooking` throws when `runDispatch` fails, after the insert | Booking stays in `requested`. The user retries and makes a second booking | Return the id. Show "Try again" on the booking screen |
| COR-3 | P1 | `app/chat/[bookingId].tsx:49-53` clears the draft before the send, with no catch | A failed send loses the message | try/catch, put the draft back |
| COR-4 | P2 | `app/booking/new.tsx` updates `photos` after the insert. No UPDATE policy exists | Photos are never saved. The error is not read | Upload first, then insert with photos |
| REL-1 | P1 | `app/_layout.tsx` `new QueryClient()` with no defaults | Query and mutation errors do not go to Sentry | QueryCache/MutationCache `onError` → Sentry |
| REL-2 | P2 | `components/StateView.tsx` Loading `Animated.loop` has no stop | The loop runs after unmount | Stop on cleanup |
| PERF-1 | P2 | `import { Ionicons } from '@expo/vector-icons'` in 28 files | 19 icon font families in `dist` | Import `@expo/vector-icons/Ionicons` |
| PERF-2 | P2 | `lib/analytics.ts` calls `supabase.auth.getUser()` for each event | One network call for each tracked event | Use `getSession()` (local) |
| PERF-3 | P3 | staleTime 0 | Refetch on each mount | 30 s default |
| TST-1 | P1 | No tests for `lib/geo.ts`, `formatINR` or UPI validation | Money and distance errors go unseen | Pure unit tests |
| DX-1 | P1 | No `.github/workflows` | Nothing checks a PR | CI: tsc + tests |
| DX-2 | P3 | MODULE_TYPELESS warning on `npm run test:dispatch` | Noise | Add a package.json `type` field only if safe (see backlog) |
| ARCH-1 | P3 | `@expo-google-fonts/fraunces`, `playfair-display` not imported | Dead deps | Remove |
| ARCH-2 | P3 | `lib/database.types.ts` stale; `'city_stats' as never` | Type holes | Regenerate (blocked: Supabase credential) |
| SEO-1 | P3 | No `app/+html.tsx` | No meta description or theme colour on web | Add `+html.tsx` |
| REPO-1 | P2 | README: "Zustand + React Query", "21 migrations", "Aadhaar + PAN" | Wrong claims | Correct the README |

## Findings from the specialist reviews

Security and production: SEC-1…SEC-14, RULE-1…RULE-17, PRD-1…PRD-7. See [raw/security-prod.md](raw/security-prod.md).

Accessibility, UX and visual: VIS-1…VIS-7, A11Y-1…A11Y-12, UX-1…UX-16. See [raw/a11y-ux-visual.md](raw/a11y-ux-visual.md).

Overlaps that were merged: UX-1 = COR-3, UX-2 = COR-4, RULE-5 = COR-4, RULE-11 = ARCH-1, RULE-2 ≈ UX-5, PRD-7 ⊂ VIS-4, RULE-14 ⊂ VIS-7.

## P0 list

1. VIS-1: invisible titles on the verify, pay and review cards.
2. SEC-1: forged booking status on insert.
3. SEC-2 / RULE-1: a provider can set the Verified tier on their own profile.
4. PRD-1: no privacy, terms or grievance pages (blocked: legal text).

## Clean areas

- `.env` is not tracked.
- No secrets in the 99 commits of history.
- `service_role` is used only in Edge Functions.
- RLS is on for every table.
- All Edge Functions check the JWT.
- No localStorage.
- No payment collection and no price cap.
- i18n parity: 326/326/326 keys.
