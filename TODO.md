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

## P1 — Auth + roles (day 3–5)
- [ ] Phone OTP flow (MSG91/2Factor) · role choice (customer/provider) · profile stubs
- [ ] **Day 3: cut an Android EAS build, create Play closed test, recruit 15–18 testers** (14-day clock)

## P2 — Directory · P3 — Dispatch engine · P4 — Chat · P5 — Verification + payment + reviews
## P6 — Provider onboarding + KYC · P7 — Hardening · P8 — Ship
(see master-plan §9)

## Blocked on user
- [ ] Pause eu-west-1 Supabase project → then create Mumbai (ap-south-1) project
- [ ] App name decision (§1) — locks bundle ID before first EAS build
- [ ] Expo account (EAS builds) · MSG91/2Factor account (OTP)

## Debt / cleanup
- [ ] `npm audit` — 21 vulns (7 mod, 14 high) from scaffold transitive deps. Review at P7, don't `--force` now.
- [ ] `expo-symbols` ships 7 font-weight modules via expo-router; only `regular` used. Upstream, not ours. P7.
