# Design spec — Doorstep, extended (BRAND_LOCK soft)

The approved direction stays: paper ground, forest as the one action, emerald for proof, gold for value, Bricolage Grotesque display. This run changes only values that fail WCAG AA, plus states and motion. It adds no new colour families.

Inspiration: the Mobbin MCP returned 503. The references are the approved Doorstep system in `CLAUDE.md` and the current screens in `screens/before/`.

## Token changes (contrast)

Ratios were computed with the WCAG 2 formula (`node` script, this run).

| Token | Before | After | Worst pair before | After |
|---|---|---|---|---|
| `inkMuted` | `#767263` | `#67635A` | 3.90 on `bg` | 4.85 on `bg`, 5.64 on `surface` |
| `danger` | `#BE4A31` | `#A33F29` | 4.04 on `bg` | 5.15 on `bg`; `onDark` on it 5.54 |
| `goldDeep` | `#A65E31` | `#8F5029` | 3.90 on `tintGold` | 4.97 on `tintGold` |

Not changed:
- `gold` `#CF8A3C` stays for the ₹0 coin fill (decorative, with text on top in `ink`).
- `success` `#1E9E6A` stays as a fill. Text on it must be ≥ 18.66 px bold (3.22:1, large-text pass) or use `successInk` (6.11:1).
- `line` stays for dividers. It is not used for meaning.

## Component rules

| Rule | Detail |
|---|---|
| Text on light cards | `ink` for titles, `inkMuted` for subtitles. `onDark` / `onDarkMuted` only on `primary` surfaces. Fixes VIS-1. |
| Rating stars | Selected: `goldDeep` (5.91:1 on `surface`). Unselected: `inkMuted` outline. Each star: role `radio`, label "N stars", `selected` state. |
| Verified badge | `tintSuccess` ground, `successInk` text and icon (5.25:1). Gold is for value only. |
| Toggle chips and rows | `accessibilityState={{ selected }}` or `{{ checked }}`. The selected fill is `primary`, not emerald (emerald = proof). |
| Icon-only buttons | `accessibilityRole="button"` + a localized `accessibilityLabel`. Hit area ≥ 44 px (use `hitSlop` when the visual is smaller). |
| Inputs | `accessibilityLabel` from the visible label key. |
| Error text | Localized, from `errorMessage(e, t)`. The raw text goes to Sentry, not to the screen. |
| Disabled submit | A one-line hint under the button that says what is missing (F1). |

## States

Every data screen shows these four states: loading, error with Retry, empty, content. `ErrorState` takes `onRetry` on each screen (B07).

## Motion

| Animation | Where | Reduced motion |
|---|---|---|
| Loading pulse | `components/StateView.tsx` | Static; the loop stops on unmount |
| FadeIn | `components/FadeIn.tsx` | Render at full opacity, no translate |
| Doorstep scene | home hero | Already honours reduce-motion |
| Finding-pro radar / live map pulse | dispatch, booking | Static frame |

One shared hook, `useReducedMotion()`, reads `AccessibilityInfo.isReduceMotionEnabled` and subscribes to changes.

## Adaptive icon

`app.json` `android.adaptiveIcon.backgroundColor`: `#1B4B8F` (old blue) → `#0F3A2C` (forest).
