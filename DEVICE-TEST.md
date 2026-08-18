# Device test + finish checklist

Everything queued that needs a **real phone** or **your decision** — the work that can't be verified from code alone. Ordered by what unblocks the most. Test **Telugu first** (strings run ~30% longer; if it fits Telugu it fits English).

Session of 2026-08-18 shipped the code-verifiable half (UI polish + security audit); this is the other half.

---

## 0. Before anything: gate the demo edge functions
The security audit found one real launch blocker.

- [x] **`demo-accept` gated** — now fail-closed on secret `DEMO_MODE === 'on'` (no secret → 403). Prod safe by default. To run a solo demo: dashboard → Edge Functions → Secrets → `DEMO_MODE=on`, then remove it after. No further action needed for launch beyond leaving the secret unset.
- [x] **`seed-testers`** — already inert (returns `410 gone`, no DB/input). Optional: delete the slug from the dashboard at launch. Harmless as-is.
- [ ] Supabase dashboard → Auth → Password → enable **leaked-password protection** (HaveIBeenPwned). One toggle.

---

## 1. EAS dev build (unblocks everything native)
Blocked on accounts (~1 week away). Once you have Apple Developer ($99) + an Expo login:

- [ ] `eas login`
- [ ] `eas build --profile development --platform ios` (config already in `eas.json`)
- [ ] Install the dev build on the iPhone (iOS 26.5 — do NOT downgrade the SDK)
- [ ] Everything below needs this build, not Expo Go — motion, haptics, camera, voice, push all need native.

Free Android APK path (no $99): give me an Expo token and I can run `eas build -p android --profile preview` headlessly.

---

## 2. VoiceOver / TalkBack sweep
A11y roles + labels were added in code (buttons announce, icon-only controls labeled, language chips read endonyms). Must confirm by ear:

- [ ] iOS VoiceOver on: swipe through Home → Search → Category → Provider → Book → Chat. Every control announces a meaningful name + "button".
- [ ] Reading order is top-to-bottom, no traps.
- [ ] Booking status steps read in order.
- [ ] Language switch chips say "English / తెలుగు / हिन्दी" + selected state.
- [ ] Repeat with Android TalkBack.

---

## 3. Typography rhythm (HELD in code — do on device)
Deliberately not shipped blind: a global line-height change shifts every screen.

- [ ] Add `lead` ratios to `theme/tokens.ts` (e.g. display 1.2, body 1.4).
- [ ] Retrofit the screens that hard-code `lineHeight`.
- [ ] Screenshot Telugu first — the tall vowel signs are where leading breaks.
- [ ] Letter-spacing on serif titles is already auto (in `AppText`) — leave it.

---

## 4. Motion tuning
`FadeIn` (Home) + press feedback are in and Expo-Go-safe. The rest needs the dev build to feel right:

- [ ] Screen transitions (Stack animation options) — tune duration on device.
- [ ] The ₹0 coin — the brand signature — deserves an entrance (spring pop).
- [ ] Extend `FadeIn` to Search / Category / Provider lists once you can see the timing.
- [ ] Confirm nothing janks on a low-end Android.

---

## 5. Haptics (needs device to feel)
Add `expo-haptics` (no-op on web, safe):

- [ ] Success buzz on: doorstep verify OK, payment logged, provider match found.
- [ ] Light tap on primary CTA press.
- [ ] Warning on verify-wrong-PIN.

---

## 6. The 4-states pass (master-plan P7 gate)
Every screen must show all four: loading, error, empty, content. Root `ErrorBoundary` now catches render crashes; queries mostly degrade to `Empty`. Confirm per screen and fix the two known soft spots:

- [ ] `search` + `dispatch` currently show a dropped-network error as "nothing found" — add a real retry state.
- [ ] Kill/reopen + airplane-mode pass on every screen.
- [ ] Telugu layout audit — every screen, no clipping/overflow.

---

## 7. Full flow, both platforms (Gate 4→5)
- [ ] Seed providers, run one full booking→dispatch→door-verify→UPI-pay→review on **two phones**.
- [ ] Repeat the entire run on iOS AND Android.
- [ ] Account deletion works and clears data.

---

## Still account-blocked (not testable yet)
- Resend verified domain (email code sending at scale)
- Twilio / MSG91 (phone OTP) · Meta (WhatsApp offers) · KYC vendor
- Expo push tokens (offer alerts)
- Sentry DSN (crash reporting — wired, no-op until set)
- App name → locks `bundleIdentifier` / `package` (currently placeholder `com.servicesapp.app`)

---

*Security posture as of this session: RLS verified uid-scoped on all crown jewels, every write-path edge function server-enforces consent + status, no secrets in client. The model is sound. The only real gap is §0 above.*
