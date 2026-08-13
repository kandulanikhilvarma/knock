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

## Design tokens — "Shifud" approved 2026-08-14, live in `theme/tokens.ts` (supersedes the 2026-08-13 "Proof on paper" ink/saffron system, which supersedes §5 blue)
- Direction: **warm editorial** — cream paper ground, **deep forest-green as the ONE action** (pill CTAs), big serif display type, soft pastel blocks behind category items, peach price tags, organic single-stroke line motifs. Ref: Shifud Dine-In dribbble shot.
- `primary/accent #1B3A2B` forest (dark surfaces + the one CTA, pill-shaped) · `success #3E7A54` (proof only — verified/available/paid) · `gold #C87A46` terracotta (₹0 coin ring / value) · pastels `pink #F0C9C4 · blue #BFD6DF · sage #C8D9B7 · peach #F1C6A6` (category blocks) · `bg #EAE5D9` cream · `surface #F6F2E9` · `ink #191811` warm-black type
- Type: **Fraunces** serif for all display/titles/big numbers (Latin) · Inter for body/labels · Noto Sans Telugu/Devanagari for those scripts. `components/AppText` swaps family by active language at render (en→Inter/Fraunces, te→Noto Telugu, hi→Devanagari) — **author styles with `font.*`, never a raw family; wrap text in `AppText`, not `Text`.**
- City-earnings = big serif ₹ number on a **forest-green block**. Category tiles = pastel glyph chip (`categoryTint(slug)`) + serif name. Organic motif = `components/OrganicLines`.
- 22px card radius · **pill CTAs** · 48px min tap · bottom tabs Home · Bookings · Chat · Profile (active = forest).
- **Re-theme the whole app = change `theme/tokens.ts` values only.** Screens reference token names, never raw hex. Test Telugu first — ~30% longer.

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
