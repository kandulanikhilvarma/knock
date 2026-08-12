// Design tokens — source of truth for the app's visual system.
// Locked in services-app-master-plan.md §5. Change here, nowhere else.

export const colors = {
  primary: '#1B4B8F', // trust-blue — headers, primary surfaces, links
  accent: '#FF7A1A', // saffron-orange — CTAs ONLY, never decorative
  success: '#1E9E5A', // verified / paid states
  bg: '#FAF7F2', // bone — app background
  ink: '#17181C', // primary text
  inkMuted: '#6B6E76', // secondary text
  line: '#E7E2D9', // hairline borders on bone
  surface: '#FFFFFF', // card surfaces
  danger: '#D64545', // errors, destructive
} as const;

// 4pt spacing scale.
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  card: 12, // §5: 12px radius cards
  pill: 999,
} as const;

// 48px minimum tap target (§5).
export const tap = { min: 48 } as const;

export const font = {
  // Latin / digits
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // Telugu — must be tested first; strings run ~30% longer (§5)
  te: 'NotoSansTelugu_400Regular',
  teBold: 'NotoSansTelugu_700Bold',
  // Devanagari (Hindi)
  hi: 'NotoSansDevanagari_400Regular',
  hiBold: 'NotoSansDevanagari_700Bold',
} as const;

export const type = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  small: 14,
  chip: 12,
} as const;
