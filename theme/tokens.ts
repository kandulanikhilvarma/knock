// Design tokens — source of truth for the app's visual system.
// Direction approved 2026-08-13 ("Proof on paper, one saffron move"): paper ground,
// ink structure, black-gold ₹0 coin, saffron reserved for the single action, green = proof.
// Supersedes the master-plan §5 blue-led palette per founder approval.
// To re-theme the whole app later: change these values — screens read only these names.

export const colors = {
  // structure / dark surfaces (ink) — was trust-blue
  primary: '#0B0D12',
  primarySoft: '#20242E',
  // the ONE action accent — saffron, CTAs only
  accent: '#FF7A1A',
  accentWarm: '#FF9A4D',
  // ₹0 coin / value
  gold: '#EDC24A',
  goldDeep: '#C99A20',
  // proof only — KYC, verified, paid
  success: '#12A150',
  successInk: '#0C7C3D',
  // grounds + text
  bg: '#F4F5F7', // paper
  surface: '#FFFFFF',
  ink: '#0B0D12',
  ink2: '#20242E',
  inkMuted: '#5A6270',
  line: '#E4E7EE',
  line2: '#EDEFF3',
  danger: '#D64545',
  onDark: '#EFF1F5', // text on ink surfaces
  onDarkMuted: '#9AA3B2',
} as const;

// 4pt spacing scale.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { card: 14, chip: 12, pill: 999 } as const;

// 48px minimum tap target.
export const tap = { min: 48 } as const;

// Elevation — one soft, consistent lift for cards/tiles (premium restraint,
// not hard drop-shadows). iOS reads shadow*, Android reads elevation.
export const shadow = {
  card: {
    shadowColor: '#0B0D12',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  soft: {
    shadowColor: '#0B0D12',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
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
  // Telugu — test first; strings run ~30% longer.
  te: 'NotoSansTelugu_400Regular',
  teBold: 'NotoSansTelugu_700Bold',
  // Hindi
  hi: 'NotoSansDevanagari_400Regular',
  hiBold: 'NotoSansDevanagari_700Bold',
  // numbers stated plainly — platform monospace (transparency)
  mono: 'monospace',
} as const;

export const type = {
  hero: 26,
  h1: 24,
  h2: 20,
  h3: 17,
  body: 16,
  small: 13,
  chip: 11,
} as const;
