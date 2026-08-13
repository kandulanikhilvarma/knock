import { colors } from '../theme/tokens';

// Shifud signature: each category sits on its own soft pastel block. Stable
// per-slug so a category keeps its colour everywhere it appears.
const PASTELS = [colors.pastelPink, colors.pastelBlue, colors.pastelSage, colors.pastelPeach];

const MAP: Record<string, string> = {
  electrician: colors.pastelPeach,
  plumber: colors.pastelBlue,
  ac_appliance: colors.pastelSage,
  carpenter: colors.pastelPeach,
  painter: colors.pastelPink,
  cleaning: colors.pastelBlue,
  pest_control: colors.pastelSage,
  two_wheeler: colors.pastelPink,
  cctv: colors.pastelBlue,
  tutor: colors.pastelPeach,
  fitness: colors.pastelSage,
  beautician: colors.pastelPink,
};

export function categoryTint(slug: string): string {
  if (MAP[slug]) return MAP[slug];
  // deterministic fallback for any new slug
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PASTELS[h % PASTELS.length];
}
