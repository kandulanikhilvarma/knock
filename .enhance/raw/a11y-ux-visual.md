# Raw subagent report — A11y / UX / Visual (general-purpose agent, read-only)

i18n parity: en/te/hi = 326 keys each, 0 missing.

## Contrast (AA: 4.5 normal, 3.0 large/UI)

| Pair | Ratio | Normal | Large |
|---|---|---|---|
| onDark #F3EFE4 on surface #FBF8F1 (verify/pay/review titles) | 1.08 | FAIL | FAIL |
| onDarkMuted #A9BDA9 on surface | 1.88 | FAIL | FAIL |
| line #E4DDCC on surface (unselected stars, input borders) | 1.28 | FAIL | FAIL |
| gold #CF8A3C on surface (review stars) | 2.69 | FAIL | FAIL |
| surface on success #1E9E6A | 3.22 | FAIL | pass |
| inkMuted #767263 on bg #ECE7DA | 3.90 | FAIL | pass |
| inkMuted on line2 #EDE7D8 | 3.91 | FAIL | pass |
| goldDeep #A65E31 on tintGold #F1E3CF | 3.90 | FAIL | pass |
| danger #BE4A31 on bg | 4.04 | FAIL | pass |
| onDark on danger (SOS 13px) | 4.34 | FAIL | pass |
| inkMuted on surface | 4.54 | pass | pass |
| onDark on primary (CTA) | 11.00 | pass | pass |
| ink on bg / surface | 14.87 / 17.31 | pass | pass |

Candidate token values: inkMuted → #67635A (4.85 on bg), danger → #A33F29 (5.15 on bg, 5.54 under onDark), goldDeep → #8F5029 (4.97 on tintGold), input border → #958B76 (3.18 on surface).

## Findings

| ID | Sev | Evidence | Fix | Effort | Blocked |
|---|---|---|---|---|---|
| VIS-1 | P0 | `booking/[id].tsx:511-512` codeTitle/codeSub use onDark/onDarkMuted; used on light `verify`/`payCard`/`review` cards | light-card title/sub styles in ink/inkMuted | S | No |
| A11Y-1 | P1 | `tokens.ts:26` inkMuted 3.90 on bg, used app-wide | token → #67635A | S | design sign-off |
| A11Y-2 | P1 | danger 4.04 on bg (all `err`); 4.34 SOS; goldDeep 3.90 StatusPill | danger → #A33F29, goldDeep → #8F5029 | S | design sign-off |
| A11Y-3 | P1 | gold ★ 2.69 on surface; unselected ★ uses line 1.28 | ★ → goldDeep; unselected → inkMuted | S | No |
| A11Y-4 | P1 | ~70 Pressables without accessibilityRole | use `Touchable` / add role | M | No |
| A11Y-5 | P1 | icon-only controls unlabeled: `search.tsx:92,107`, `dispatch.tsx:120`, `addresses.tsx:108`, `provider-setup.tsx:158` | add accessibilityLabel | S | No |
| A11Y-6 | P1 | toggles lack selected/checked state: stars, tags, appliance chips, service chips, availability, language rows | role radio/checkbox + accessibilityState | S | No |
| A11Y-7 | P1 | no TextInput has accessibilityLabel | label from visible label key | S | No |
| A11Y-8 | P2 | targets < 44px (segBtn 40, callBtn 40, quick chips 38, tags ~27, gateBtn 42, thumbX), LanguageSwitcher hitSlop overlap | minHeight tap.min | S | No |
| A11Y-9 | P2 | reduce-motion only honored in DoorstepScene | shared useReducedMotion hook | S | No |
| A11Y-10 | P2 | no live regions for realtime status, errors, SOS armed | accessibilityLiveRegion polite | S | No |
| A11Y-11 | P2 | fixed heights on text containers; 9–10px text | minHeight; floor type.chip | M | No |
| A11Y-12 | P3 | input border 1.28 on surface | lineStrong token #958B76 | S | design sign-off |
| UX-1 | P1 | `chat/[bookingId].tsx:49-53` draft cleared before send, no catch | try/catch, restore draft | S | No |
| UX-2 | P1 | `booking/new.tsx:49-58` retry after partial failure creates 2nd booking; update error ignored | keep id, only re-upload | S | No |
| UX-3 | P1 | silent mutation failures: markDone/markPaid/swap/verify/respondOffer/setAvailability/addresses del+setDef/deleteAccount/signOut | render error per mutation | M | No |
| UX-4 | P1 | raw backend error text shown ~28 places | map to localized message; log raw to Sentry | S | No |
| UX-5 | P1 | `provider.roleLine` "AC & appliance specialist" for every pro; "Speaks Telugu" unconditional; pillar claims Aadhaar+PAN verified | derive from data; soften copy | S | copy sign-off |
| UX-6 | P1 | "Request this pro" dispatches to anyone | rename or pass provider id | S | product decision |
| UX-7 | P1 | placeholder domain `https://services.app` in SOS share + verified portal | real domain | S | domain |
| UX-8 | P2 | dispatch screen creates booking on mount; close does not cancel; `dispatch.cancel` unused | cancel RPC | M | No |
| UX-9 | P2 | ErrorState without onRetry on 8 screens; category blank if cats fail; profile error → "Become a provider" | onRetry refetch | S | No |
| UX-10 | P2 | home earnings shows ₹0 + claim while loading/error | skeleton | S | No |
| UX-11 | P2 | disabled submit with no reason (booking/new, provider-setup) | hint line | S | No |
| UX-12 | P2 | auth/email plain View, keyboard covers CTA | ScrollView | S | No |
| UX-13 | P2 | no plural keys for count strings | _one/_other | S | No |
| UX-14 | P2 | hardcoded strings: "Vijayawada", "LIVE", "Pro", "…", "––––––", "name@bank" | locale keys | S | No |
| UX-15 | P2 | dispatch.s1sub claims Benz Circle when location imprecise; auth.emailSub mentions test accounts | copy | S | copy sign-off |
| UX-16 | P3 | Linking.openURL no catch; toLocaleDateString ignores app language | catch; pass i18n.language | S | No |
| VIS-2 | P2 | ink panels vs forest panels (two dark surfaces) | ink → primary | S | design sign-off |
| VIS-3 | P2 | Verified badge gold; emerald as selected state for Busy/Paused and Matched | badge → success tint; segOn → primary | S | No |
| VIS-4 | P2 | raw colors `#8FE3AB`, `#241703`, rgba, Avatar inks, `#8E2E1C`, QrScanner `#000`; app.json adaptiveIcon `#1B4B8F` | tokens; icon bg #0F3A2C | S | No |
| VIS-5 | P2 | pressed feedback missing on most raw Pressables; web focus ring only on inputs | Touchable; focus-visible CSS for role=button | M | No |
| VIS-6 | P3 | CTA heights 46/48/52; ~189 raw numeric sizes | PrimaryButton; type tokens | M | No |
| VIS-7 | P3 | stale Fraunces/Shifud comments in tokens.ts; unused `Text` import in 12 files | clean up | S | No |

State gaps: booking/new no categories error branch; provider-setup no error branch for `mine`; search no loading state; home earnings (UX-10).

Scores: A11y 3/10 · UX 5/10 · Visual 6/10.
