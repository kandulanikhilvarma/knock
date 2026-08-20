// Design tokens — source of truth for the app's visual system.
// Direction "Doorstep" (approved 2026-08-20, supersedes "Shifud"): warm paper
// ground, deepened forest-green as the one action, a confident grotesque display
// (Bricolage Grotesque) in place of the serif, a living emerald for proof, brighter
// cards for real depth, the ₹0 coin as a premium badge. Same rules — forest is the
// single action, emerald is proof, gold is value — executed with more contrast.
// To re-theme the whole app: change these values — screens read only these names.

export const colors = {
  // deep forest green — dark surfaces AND the one action (CTA pills)
  primary: '#0F3A2C',
  primarySoft: '#155041',
  accent: '#0F3A2C', // the ONE action per screen — a forest-green pill
  accentWarm: '#155041',
  // warm value accent — the ₹0 coin ring / price emphasis
  gold: '#CF8A3C',
  goldDeep: '#A65E31',
  // proof only — verified / available / paid (a living emerald, distinct from forest)
  success: '#1E9E6A',
  successInk: '#186B49',
  // grounds + text
  bg: '#ECE7DA', // warm paper ground
  surface: '#FBF8F1', // bright cream card — lifts off the ground
  ink: '#14150F', // warm near-black type
  ink2: '#3A3A30',
  inkMuted: '#767263', // warm gray
  line: '#E4DDCC',
  line2: '#EDE7D8',
  danger: '#BE4A31', // warm brick red
  onDark: '#F3EFE4', // cream text on forest surfaces
  onDarkMuted: '#A9BDA9', // muted cream-green on forest
  // pastel blocks behind category items
  pastelPink: '#F0C9C4',
  pastelBlue: '#BFD6DF',
  pastelSage: '#C8D9B7',
  pastelPeach: '#F1C6A6',
  peach: '#ECAF87', // price / tag pills
  // flat tints of success/gold over the surface — pill and card grounds.
  // Flat, not alpha, so they never darken twice when stacked on a card.
  tintSuccess: '#DCEBE1',
  tintGold: '#F1E3CF',
} as const;

// 4pt spacing scale.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// Softer, larger radii — Shifud cards are generously rounded.
export const radius = { card: 22, chip: 16, pill: 999 } as const;

// 48px minimum tap target.
export const tap = { min: 48 } as const;

// Elevation — deeper, greener soft lift for real premium depth (shadow tinted
// toward the forest ground, not black). RN takes one shadow per view.
export const shadow = {
  card: {
    shadowColor: '#152016',
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
  },
  soft: {
    shadowColor: '#152016',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
} as const;

// Pressable feedback — subtle scale + dim, applied uniformly to tappable cards.
export const pressed = { opacity: 0.9, transform: [{ scale: 0.985 }] } as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // confident grotesque display — Bricolage Grotesque, the Doorstep voice (Latin).
  // Modern and characterful without the cream-serif cliché. AppText falls
  // Telugu/Hindi display back to their Noto face (no Latin display for those scripts).
  display: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
  displayLight: 'BricolageGrotesque_500Medium',
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
  display: 33, // big editorial screen titles — Bricolage reads a touch smaller than the old serif
  hero: 25,
  h1: 20,
  h2: 18,
  h3: 16,
  body: 15,
  small: 13,
  chip: 11,
} as const;
