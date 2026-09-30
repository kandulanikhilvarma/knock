# Raw subagent reports — Security/Prod (ecc:security-reviewer) + Rules (build-guard). Read-only, repo evidence only.

Live DB checks were NOT possible: Supabase MCP returned "This connector can't be used with the current credential." All DB findings are repo-verified, live-unverified.

Clean: `.env` untracked; 99-commit history has 0 hits for JWTs / `sb_secret_` / private keys; `service_role` only in Edge Functions via `Deno.env.get`; `vercel.json` key is publishable (`sb_pub…`); SECURITY DEFINER fns set search_path; RLS on every table; all 8 Edge Functions verify JWT; CORS `*` fine with bearer auth; `demo-accept` fail-closed (DEMO_MODE on in prod — known launch blocker); no localStorage; no "partner/employee" copy; no payment collection; no price cap; i18n parity 326/326/326.

| ID | Sev | Evidence | Impact | Fix | Blocked |
|---|---|---|---|---|---|
| SEC-1 | P0 | `0002:63-64` bookings_insert_own checks only customer_id | forged done/paid bookings → fake reviews, competitor auto-pause, inflated city_stats | migration: pin server columns on insert | apply = deploy |
| SEC-2 / RULE-1 | P0 | `0001:77-78` pp_insert/update_own, no column limit | self-issued Verified badge + dispatch bonus | trigger pins verify_tier for non-service callers | apply = deploy |
| SEC-3 / RULE-3 | P1 | `0001:76` pp_read true; upi_id `0007:6`; `select('*')` | all UPI ids public | column revoke + RPC | apply = deploy |
| SEC-4 | P1 | `_layout.tsx:129-133`, `lib/auth.ts:79-83` raw tokens from URL | login CSRF | accept tokens only on auth-callback path | partly |
| SEC-5 | P1 | no captcha / rate limit; unbounded waitlist+analytics | SMS pumping, spam | dashboard captcha + limits | Yes |
| SEC-6 | P2 | verify-arrival no attempt limit; Math.random PIN | PIN brute force | attempts + crypto RNG | No |
| SEC-7 | P2 | job-action read-modify-write jobs_done | double count | conditional update | No |
| SEC-8 | P2 | respond ignores `scheduled` | wave-2 accepts early | reject scheduled | No |
| SEC-9 | P2 | unbounded text; UPI check `includes('@')`; voice_intro_url opened raw | abuse, phishing | length checks, https allowlist, UPI regex | No |
| SEC-10 | P2 | 0020/0021 buckets no size/mime limit | free hosting abuse | bucket limits | No |
| SEC-11 / RULE-7 | P2 | 0014 includes 'done' w/o time bound | pro keeps phone forever | time bound | No |
| SEC-12 / RULE-4 | P1 | `lib/provider.ts` client upserts provider_stats; no insert policy | stats row missing → ratings/jobs_done never update | signup trigger | No |
| RULE-5 | P2 | `booking/new.tsx:58` client bookings.update(photos); no update policy | photos silently never saved | pass photos in insert | No |
| RULE-6 | P2 | provider-gallery no update policy; avatar upsert:true | 2nd avatar upload fails | update policy | No |
| RULE-8 | P2 | 0002:68-72 bookings_select_offered no response filter | declined pros keep address | restrict to pending | No |
| RULE-9 | P3 | reviews select('*') exposes customer_id | minor PII | explicit columns | No |
| SEC-13 | P2 | AsyncStorage session on native | plaintext refresh token | SecureStore | No |
| SEC-14 | P3 | edge fns return raw error strings | info leak | generic errors | No |
| RULE-2 | P1 | TrustPillars / provider facts claim "Aadhaar + PAN verified"; no KYC exists | overstated trust claim (§155 legal) | reword until KYC | copy/KYC |
| RULE-10 | P2 | 35/44 deps use ^ or ~ | "no unpinned deps" rule | save-exact; pin ^ | decision |
| RULE-11 | P3 | fraunces, playfair-display unused | dead deps | remove | No |
| RULE-12/13 | P3 | raw hex; Verified badge on gold | token rule | tokens; success tint | No |
| RULE-14 | NIT | unused `Text` import in 15 files | noise | remove | No |
| RULE-15 | P2 | hardcoded "Vijayawada", "LIVE", English thrown errors shown raw | i18n | keys | No |
| RULE-16 | P3 | dispatch.s1sub fake location; demo path in prod client | misleading | copy | copy |
| RULE-17 | P2 | price_agreed never written → counter always ₹0 | inaccurate stat | record amount at done | product |
| PRD-1 | P0 | no privacy/terms/grievance | store + DPDP blocker | pages | Yes (legal) |
| PRD-2 | P1 | analytics/Sentry no consent; no retention | compliance | consent flag | partly |
| PRD-3 | P1 | delete-account leaves storage files | incomplete erasure | remove prefixes | No |
| PRD-4 | P1 | vercel.json no security headers | clickjacking etc. | headers | No |
| PRD-5 | P1 | one Supabase project for all envs | no staging | env split | Yes |
| PRD-6 | P1 | no config.toml / seed / CI | not reproducible | CI + config | No |
| PRD-7 | P2 | adaptive icon #1B4B8F | off-brand | #0F3A2C | No |

Scores: Security 4/10 · Prod readiness 3/10.
