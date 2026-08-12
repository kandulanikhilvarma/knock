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

## P1 — Auth + roles  (backend blocked on SMS provider)
- [ ] Phone OTP UI + Supabase signInWithOtp · role choice · profile stubs
- [ ] **BLOCKED:** enable Phone provider in Supabase Auth + MSG91/2Factor SMS creds (no MCP for auth config — dashboard step)
- [ ] Day 3: EAS Android build + Play closed test (needs Expo account)

## P3 Dispatch · P4 Chat · P5 Verify+pay+reviews · P6 Onboarding+KYC · P7 Harden · P8 Ship
(see master-plan §9)

## Blocked on user (batched — I surface once)
- [ ] **SMS provider** (MSG91/2Factor account + key) + enable Supabase Phone auth → unblocks P1 login
- [ ] **Expo account** → I run `eas login`, cut Android build, start 14-day Play clock
- [ ] **App name** (§1) → locks bundle ID before first build

## Debt / cleanup
- [ ] `npm audit` — 21 vulns (7 mod, 14 high) from scaffold transitive deps. Review at P7, don't `--force` now.
- [ ] `expo-symbols` ships 7 font-weight modules via expo-router; only `regular` used. Upstream, not ours. P7.
