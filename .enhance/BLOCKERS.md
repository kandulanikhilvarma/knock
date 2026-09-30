# Blockers — /enhance 2026-09-29

Each item stops a step that this run must not do alone. Each item gives the input that is necessary. To continue an item, give the input and run `/enhance resume <ID>`.

## BL-1 Apply migrations 0023, 0024 and 0025 to production — CLOSED 2026-10-01

- Applied with the Supabase MCP after the user restored `services-app`. The prod migration list now ends at 0025.
- Preflight: 0 rows over the new length caps. 1 pro has an old bad UPI ID. The trigger fires only on writes to `upi_id`, so that pro still works.
- Catalog check: 3 triggers, both public policies, the storage policy, 6 length checks. 7 of 7 pros have a `provider_stats` row (was 6).
- Security advisor: no ERROR. The WARNs are the expected anonymous-access lints (guest mode) and "leaked password protection disabled" (turn it on in Auth settings).

## BL-2 Supabase credential for types and live checks — CLOSED 2026-10-01

- `lib/database.types.ts` is regenerated from prod. It now has `analytics_events` and `saved_addresses`. The three `as never` casts are gone. tsc and tests pass.

## BL-3 Privacy policy, terms and grievance officer text

- **Blocks:** PRD-1. Indian IT Rules require a grievance officer. The DPDP Act requires a privacy notice.
- **Input necessary:** Approved legal text, or a decision to use a draft for the pilot.
- **Resume:** `/enhance resume BL-3`

## BL-4 Captcha and rate limits

- **Blocks:** SEC-5. Anonymous sign-in and OTP have no abuse limit.
- **Input necessary:** Turn on captcha (hCaptcha or Turnstile) in Supabase Auth settings. Give the site key. Set the rate limits in the dashboard.
- **Resume:** `/enhance resume BL-4`

## BL-5 Real domain

- **Blocks:** UX-7. The code uses the placeholder `services.app`.
- **Input necessary:** The production domain.
- **Resume:** `/enhance resume BL-5`

## BL-6 Staging project

- **Blocks:** PRD-5. All tests of server changes now touch production.
- **Input necessary:** Create a second Supabase project (an account action), and give its URL.
- **Resume:** `/enhance resume BL-6`

## BL-7 Product decisions

| Item | Question |
|---|---|
| UX-6 | Can a customer request one specific pro ("Request this pro")? |
| RULE-17 | Who records `price_agreed`, and when? Today no screen sets it, so earnings show "·". |
| RULE-10 | Pin dependencies exactly? 35 of 44 use `^` or `~`. CLAUDE.md says "no unpinned deps". |
| NEW-1 | After the 0017 auto-pause, a pro can set `availability_status` back to `available`. Must the pause hold until a review? |
| SEC-3 | UPI IDs are readable by any signed-in user. Show them only to the assigned customer (needs an RPC)? |

- **Input necessary:** One answer for each row.
- **Resume:** `/enhance resume BL-7`

## BL-8 KYC vendor

- **Blocks:** Real "Verified" badges. Only the server can set `verify_tier` (0023). No vendor is connected. `verified.heroSub` still describes an Aadhaar/PAN check as the product plan.
- **Input necessary:** The vendor choice and a sandbox key, set as an Edge Function secret (not in the client).
- **Resume:** `/enhance resume BL-8`

## BL-9 DEMO_MODE before launch

- **Blocks:** Launch. While the secret `DEMO_MODE` is `on`, the `demo-accept` function lets a customer accept the offer on their own booking for the pro. The pro does not agree, and the function issues a real door PIN.
- **Input necessary:** Unset `DEMO_MODE` in the Supabase function secrets before real users arrive.
- **Resume:** `/enhance resume BL-9`

## BL-10 Real-device and signed-in screenshots

- **Blocks:** Screenshot proof for B01, B19, F1 and F4, and the Telugu real-device check that CLAUDE.md requires.
- **Why blocked:** These screens need a signed-in user or a live booking. The run rules do not allow creating an account or a production booking. The Browser pane is a web preview, not a device.
- **Input necessary:** A test account on a staging project (BL-6), or run `DEVICE-TEST.md` on a phone in Telugu.
- **Resume:** `/enhance resume BL-10`

## BL-11 Edge Function hardening

- **Blocks:** SEC-6, SEC-7, SEC-8, SEC-10, SEC-13, SEC-14, PRD-3, RULE-6, RULE-8.
- **Why blocked:** A function change works only after a deploy.
- **Input necessary:** Permission to deploy Edge Functions, or a staging project (BL-6).
- **Resume:** `/enhance resume BL-11`

## BL-12 Confirm security headers live — CLOSED 2026-10-01

- Preview deploy `https://knock-mj9857560-kandula.vercel.app` (commit 70dd6bc) returns all six headers: `Content-Security-Policy: frame-ancestors 'none'`, `Permissions-Policy`, `Referrer-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`. The page has the new meta description.
- Production gets them when this branch reaches `main`.

## Note: Supabase unreachable on 2026-09-30

`bbzbiffpyuznlivbqmih.supabase.co` did not resolve during Phase 6. Cause: the project is paused (status INACTIVE). The live app has no backend until it is restored. Screens with live data show the offline state in the after screenshots.

## BL-13 Merge to main (production web)

- **Blocks:** Production web deploy. Vercel deploys production from `main`.
- **Why blocked:** The merge of PR #1 was refused by the agent's permission check (merge without review).
- **Input necessary:** Review and merge https://github.com/kandulanikhilvarma/knock/pull/1 yourself. CI and the Vercel preview pass.
