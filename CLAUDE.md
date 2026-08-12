# CLAUDE.md — services-app (working name)

Zero-commission local-services app. India, Telugu-first. Launch Vijayawada/Visakhapatnam.
Full spec: [services-app-master-plan.md](services-app-master-plan.md) — read it before any non-trivial work.

## Every session
1. Read this file + `TODO.md`. Announce current phase + gate status.
2. One phase per session. Screenshot-verify every UI task on a real device (Telugu first).
3. Commit per completed task. No AI co-author trailers.
4. `/compact` when drifting.

## Stack — LOCKED
- **Expo SDK 57** (`~57.0.12`) · React 19.2.3 · React Native 0.86.2 · TypeScript 6
- **expo-router** for all navigation. No React Navigation directly.
- **StyleSheet** for styling (not NativeWind). One system — do not mix.
- **i18next + expo-localization**. All strings in `locales/{en,te,hi}.json` from day one. Never hardcode UI text.
- **Zustand** (client state) + **React Query** (server state) — add when P2+ needs them.
- **Supabase** only: Auth (phone OTP), Postgres + RLS on every table, Realtime, Storage, Edge Functions. No Firebase.

## Design tokens — approved 2026-08-13, live in `theme/tokens.ts` (supersedes §5 blue palette)
- Direction: **"Proof on paper, one saffron move."** Ink structure, paper ground, ₹0 as a black-gold coin.
- `ink #0B0D12` (type/structure/dark surfaces) · `accent #FF7A1A` saffron (**the ONE action per screen**) · `gold #EDC24A` (₹0 coin/value) · `success #12A150` (proof only — KYC/verified/paid) · `bg #F4F5F7` paper · `surface #FFFFFF`
- City-earnings shown as a **mono number on an ink card** (transparency). ₹0 coin (ink + gold ring) on every provider card + a dark coin stage on the profile.
- 14px card radius · 48px min tap · bottom tabs: Home · Bookings · Chat · Profile (active = saffron)
- Type: Inter + Noto Sans Telugu + Noto Sans Devanagari + platform mono for numbers. **Test Telugu first — ~30% longer.**
- **Re-theme the whole app = change `theme/tokens.ts` values only.** Screens reference token names, never raw hex.

## Do NOT
- No `localStorage` (use AsyncStorage / SecureStore).
- No raw Aadhaar storage, ever. Offline XML/QR or KYC vendor only.
- No new libraries without justification. No unpinned deps.
- **App never collects payment.** UPI-direct customer→provider only. No wallet, no escrow.
- No `service_role` key in the client bundle. Anon key + RLS only.
- Never set/cap provider price. Never call providers "employees/partners" — "independent professionals".
- Never show "Verified" without a completed check.

## The differentiator (one sentence)
Sends a verified local tradesperson to your door in minutes, identity-checked by QR at arrival, paid directly by you, zero commission from anyone — ever.

## Structure
- `app/` — expo-router routes. `app/(tabs)/` — customer tab shell.
- `theme/tokens.ts` — design system source of truth.
- `lib/` — `i18n.ts`, `supabase.ts`.
- `locales/` — en/te/hi translation JSON.
- `components/` — shared UI.
