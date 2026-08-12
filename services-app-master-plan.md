# MASTER PLAN — Zero-Commission Local Services App (India, Telugu-first)
**Owner:** Rudra / Initial Theory · **Stack:** Expo (React Native) + Supabase + Claude Code · **Version:** 1.1 (dispatch + doorstep verification) · **Status:** LOCKED — follow top to bottom, no back-and-forth

---

## 0. DECISIONS LOCKED (read this before every session)

| Decision | Locked choice | Why |
|---|---|---|
| Launch city | **Vijayawada or Visakhapatnam** (whichever has your strongest on-ground person). Hyderabad = expansion city #2, NOT launch | AP tier-2 = whitespace; Hyderabad has Urban Company + quick-services war; Telangana has gig-worker legislation drafts, AP does not (verify at launch) |
| Launch categories (live supply) | **Electrician · Plumber · AC/Appliance Repair** | High urgency, weak incumbent coverage in tier-2, providers hate Justdial/Sulekha lead-selling |
| All other categories | **Visible in app from day 1** ("coming soon" / waitlist per category) | Signals the full vision, captures demand data, costs nothing |
| Revenue model | **Customer: free forever. Provider: free tier + "Verified Pro" ₹99/month (₹49 intro)** — sold on WEB portal, not in-app | Zero commission = the brand. Web-sold subscription avoids Apple/Google 15–30% cut and digital-goods billing rules |
| Money flow | **App NEVER touches transaction money.** Customer pays provider directly via UPI intent/QR or cash | Avoids GST TCS (Sec 52), ECO classification, payment-aggregator licensing. This is the Namma Yatri structure |
| App structure | **ONE app, two modes** (Customer / Provider chosen at signup, switchable) | One codebase, one review process, one 14-day Google clock. Split into two apps only after traction |
| Languages v1 | **English (default) + Telugu + Hindi** | Launch city is Telugu; Hindi covers expansion; add more later via the same i18n system |
| Scope v1 | Full: request → dispatch → verify at door → job → pay (UPI-direct) → review. NO wallet, NO scheduling calendar, NO in-app payment collection | "Full" = complete core loop, not every incumbent feature. See §6 parity map |
| Matching (v1.1 decision) | **Wave-based algorithm dispatch (auto-assign)** + **one free swap** for the customer + **browse list as fallback** when dispatch finds nobody | Founder decision — overrides earlier browse-only. Swap preserves a human veto UC doesn't offer; fallback keeps the app useful at thin supply. ⚠️ Raises aggregator-classification odds under gig-worker acts — see §7 |
| Doorstep verification (v1.1) | **Job-bound QR shown in provider app, scanned by customer; 4-digit PIN fallback.** Job cannot move to "In progress" without it | Two-way identity proof at the door = the trust moment no informal referral can match. PIN covers low-end phones |
| Fairness | **Newcomer exposure quota: ~20% of wave-1 dispatch slots reserved for providers with <5 completed jobs** (within distance cap) | New providers must be able to earn their first reviews or supply dies |

---

## 1. NAME — candidates + registration protocol

**Criteria:** ≤3 syllables, pronounceable in English/Hindi/Telugu, action- or trust-flavored, .com or .in obtainable, no existing Play/App Store conflict, trademark class 35 + 42 clear.

**Candidates (my ranked shortlist — verify before falling in love):**

1. **Bulao** (बुलाओ — "call them / summon") — action imperative; matches the core interaction: press button → bulao. Short, punchy, Hinglish-native.
2. **Mestri** (మేస్త్రి / मिस्त्री — skilled worker/foreman) — the ONLY word that means "skilled tradesman" in BOTH Telugu and Hindi. Distinctive spelling. Instantly understood by your exact supply side.
3. **KaamSetu** ("work-bridge") — descriptive, dignified, brandable; slightly longer.
4. **Nipun / Nipuna** ("skilled" — Sanskrit root, works in Hindi + Telugu) — premium feel, good for the umbrella brand.
5. **Kaarigar** ("artisan/craftsman") — warm, provider-respecting; check crowding.
6. **Jhatpat** ("instantly") — playful; weaker on trust.

**Avoid:** anything with "Pani" (Telugu: work / Hindi: water — cross-language confusion), "Seva" (crowded, govt-app connotation), generic English ("LocalPro", "FixIt" — 4.3 saturation smell + trademark minefields).

**Registration protocol (do in ONE sitting, in this order):**
1. Search Play Store + App Store for the name and close variants.
2. Domain check: .com first, .in acceptable fallback (India-first brand). Buy immediately if free (~₹800–1,500/yr).
3. India trademark search: ipindiaonline.gov.in → classes 35 (marketplace/ads) and 42 (software). Availability ≠ registration; file TM later (~₹4,500/class self-file) once name proves out.
4. Handles: Instagram, YouTube, X — match the tightest available string (your existing handle strategy).
5. MCA company-name check if the app name will also be the Pvt Ltd name (it doesn't have to be — "Initial Theory Technologies Pvt Ltd" can publish an app called Bulao).
**Do not skip step 1.** A Play Store name collision late = full rebrand.

---

## 2. POSITIONING — why anyone switches

**One-liner (paste-ready for store listing + Apple Review Notes):**
> "[Name] sends a verified local electrician, plumber or repair expert to your door in minutes — identity-checked by QR scan when they arrive, paid directly by you, and we never take a commission from anyone's work."

**Customer promises (vs. each incumbent's sin):**
| Their sin | Our promise |
|---|---|
| Justdial/Sulekha: one enquiry → 15 spam calls | **One request, one assigned pro. Nobody else ever gets your number** |
| Urban Company: locked to whoever the algorithm sends, ~₹100 hidden fees, upsell pressure | **Auto-matched in minutes, but don't like the match? One free swap.** No booking fees, ever |
| Nobody verifies who's at your door | **Scan their QR before they step in — identity confirmed against KYC, every single job** |
| WhatsApp group referrals: no vetting, no accountability | **KYC-verified badge + real reviews + job history** |
| All: metro-only | **Built for your city, in Telugu** |

**Provider promises (the recruiting pitch — this is what your on-ground person says at every shop):**
> "Urban Company takes 20–30% of everything you earn plus kit fees. Justdial sells the same lead to 15 of your competitors and charges ₹15,000+ a year. We take **₹0 commission — forever**. Jobs near you come straight to your phone — accept, do the work, keep 100% of what the customer pays you. New members get guaranteed early jobs so you can build your rating. Later, if you want the Verified badge and dispatch priority, it's ₹99 a month — less than one cup of chai a day. First 3–6 months free."

**Product-sense principles (apply to every screen):**
1. **The provider is the hero.** Big photos, names, years of experience, "speaks Telugu/Hindi" tags. Incumbents hide workers; we celebrate them — that's also why providers will evangelize us.
2. **Three taps to a match.** Open → category → describe → dispatched. Every added tap loses tier-2 users; the assigned-pro card must appear within seconds, with live "finding your pro…" states, never a dead spinner.
3. **Trust is visual.** Badge, review count, "24 jobs done", response-time chip — scannable in 2 seconds, no reading required.
4. **Vernacular is default-adjacent, not buried.** Language picker on FIRST launch, huge tap targets, voice search for problem description.
5. **Never punish the free tier.** Unverified providers still get listed (below verified) — supply density beats purity at launch.

---

## 3. PRICING — full comparison (put a simplified version of this table on your website)

| | **[Name]** | Urban Company | Justdial | Sulekha | Snabbit/Pronto |
|---|---|---|---|---|---|
| Customer booking fee | **₹0** | ~₹100 convenience/visit fees | ₹0 (but spam) | ₹0 (but spam) | per-hour rates |
| Commission on provider's work | **0%** | ~8.5–30% (+kit/product costs) | n/a | n/a | managed wages |
| Provider cost | **Free; optional ₹99/mo Verified** | Commission + up to ~₹50k onboarding | ₹6k–50k+/yr packages | ₹20k+ lead packages | employment-like |
| Who picks the provider | **Smart dispatch + one free swap** | Algorithm, no swap | Customer (from ads) | Lead auction | Algorithm |
| Identity check at your door | **QR/PIN, every job** | No | No | No | No |
| Lead shared with competitors | **Never** | n/a | Yes, many | Yes, many | n/a |
| Cities like yours | **Yes — built here** | Metro-first | Yes (stale) | Yes (stale) | No |

**Provider monetization ladder (sequenced — do not jump ahead):**
- **Months 0–4:** everything free. Goal = density + habit + proof of job flow.
- **Month 4–6:** introduce Verified Pro at ₹49/mo intro (badge, priority ranking, "Verified" filter inclusion, WhatsApp support). Grandfather early providers 6 months free.
- **Month 6+:** ₹99/mo standard. Annual ₹999 option.
- **Later (year 2, only after 500+ paying):** featured placement, provider mini-website, insurance/financing partnerships. **Never commission.**

GST note: the ₹99 subscription is a B2B SaaS service (18% GST once registered). Get an Indian CA's written opinion on ECO/TCS positioning **before** charging anyone (₹5–15k, budget it).

---

## 4. SERVICES TAXONOMY

**Tier A — live at launch (real supply, hand-onboarded):** Electrician · Plumber · AC & Appliance Repair (split visually: AC / Fridge / Washing machine / TV / Geyser / RO).
**Tier B — visible, "notify me" waitlist (activate one per month based on waitlist counts):** Carpenter · Painter · Home cleaning · Pest control · Two-wheeler mechanic · CCTV/Networking · Tutor · Fitness trainer · Beautician (home) · Cook/Maid (LAST — that's the VC-war category; enter only if data screams).
Every waitlist signup = free demand research + a launch email list per category.

---

## 5. APP DESIGN

**Inspiration (steal patterns, not pixels):**
- **Urban Company:** category grid home, clean service cards → copy the *layout logic*, reject the corporate coldness.
- **Namma Yatri:** transparency-as-design (fare breakdowns, open metrics) → our "₹0 commission" badge visible in-app permanently.
- **Swiggy/Zomato:** provider cards with photo + rating + delivery-time chip → our provider card = photo + rating + distance + response-time.
- **WhatsApp:** the trust benchmark for chat; green accents read "safe" in India.
- **PhonePe/GPay:** UPI flows Indians already know — mimic their payment-handoff patterns exactly.

**Design system (lock in CLAUDE.md before any UI code):**
- **Colors:** Primary **deep trust-blue #1B4B8F** · Accent **saffron-orange #FF7A1A** (CTAs only) · Success green #1E9E5A (verified/paid states) · Bone #FAF7F2 background · Ink #17181C text. (Signal-orange kinship with Initial Theory, but this app earns its own identity.)
- **Type:** Inter (Latin) + **Noto Sans Telugu / Noto Sans Devanagari** — test every screen in Telugu FIRST; Telugu strings run ~30% longer and break naive layouts.
- **Components:** 12px radius cards, 48px minimum tap targets, bottom-tab navigation (Home · Bookings · Chat · Profile), sticky bottom CTA on provider profiles ("📞 Call now").
- **The signature element (4.3 differentiator, keep visible everywhere):** the **"₹0 commission" ribbon** on every provider card + a public **live counter on Home: "₹X earned by workers in [city] — 100% kept by them."** No competitor can copy this without destroying their own business model. Mention it in App Review notes.

---

## 6. FEATURE SPEC — parity map + uniques

**Parity (what incumbents have → our v1 answer):**
| Incumbent feature | Our v1 |
|---|---|
| Search + categories | Category grid + text/voice search |
| Provider profiles + ratings | Yes — richer (badge, jobs count, languages, response time, photo gallery of work) |
| Booking | Dispatch-based: customer submits job (category, description, photo, address, time preference) → dispatch engine assigns (see spec below) → status machine: Requested → Finding pro → Assigned → Verified at door → In progress → Done |
| Chat | In-app chat (Supabase Realtime) + masked call button. Auto-translate quick-replies (canned phrases localized) |
| Payments | **UPI-direct:** on "Done", app shows provider's UPI QR / deep-link with amount field → customer pays provider straight into their account → both tap "Mark paid" → receipt logged. Cash option too |
| Reviews | Post-completion 5-star + tags ("On time", "Fair price", "Clean work") + optional text; review only after a confirmed job (kills fake reviews) |
| Notifications | Push (Expo Notifications) for booking states + chat |
| Offers/membership | NOT in v1 (our price IS the offer) |
| UC-style training/uniforms | Never — replaced by verification tiers |

**Unique features (our moat, all v1 unless marked):**
1. **₹0-commission ribbon + city earnings counter** (see §5).
2. **One free swap after dispatch** — the assigned-pro card shows photo, rating, jobs done, ETA; customer can tap "Swap" once per booking for a free re-dispatch (excluding the swapped pro). Human veto UC doesn't offer; also softens the legal "control" picture.
2a. **DISPATCH ENGINE SPEC (the algorithm — build exactly this, resist cleverness):**
   - **Eligibility filter:** category match + inside service radius + status "available" + not blocked/paused.
   - **Score = 0.30·rating_norm + 0.25·distance_decay + 0.20·acceptance_rate + 0.15·completion_rate + 0.10·recency_of_activity.** All factors normalized 0–1; new providers get neutral 0.5 priors so they're never zeroed out.
   - **Fairness quota:** ~20% of wave-1 slots reserved for providers with <5 completed jobs (nearest-first among them). Log quota fills — this is how supply grows.
   - **Wave dispatch:** Wave 1 = top 3 by score pinged simultaneously (push + WhatsApp), first-accept wins, 90-second window. Wave 2 = next 5, 120 seconds. No accept after 2 waves → graceful fallback: customer sees the browse list ("call one directly") — dispatch failing must never mean a dead end.
   - **Performance feedback loop:** rating <4.0 over last 20 jobs → score penalty; <3.5 or a verified safety complaint → dispatch paused pending re-verification; repeated declines lower acceptance_rate naturally (no manual punishment). Document every rule in the provider T&Cs — opaque blocking is UC's most-hated behavior; ours is published.
   - **Verified Pro effect:** small score bonus + wave-1 priority tie-break. Never pay-to-bypass safety rules.
2b. **DOORSTEP VERIFICATION (two-way, every job):**
   - On assignment, server issues a **job-bound token**. Provider app renders it as a QR + a 4-digit PIN (same token).
   - At the door: customer taps "Verify arrival" → scans provider's QR (or types the PIN if no camera/low-end phone). Server checks token ↔ job ↔ provider ID → status flips to "In progress" with GPS+timestamp logged.
   - **Customer side of the handshake:** provider sees customer's name + verified-phone badge + address only after accepting; address hidden until assignment (protects customers from decline-farming).
   - **Safety rails:** assigned-pro card shows the KYC selfie photo (must match the human at the door — say so in UI copy) · SOS button on active-job screen (dials 112 + shares live job link) · "Share this job" link (family can watch status) · all calls masked · post-job, numbers expire.
   - Job CANNOT move to "In progress" — and the payment screen never appears — without verification. This makes the QR moment a habit, not an option.
3. **Provider voice-intro** — 20-sec audio "Namaste, I'm Ravi, 12 years' AC experience" in their language. Trust bomb for tier-2; costs one record button.
4. **WhatsApp-first fallback** — every deep link works as a WhatsApp share; providers get booking alerts on WhatsApp too (Cloud API, ~₹0.5–1/template msg — verify current Meta pricing) so a provider who never opens the app still gets jobs. This is how you beat the informal market: live inside it.
5. **Tiered trust, honestly labeled** — "Basic (self-declared)" vs "✅ Verified (Aadhaar + PAN + record check)". Never overstate — legal requirement.
6. **Price transparency chips** — providers set a visiting-charge + typical range per service; shown upfront. Kills the #1 fear ("kitna lega?").
7. *(v1.1)* Job photo diary — before/after photos attach to the booking → builds provider portfolios automatically.

**Login:** Phone OTP only (customers) via MSG91/2Factor (~₹0.15–0.30/SMS — verify current rates); optional WhatsApp OTP. Providers: same + KYC step. No email/password anywhere. Truecaller one-tap = v1.1.
**Account deletion in-app: mandatory (Apple + Google reject without it).**

**Screen map (every screen ships with empty/loading/error/success states — GATE 4→5):**
- Shared: Splash+language picker · OTP login · Role choice
- Customer: Home (grid+search+counter) · Category list · Provider profile · Booking request form · Booking status/detail · Chat thread · Chat list · Bookings history · Review modal · Profile/settings (language, addresses, delete account)
- Provider: Onboarding wizard (profile → services → area → KYC upload) · Job inbox (accept/decline) · Active job detail · My reviews · Earnings log (self-reported) · Verified upsell screen (links OUT to web portal — no in-app purchase)
- Web (Next.js, later): landing + pricing table + provider portal (subscription checkout via Razorpay) + privacy/terms/support pages (store-mandatory URLs)

---

## 7. LEGAL & PRIVACY (non-negotiable, in build order)

1. **Privacy Policy + Terms** — in English AND Telugu/Hindi. Must cover: data collected (phone, location, KYC docs for providers), purpose, retention, DPDP-style consent, grievance contact. Host on your domain before store submission (mandatory URLs).
2. **Grievance officer** — India-resident named contact, ack ≤48h, resolve ≤1 month (E-Commerce Rules 2020 + IT Rules 2021). Your on-ground person or resident director can hold this.
3. **KYC handling** — never store raw Aadhaar numbers. Use DigiLocker/offline XML or a vendor (Surepass/Digitap/IDfy — negotiate per-check, budget ₹3–30 basic, more for record checks). Verified tier = Aadhaar offline + PAN + (paid tier) criminal-record check via vendor.
4. **Entity** — Indian Pvt Ltd with resident director (family member works). You hold shares as NRI; FC-GPR filing if you inject foreign funds. Can launch closed testing before incorporation is done, but incorporate before charging money.
5. **DPDP Act** — consent screens at signup + KYC upload; core obligations enforceable ~May 2027, build compliant now.
6. **⚠️ Aggregator exposure (raised by the v1.1 dispatch decision):** algorithmic assignment + performance-based dispatch penalties = "control" indicators under gig-worker acts (Karnataka in force; Rajasthan; Telangana drafts — matters for Hyderabad expansion). Mitigations baked into this plan: providers set their own prices, free to decline without manual punishment, all dispatch rules published in T&Cs, one-free-swap keeps a human in the loop, platform never touches pay. Add "aggregator classification under state gig acts" to the CA/lawyer opinion scope (same ₹5–15k engagement).
7. **The "don't do" list:** never collect customer payments into your account · never set or cap the provider's price · never manually block a provider without a documented, communicated reason · never call providers "employees/partners" (use "independent professionals") · never show "Verified" without completed checks.

---

## 8. TECH ARCHITECTURE

- **App:** Expo (pin latest stable SDK in CLAUDE.md), TypeScript, expo-router, NativeWind or StyleSheet (pick one, lock it), i18next + expo-localization (all strings in `/locales/{en,te,hi}.json` from DAY ONE — retrofitting i18n is hell), Zustand for state, React Query for server state.
- **Backend:** Supabase — Auth (phone OTP w/ MSG91 SMS hook), Postgres + **RLS on every table (secrets reflex)**, Realtime (chat + booking status), Storage (photos, KYC docs in a locked bucket), Edge Functions (OTP, WhatsApp notify, KYC vendor calls, review-gating). Free tier → Pro $25/mo once live (free projects pause after 7 days inactivity).
- **Data model (minimal):** `users` (role, lang) · `provider_profiles` (services[], area geohash, upi_id, verify_tier, voice_intro_url, availability_status) · `provider_stats` (rating_avg, acceptance_rate, completion_rate, jobs_done — recomputed by trigger, feeds dispatch score) · `categories` · `bookings` (status enum incl. finding_pro/assigned/verified/in_progress, category, description, photos, address, price_agreed, swap_used bool) · `dispatch_offers` (booking_id, provider_id, wave, sent_at, responded_at, response) · `job_tokens` (booking_id, token, qr_payload, pin, verified_at, gps) · `messages` · `reviews` (FK to completed booking) · `waitlist_signups` · `subscriptions` (web-managed).
- **Dispatch runtime:** one Edge Function (`dispatch`) triggered on booking creation + a scheduled function for wave timeouts; all offer state in `dispatch_offers` so the engine is restartable and auditable (the audit trail is also your legal defense for "published rules").
- **Geo:** store provider service-area as center+radius; match with PostGIS `ST_DWithin`. Map display v1: static map or OLA Maps (India-cheap — verify pricing) / Google Maps free tier.
- **Notifications:** Expo Push + WhatsApp Cloud API (Edge Function).
- **Crash/analytics:** Sentry day one + PostHog (free tiers). Events: `signup, category_view, booking_created, dispatch_wave_sent, offer_accepted, offer_declined, dispatch_failed, swap_used, arrival_verified (qr|pin), booking_done, payment_marked, review_left, waitlist_join`. Watch `dispatch_failed` and time-to-assign like a hawk — they ARE the product.
- **CI:** EAS Build (free tier has monthly limits — verify current quota; budget $19–99/mo if you exceed).

---

## 9. BUILD PLAN WITH CLAUDE CODE (phased; app runnable after every phase)

**Session discipline (every session):** open with "Read CLAUDE.md and TODO.md; announce phase and gate status" · one phase per session · screenshot-verify every UI task (verify reflex) · `/compact` when drifting · commit per completed task (github-hygiene: no AI co-author trailers).

**First: create CLAUDE.md** containing: exact Expo SDK version + all dependency versions · design tokens from §5 · stack lock (Supabase only, no Firebase; expo-router only) · Do-NOT list (no localStorage, no raw Aadhaar storage, no unpinned deps, no new libraries without justification, no payment collection) · the differentiator sentence · link to this master plan.

- **P0 — Scaffold (day 1–2):** create-expo-app, TS, router, i18n wired with the 3 locales, design tokens, Supabase client, Sentry, tab shell. *Gate 2→4 check.*
- **P1 — Auth + roles (day 3–5):** OTP flow, role choice, profile stubs. **Day 3 reflex: cut an Android build (EAS) however ugly, create Play closed test, start recruiting 15–18 testers — the 14-day clock runs in parallel from HERE.**
- **P2 — Directory (week 2):** categories, provider list w/ sort+filters, provider profile (voice intro player, price chips, ₹0 ribbon), waitlist for Tier-B, seed script for demo data.
- **P3 — Dispatch engine + booking loop (weeks 3–4, the hardest phase):** request form → `dispatch` Edge Function (score, quota, waves, timeouts per §6-2a) → provider offer screen (accept/decline, countdown) → assigned-pro card + one-free-swap → status machine → push/WhatsApp notifications → browse-list fallback. Build the engine as pure SQL/TS functions with unit tests BEFORE wiring UI — simulate 20 fake providers and assert wave behavior, quota fills, and timeout handling.
- **P4 — Chat + call (week 5):** Realtime chat, canned localized replies, call button (plain dial v1; masking via Exotel/Twilio = v1.1 if budget allows).
- **P5 — Doorstep verification + payment + reviews (week 6):** job-token issuance → provider QR/PIN screen → customer scan (expo-camera) + PIN fallback → GPS-stamped "In progress" flip → UPI intent/QR payment flow, mark-paid, receipt log → review-after-completion gating. Status order enforced server-side: no verify, no payment screen.
- **P6 — Provider onboarding + KYC (week 7):** wizard, doc upload to locked bucket, vendor verification call (or manual review by you at first — cheaper, fine at low volume), badge logic, availability toggle.
- **P7 — Hardening (week 8):** all 4 states on all screens · kill/reopen + airplane-mode pass · Telugu layout audit · account deletion · security 80/20 (RLS audit, no secrets in client, server-side validation on booking/review/dispatch/token writes — a forged "verified" or self-accepted offer must be impossible from the client) · full dispatch simulation with 2 phones + seeded providers · one full sandbox run of every flow on iOS AND Android. *Gate 4→5.*
- **P8 — Ship (weeks 8–10):** store listings (EN+TE+HI, de-slopped), screenshots (real Telugu content, not lorem ipsum — show the QR-verify moment, it's your best screenshot), privacy declarations/data-safety forms (camera + location permissions now need purpose strings), demo account for Apple review (pre-seeded providers + a completable booking incl. verification — test it same day you submit), Review Notes with differentiator + demo credentials. Google: 14-day window should already be done/ending — ship ≥3 updates during it, then production-access application with specific answers. Apple: submit, manual-release, coordinate same-day two-store launch. *Gate 5→6.*

**Realistic timeline: 9–11 weeks solo to both stores** (dispatch engine + verification added ~2 weeks over the browse-only plan). Anyone promising 2 weeks for this scope is lying to you.

---

## 10. LAUNCH OPS & MARKETING (weeks 6–12, overlapping build)

- **Supply first (your on-ground person, weeks 6–8):** 50–80 providers across the 3 trades. Script from §2. Field kit: one-page Telugu flyer with QR, 5-min onboarding done FOR them on the spot (photo, voice intro, services, UPI ID). Sources: electrical/hardware shops, AC repair markets, apartment watchmen ("who fixes things here?"), existing Justdial listings (call them — they're pre-qualified AND pre-annoyed).
- **Demand (weeks 8–12):** apartment/society WhatsApp groups (the informal market — join it, don't fight it) · RWA secretaries (offer "verified directory for your society") · Telugu reels (3/week: provider hero stories — "Ravi anna, 12 years fixing ACs, keeps 100% of what you pay") · kirana/pharmacy QR posters · local FB groups · one local-press pitch ("Vijayawada engineer in Germany builds zero-commission app for local workers" — genuinely newsworthy).
- **Encouragement mechanics:** provider leaderboard (jobs done this month) · "Founding Professional" badge for first 100 (permanent, free Verified) · customer referral = nothing in v1 (the product IS free; referrals come from delight).
- **Gate 6→7:** no paid marketing until analytics show D7 retention and repeat-connection signal — or you explicitly accept a leaky bucket.

---

## 11. METRICS & KILL CRITERIA

**North star: verified jobs/week** (bookings that passed the doorstep handshake).
**Dispatch health (weekly, from week 1 of city ops):** median time-to-assign <5 min · dispatch success (assigned within 2 waves) >80% · swap rate <15% (higher = matching quality problem) · fairness-quota fill >50% (lower = not enough new supply nearby).
- **Day 30 (of city ops):** <30 providers onboarded even free → supply thesis broken → switch category or city.
- **Day 60:** <150 real customer→provider connections → demand broken → pivot channel (society-B2B) or city.
- **Day 90:** providers report zero job flow → do NOT launch paid tier; fix demand first.
- **Month 6:** <40 providers paying ₹49–99 → willingness-to-pay broken → major pivot. ≥100 paying (₹10k MRR) + >20% repeat connections → scale to city #2 (Hyderabad or second AP city).
- Break-even ≈ 500–800 paying providers. 100 = validation, not profit.

## 12. BUDGET (6 months, ₹)

| Item | ₹ |
|---|---|
| Apple $99 + Google $25 + domain | ~11,000 |
| Supabase Pro (4 mo) + EAS + SMS/WhatsApp credits | ~15,000–25,000 |
| KYC vendor checks (~150 providers) | ~5,000–20,000 |
| On-ground person (₹15–18k × 4 mo) | 60,000–72,000 |
| Flyers, posters, reels boosting | 30,000–50,000 |
| Incorporation + CA/GST opinion | 35,000–50,000 |
| Buffer | 30,000 |
| **Total** | **~₹1.9–2.6 lakh** ✅ within your envelope |

## 13. VERIFY-BEFORE-TRUSTING LIST (things this plan states that MUST be re-checked live — store-rule reflex)
1. Google closed-testing tester count (12 vs 20) + current process — check Play Console the day you create the account.
2. Apple current minimum Xcode/iOS SDK at submission time.
3. Telangana/AP gig-worker act status at launch (affects Hyderabad expansion).
4. GST/ECO/TCS opinion from an Indian CA in writing before charging providers.
5. MSG91/2Factor SMS rates · WhatsApp Cloud API pricing · KYC vendor per-check quotes · EAS free-tier build quota · OLA Maps pricing.
6. Web-sold provider subscription vs Apple 3.1.3 ("services consumed outside the app") — current guideline text at submission.
7. Name availability (Play/App Store, domain, trademark) — never assume.

## 14. WHAT THIS PLAN DELIBERATELY EXCLUDES FROM V1 (so you don't drift)
Wallet/escrow · in-app payment collection · scheduling calendar · provider training content · customer membership · maid/cleaning category · multi-city · iPad/tablet · dark mode · Truecaller login · number masking (v1.1 if budget) · admin dashboard beyond Supabase Studio.

**Next session command:** *"Read CLAUDE.md — Phase P0 scaffold, per master plan §9."* If CLAUDE.md doesn't exist yet, that session creates it first.
