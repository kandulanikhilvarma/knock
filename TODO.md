# TODO — build tracker

Phases per master-plan §9. One phase per session. App must run after every phase.

## P0 — Scaffold  ✅ (pending device verify)
- [x] create-expo-app, TypeScript, SDK 57
- [x] expo-router + tab shell (Home · Bookings · Chat · Profile)
- [x] i18n wired, en/te/hi locales, device-locale detection
- [x] design tokens from §5 (`theme/tokens.ts`)
- [x] fonts: Inter + Noto Sans Telugu + Noto Sans Devanagari
- [x] Supabase client (`lib/supabase.ts`) with placeholder env
- [ ] **Sentry** — deferred: needs a DSN (Sentry account). Wire no-op-if-unset.
- [ ] **Verify on real Android device** — Telugu layout render is the non-fakeable check
- [ ] Fill `.env` once Mumbai Supabase project exists

## Backend  ✅
- [x] Mumbai (ap-south-1) Supabase project created + `.env` wired
- [x] Core schema (categories, profiles, provider_profiles, provider_stats, waitlist) — RLS on all, advisors clean
- [x] 12 categories seeded (3 live A, 9 waitlist B) · 6 demo providers seeded
- [x] TS types generated → `lib/database.types.ts`

## P2 — Directory  ✅ (browse works with no auth — testable now)
- [x] Home: live category grid + coming-soon grid + ₹0 counter + language switcher
- [x] Category screen: provider list (live) / waitlist signup (coming-soon)
- [x] Provider profile: hero card, ₹0 ribbon, verify badge, sticky CTA
- [x] React Query wired · all screens have loading/error/empty states
- [ ] Real provider photos + voice-intro (needs onboarding, P6) — avatars for now

## P1 — Auth + roles  ✅ UI built (verify once test-OTP enabled)
- [x] Phone OTP flow: phone entry → OTP → role choice, Supabase signInWithOtp
- [x] Profile tab drives sign in/out; non-gating (browse stays open signed-out)
- [x] Schema recorded in-repo: `supabase/migrations/0001_init_core_schema.sql`
- [x] build-guard agent review passed (RLS on profiles verified owner-only)
- [ ] **BLOCKED to test:** Supabase → Auth → enable Phone provider + add a test number w/ fixed OTP (free, no SMS). Then login is testable on iPhone.
- [ ] Production SMS: MSG91/2Factor account + Supabase SMS hook
- [ ] Day 3: EAS Android build + Play closed test (needs Expo account)

## P3 — Dispatch + booking loop  ✅ (built + verified; live e2e blocked on auth)
- [x] Engine `supabase/functions/_shared/dispatch.ts` — score (0.30 rating +0.25 dist
      +0.20 accept +0.15 complete +0.10 recency), 20% newcomer quota, waves 3/5,
      neutral priors, verified bonus. Unit test (20 providers) green: `npm run test:dispatch`
- [x] migration 0002: bookings + dispatch_offers, RLS (offers server-write only)
- [x] Edge Functions ACTIVE: `dispatch` (score/quota/wave-1), `respond`
      (first-accept-wins, atomic claim), `swap` (one free re-dispatch)
- [x] migration 0003: `sweep_dispatch()` on pg_cron 30s → expire offers, stuck
      bookings → failed → browse fallback. Advisor-clean. Smoke-tested.
- [x] UI: request form, live status (realtime) + swap, provider job inbox +
      countdown, bookings tab list. booking/jobs strings en/te/hi.
- [ ] **BLOCKED to test live:** needs a signed-in customer + a signed-in provider
      (see auth blocker). Engine + sweep proven without auth.
- [ ] Wave-2 escalation (next 5) — deferred; sweep does timeout→fallback only.
      Add when wave-1 acceptance is thin. Marked `ponytail:` in dispatch fn.
- [ ] Push + WhatsApp offer alerts — deferred until Expo push tokens exist.

## P5 — Doorstep verify + UPI-direct pay + reviews  ✅ (built + verified live)
- [x] 0007: job_tokens (QR token + 4-digit PIN), reviews, provider upi_id,
      booking paid_at/pay_method. RLS: token readable only by assigned pro,
      reviews public, all writes server-only.
- [x] Edge Functions: verify-arrival (token/PIN check + GPS stamp, assigned→
      in_progress), job-action (done +jobs_done, paid), submit-review (gated
      after done, recomputes rating_avg). respond issues the token on accept.
- [x] UI: role-aware booking screen — provider QR+PIN + mark done/paid;
      customer verify→pay (UPI deep-link/QR)→review. Reviews on profile.
- [x] Guest (anonymous) sign-in wired; test accounts + customer@test.app.
- [x] E2E verified live: token issued, customer can't read token, wrong PIN
      rejected, verify→done→paid→review, double-review blocked, stats update.
- [ ] Camera QR scan (expo-camera) — deferred; PIN path is the tested one and
      works on web preview. Add scan for device builds.
- [ ] Expose customer name/phone to the assigned provider (§6-2b) — deferred;
      provider sees address now. Add an RLS policy at P6/P7.

## Advisor note (expected, not a regression)
Enabling anonymous sign-in makes the linter flag `auth_allow_anonymous_sign_ins`
on every RLS policy the `authenticated` role can hit. By design here: anonymous
= guest customer, own-row access only. P7: explicitly block anon from becoming a
provider (pp_insert_own) and audit which tables should exclude `is_anonymous`.

## P4 — Realtime chat  ✅ (built + verified live)
- [x] 0008: messages + participant helper (private schema). RLS: only the two
      participants read/write; outsiders blocked (verified). bookings + messages
      added to the realtime publication (status machine + chat both live).
- [x] UI: Chat tab lists active threads; thread screen (bubbles + send);
      entry from the booking screen. Strings en/te/hi.

## P6-lite — Provider onboarding + availability  ✅
- [x] provider-setup screen (services/UPI/city/charge/bio → upsert + role).
- [x] Availability toggle (available/busy/paused) on profile — feeds dispatch.
- [x] 0009: anonymous users blocked from provider registration (verified).
- [ ] KYC upload + vendor verification (P6-full) — needs a KYC vendor; manual
      review for now. Verified badge stays gated on a real check.

## Ship-readiness bits done this session
- [x] In-app account deletion (Apple 5.1.1(v)) — delete-account fn + profile.
- [x] Real Home earnings counter (0011 city_stats cache + trigger) — replaced a
      hardcoded figure; honest ₹0 pre-launch. Advisor ERROR-free.
- [x] Guest (anonymous) sign-in wired; anonymous now enabled on the project.

## Test accounts (password Testpro123!)
customer@test.app · providers: sureshbabu@ / naveenr@ (plumber, naveenr=newcomer)
· kiranm@ (electrician/ac) · ravikumar@ (electrician) · anilteja@ / praveenk@ (ac).
Or "Continue as guest" for an anonymous customer.

## Design overhaul — done this session (2026-08-14)
- [x] Dropped stock-photo category tiles (read cheap) → crafted icon-chip tiles on
      the ink/paper system (`components/CategoryGlyph`). Grounded in ui-ux-pro-max:
      Marketplace + Trust & Authority → restraint, not lifestyle photography.
- [x] Elevation scale (`shadow.card`/`shadow.soft`) + press feedback in tokens;
      applied to tiles, provider/trust cards, list rows, job + booking cards.
- [x] **Font fix:** every screen hardcoded the Telugu face, so English rendered in
      Noto Telugu. `components/AppText` remaps fontFamily to the active language at
      render (en→Inter, te→Noto Telugu, hi→Devanagari), weight preserved, mono kept.
      Swapped Text→AppText across all 22 screens/components. Verified: en = Inter.
- [x] Trust pillars on Home; booking-detail progress stepper; complete
      bookings/chat/profile tabs; icon-tile heroes on booking-new + coming-soon.
- [ ] Real-device Telugu render pass (non-fakeable, needs your eyes).

## P7 Harden · P8 Ship — remaining, mostly blocked on user
- [ ] Telugu layout audit on a real device (screenshot-verify — not headless).
- [ ] Push notifications (Expo tokens) · WhatsApp offer alerts · wave-2 escalation.
- [ ] Expose customer name/phone to the assigned provider (RLS).
- Blocked on user: SMS provider (phone OTP) · Expo+Apple/Play accounts (builds) ·
  KYC vendor · Sentry DSN · app name (locks bundle id).

## Blocked on user (batched — I surface once)
- [ ] **SMS provider** (MSG91/2Factor account + key) + enable Supabase Phone auth → unblocks P1 login
- [ ] **Expo account** → I run `eas login`, cut Android build, start 14-day Play clock
- [ ] **App name** (§1) → locks bundle ID before first build

## Debt / cleanup
- [ ] `npm audit` — 21 vulns (7 mod, 14 high) from scaffold transitive deps. Review at P7, don't `--force` now.
- [ ] `expo-symbols` ships 7 font-weight modules via expo-router; only `regular` used. Upstream, not ours. P7.
