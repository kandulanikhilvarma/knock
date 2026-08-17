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

## Apple-grade UI polish (2026-08-18)
- [x] Borderless soft cards app-wide (surfaces float on `shadow.soft`, borders only on inputs/buttons/proof).
- [x] Optical letter-spacing on Latin serif titles — auto in `AppText`, one chokepoint.
- [x] Filled active tab icons (iOS convention) in `(tabs)/_layout`.
- [x] Tactile press feedback on primary CTAs via `components/Touchable`.
- [x] Gentle staggered fade-in on Home (`components/FadeIn`, Animated/Expo-Go safe).
- [ ] **Line-height rhythm system** — HELD, not shipped. A global `lead` ratio in tokens would
      shift vertical rhythm on every screen; can't eyeball-verify on device for ~1 week, so not
      worth shipping blind. Per-screen line-heights already tuned. Do this ON-DEVICE: add ratios,
      retrofit, screenshot Telugu-first.
- [ ] Extend press feedback + FadeIn to secondary rows (linkRows, list cards) and other screens
      once the dev build lets motion be tuned live.

## Security + hardening audit (2026-08-18) — verifiable-without-device pass
- [x] **Secrets in client**: clean. No `service_role`/keys in `app/ lib/ components/` (anon key + RLS only).
- [x] **RLS crown jewels verified** (pg_policies): all correctly uid-scoped —
      `job_tokens` → `is_assigned_provider(booking_id)` (door PIN/QR readable by assigned pro only);
      `profiles` (phone PII) → own or the pro on an active booking; `messages` → participants,
      insert checks `sender_id=auth.uid()`; `saved_addresses` → owner-only; `bookings`/`dispatch_offers`
      → own + offered/assigned. Advisor "anonymous access" WARNs are false alarms: policies gate on
      `auth.uid()`, which is NULL for a true anon → 0 rows. "Guest" = anon-authenticated (real uid), intended.
- [x] **Error boundary** added (`app/_layout.tsx` `ErrorBoundary`) — themed retry screen replaces the
      white-screen a render crash used to cause. Sentry.wrap still reports.
- [x] **npm audit** re-triaged: 19 vulns (10 high) ALL build-toolchain (metro/@expo/cli/image-size DoS
      parsers) — build-time only, nothing in the shipped runtime bundle. `--force` breaks locked SDK 57.
      Hold until an SDK bump.
- [ ] **BLOCK before public launch — `demo-accept` edge fn.** Auth'd + own-booking-scoped (no mass abuse),
      but self-accepts on the offered provider's behalf and mints a real door `job_token` PIN WITHOUT the
      provider consenting — breaks the "provider agreed to this job" chain the doorstep-verify proof assumes.
      Fine for solo demo; remove or gate behind a debug flag before real users. Same for `seed-testers`.
- [ ] Enable **leaked-password protection** (HaveIBeenPwned) — Supabase dashboard → Auth → Password. One toggle.
- [x] **Write-path edge-fn integrity audit** — all server-enforced, no client forgery: `respond`
      (provider consent + atomic first-accept-wins on `status='finding_pro'`), `swap` (customer-only,
      one-free `swap_used` guard), `submit-review` (done + customer + unique constraint), `job-action`
      (done: assigned pro only; paid: party only; status-gated, no double-count), `verify-arrival`
      (customer + assigned + token/PIN). Only `demo-accept` violates the model (above).
- [x] **Error-state coverage** — no catastrophic silent failures; screens degrade via `data ?? []`→`Empty`
      or safe defaults, and the new root `ErrorBoundary` catches render throws. MINOR: `search`/`dispatch`
      show a dropped-network error as "nothing found" rather than a retry prompt — polish later, low value now.

## Debt / cleanup
- [ ] `npm audit` — build-toolchain only (metro/expo/image-size), 0 runtime. Don't `--force`; clears on SDK bump.
- [ ] `expo-symbols` ships 7 font-weight modules via expo-router; only `regular` used. Upstream, not ours. P7.

## Dispatch made visible + onboarding tiles (2026-08-14, later session)
- [x] `app/dispatch.tsx` — one tap opens a drawn neighbourhood map (`components/
      NearbyMap`): your pin at centre, real pros around it, then the four steps
      the engine runs (locate → rank → wave-1 ping → first accept) before it
      hands off to the live booking. Verified end-to-end in the browser: Kiran
      Mohan accepted, booking screen opened at "Matched".
- [x] "Coming soon" removed everywhere. Onboarding trades now read as full
      pastel tiles + "Onboarding pros" chip (`home.nextUp` / `home.onboarding` /
      `category.onboarding*`). en/te/hi at key parity.
- [x] **CORS fix** — every Edge Function only allowed `authorization, content-type`,
      so supabase-js's `x-client-info` header failed preflight and *every* function
      call died in a browser. Added `apikey, x-client-info`; all 8 redeployed.
      (Native builds were unaffected, which is why the Node e2e passed.)
- [x] 0012: `provider_profiles.display_name` + sync triggers. profiles is
      owner-only by RLS (it holds phone), so the directory showed "Provider" for
      everyone. `providerName()` in lib/queries is the single read path.
- [ ] Note: the MCP deploy of `dispatch` flattens `../_shared/*` to `./_shared/*`.
      Repo layout is unchanged (correct for a CLI deploy) — re-check if deploying
      by CLI later.

## Telugu/Hindi render pass + navigation fixes (2026-08-14)
- [x] **Script line-height.** Telugu and Devanagari stack vowel signs above and
      below the baseline, so Latin-tuned lineHeights clipped them. `AppText` now
      floors every line at 1.45x the font size for te/hi. Tab labels and header
      titles are drawn by the navigator, not AppText, so both got the same
      treatment in their layouts (per-script family + taller line + 64px bar).
- [x] Category tiles allow 3 lines: "ఏసీ & ఉపకరణ రిపేర్" needed 93px in a 62px box.
- [x] **No way back.** booking/[id], booking/new, chat/[bookingId], jobs,
      provider-setup and auth/email set header titles but inherited
      `headerShown: false`, so they rendered with no header and no back button.
      Declared in the root Stack now.
- [x] Guest profile rendered a blank name and blank avatar: anonymous Supabase
      users return `email`/`phone` as empty strings, and `??` only catches null.
- [x] "VERIFIED" was the one hardcoded English string in the app → `provider.verified`.
- [x] Last raw hex/rgba from the old saffron+blue palette replaced with
      `colors.tintSuccess` / `colors.tintGold` tokens. Re-theme stays single-file.
- [x] 0014: the assigned pro can read their customer's name + phone while the job
      is live (§6-2b). Booking screen shows a customer card with a call button.
- [x] Walked Home, dispatch, booking, bookings, chat, profile, jobs in Telugu.
      Overflow audit clean on every screen after the fixes.

## Real map + real distance ranking + Sentry (2026-08-14)
- [x] **Real map.** `components/LiveMap` renders OpenStreetMap raster tiles
      (CARTO light basemap, key-free, attributed) positioned by Web-Mercator
      projection in `lib/geo.ts` — no map SDK, so it renders identically on the
      web preview and in a device build. Zoom 14 (neighbourhood scale, what a
      rider app opens at); pros outside the frame clamp to the edge instead of
      disappearing. Verified: 4 tiles loaded, pins at correct relative bearings.
- [x] **Real location.** `expo-location` via `lib/useMyLocation` — device fix if
      granted, Benz Circle if denied, never blocks the flow. The booking now
      carries cust_lat/cust_lng, so the engine's 25% distance weight is live
      instead of falling back to the neutral half-cap.
- [x] **Real provider coordinates** seeded as geohashes: Benz Circle,
      Governorpet, Patamata, Gunadala, Auto Nagar, Bhavanipuram. Every pro was
      `area_geohash = null` before, which silently neutralised distance scoring.
- [x] Dispatch screen shows measured distance: "N pros within 3 km · nearest
      1.3 km", and the accepted step names the real km.
- [x] **Sentry wired.** `lib/sentry.ts` inits from `EXPO_PUBLIC_SENTRY_DSN`
      (no DSN = no-op), `sendDefaultPii: false` so phone numbers and addresses
      never leave with an event. Root layout wrapped with `Sentry.wrap`.
      Verified end to end: test event arrived in the kandula org, then resolved.
- [ ] Sentry project is `javascript-nextjs` — the org blocks project creation
      for members, so events land in the wrong project. Create a `services-app`
      React Native project in the Sentry UI and swap the DSN in `.env`.
- [ ] Tiles: CARTO basemaps are fine for a prototype. Before launch traffic,
      move to a keyed tile provider (MapTiler/Mapbox) or self-host.

## Full master-plan audit (2026-08-14) — read §6 spec, not just this file

### Built this pass
- [x] **Search** (§6 parity "Search + categories"). The Home search bar was a
      dead Pressable with a fake mic. `app/search.tsx` searches categories by
      name AND by the problem in all three scripts ("fan", "కరెంట్", "नल"), plus
      pros by name. Verified: typing "fan" returns Electrician.
- [x] **First-launch language picker** (§2-4). It was buried in settings; now it
      is the first screen, each option written in its own script.
- [x] **Safety rails** (§6-2b): SOS that dials 112 behind a confirm tap, and a
      share-this-job link, both live from assignment until the job is done.
- [x] **Canned localized quick replies** in chat (§6 parity).
- [x] **Wave-2 escalation** (§6-2a). The engine ranks the whole pool at dispatch
      and parks wave 2 (`scheduled`); `sweep_dispatch` releases it when wave 1
      times out, and only fails to browse after wave 2 dies too. One scoring
      implementation, full audit trail. Live-tested end to end in SQL.
- [x] **Performance feedback loop** (§6-2a): under-4.0 rated pros lose 15% of
      score (published rule, in the engine); under 3.5 across the last 20 jobs
      auto-pauses dispatch (0017 trigger). Never a manual block.
- [x] **Earnings log · My reviews · Verified Pro upsell** — the three provider
      screens from the §6 screen map that did not exist. The upsell shows
      benefits only on iOS with no price and no link (3.1.3, India storefront).
- [x] **Product events** (§8) — own `analytics_events` table instead of PostHog:
      insert-only RLS, all 13 event names typed. dispatch_wave_sent and
      dispatch_failed both fire. Verified rows landing.
- [x] **Removed fabricated proof.** The provider profile showed "~8 min avg" and
      "4.9 · 58 reviews" as hardcoded strings, and Home carried three invented
      customer testimonials. Same class of problem as showing "Verified" without
      a check. Facts now derive from real stats; testimonials replaced with a
      "How it works" strip that promises nothing untrue.
- [x] Home copy: the headline and the search placeholder were the same sentence.
      The ₹0 counter now reads as a starting line, not a broken number.

### Spec items still open, and why
- [ ] **Booking photos + job photo diary** (§6 parity, §6-7). Needs
      expo-image-picker plus a Storage bucket with RLS. Next build session.
- [ ] **Voice search** (§6 parity "text/voice search"). Needs a speech-to-text
      dependency; the fake mic button is gone rather than left lying.
- [ ] **Voice intro recording** (§6-3). The player is wired and shows only when
      a URL exists; recording needs expo-audio and a bucket.
- [ ] **AC/appliance sub-split** (§4: AC / fridge / washing machine / TV / geyser
      / RO). Data change plus a sub-category picker.
- [ ] **Saved addresses** in profile settings (§6 screen map).
- [ ] **Work-photo gallery** on provider profiles (§6 parity).
- [ ] **Camera QR scan** (expo-camera) — PIN path is the tested one.
- [ ] Masked calls (plan marks v1.1) · push · WhatsApp alerts — blocked on
      Exotel/Twilio, an Expo account, and Meta Cloud API respectively.
- [ ] KYC vendor (§6-5, §7-3) · privacy + terms pages and grievance officer
      (§7-1, §7-2) — blocked on a vendor, a domain and the entity.
- [ ] Sentry project is `javascript-nextjs`; the org blocks project creation for
      members. Create a `services-app` RN project and swap the DSN.

## Rapido-style home map (2026-08-14)
- [x] `components/NearbyProviders` on Home: real OSM map with your location and
      the available pros around you (nearest 6), shown before anything is
      requested. Tap the CTA to run the dispatch flow.
- [x] Location gate: if permission is denied the map shows the city with a
      "Turn on location" card that re-requests (useMyLocation.request). Never
      blocks the rest of Home.
- [x] Verified in preview: 6 tiles load, all 6 pros + You render on the map.
