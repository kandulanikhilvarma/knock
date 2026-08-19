// Design tokens — source of truth for the app's visual system.
// Direction "Shifud" (approved 2026-08-14, supersedes "Proof on paper"): warm
// cream ground, deep forest-green as the one action, editorial serif display
// (Fraunces), soft pastel blocks behind category items, peach price tags,
// organic line motifs. Reference: Shifud Dine-In dribbble shot.
// To re-theme the whole app: change these values — screens read only these names.

export const colors = {
  // forest green — dark surfaces AND the one action (CTA pills)
  primary: '#1B3A2B',
  primarySoft: '#2C4E3B',
  accent: '#1B3A2B', // the ONE action per screen — a forest-green pill
  accentWarm: '#2C4E3B',
  // warm value accent — the ₹0 coin ring / price emphasis (was gold)
  gold: '#C87A46',
  goldDeep: '#A65E31',
  // proof only — verified / available / paid (a living green, distinct from forest)
  success: '#3E7A54',
  successInk: '#2C5C3D',
  // grounds + text
  bg: '#EAE5D9', // warm cream paper
  surface: '#F6F2E9', // cream card
  ink: '#191811', // warm near-black type
  ink2: '#3A3A30',
  inkMuted: '#7C7A6B', // warm gray
  line: '#DCD5C5',
  line2: '#E7E1D3',
  danger: '#BE4A31', // warm brick red
  onDark: '#F3EFE4', // cream text on forest surfaces
  onDarkMuted: '#AFB9A6', // muted cream on forest
  // pastel blocks behind category items (Shifud signature)
  pastelPink: '#F0C9C4',
  pastelBlue: '#BFD6DF',
  pastelSage: '#C8D9B7',
  pastelPeach: '#F1C6A6',
  peach: '#ECAF87', // price / tag pills
  // flat tints of success/gold over the cream surface — pill and card grounds.
  // Flat, not alpha, so they never darken twice when stacked on a card.
  tintSuccess: '#E0E4D7',
  tintGold: '#F0E4D5',
} as const;

// 4pt spacing scale.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// Softer, larger radii — Shifud cards are generously rounded.
export const radius = { card: 22, chip: 16, pill: 999 } as const;

// 48px minimum tap target.
export const tap = { min: 48 } as const;

// Elevation — one warm, soft lift (shadow tinted toward the ground, not black).
export const shadow = {
  card: {
    shadowColor: '#3A2E1E',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#3A2E1E',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
} as const;

// Pressable feedback — subtle scale + dim, applied uniformly to tappable cards.
export const pressed = { opacity: 0.9, transform: [{ scale: 0.985 }] } as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // editorial soft-serif display — Fraunces, the Shifud voice (Latin). Warmer and
  // more characterful than a classic Didone. AppText falls Telugu/Hindi display
  // back to their Noto face (no serif bundled for those scripts).
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayLight: 'Fraunces_500Medium',
  // Telugu — test first; strings run ~30% longer.
  te: 'NotoSansTelugu_400Regular',
  teBold: 'NotoSansTelugu_700Bold',
  // Hindi
  hi: 'NotoSansDevanagari_400Regular',
  hiBold: 'NotoSansDevanagari_700Bold',
  // numbers stated plainly — platform monospace
  mono: 'monospace',
} as const;

// Mobile-tuned scale. Fraunces display is high-contrast, so it reads a size
// larger than a sans at the same px — these are set for a ~390pt iPhone, where
// the old 40/30/26 tier shouted. Telugu/Hindi line-height is floored in AppText.
export const type = {
  display: 30, // big editorial screen titles
  hero: 24,
  h1: 20,
  h2: 18,
  h3: 16,
  body: 15,
  small: 13,
  chip: 11,
} as const;
