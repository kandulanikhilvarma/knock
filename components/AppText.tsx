import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

// Locale-aware text. Screens author styles with any font.* family; this swaps the
// family to the ACTIVE language's script at render — English→Inter, Telugu→Noto
// Telugu, Hindi→Noto Devanagari — preserving the weight tier. Numbers set in
// 'monospace' stay mono. Fixes English rendering in the Telugu face.
type Lang = 'en' | 'te' | 'hi';
type Weight = 'r' | 'm' | 's' | 'b';
const FAM: Record<Lang, Record<Weight, string>> = {
  en: { r: 'Inter_400Regular', m: 'Inter_500Medium', s: 'Inter_600SemiBold', b: 'Inter_700Bold' },
  // Noto ships 400 + 700 only, and the 700 reads far heavier in these scripts
  // than a Latin bold — conjuncts clot at title sizes. So medium AND semibold
  // fold to regular; only an explicit bold (b) stays 700. Hierarchy comes from
  // size, not weight, which is how Telugu/Devanagari editorial actually sets.
  te: { r: 'NotoSansTelugu_400Regular', m: 'NotoSansTelugu_400Regular', s: 'NotoSansTelugu_400Regular', b: 'NotoSansTelugu_700Bold' },
  hi: { r: 'NotoSansDevanagari_400Regular', m: 'NotoSansDevanagari_400Regular', s: 'NotoSansDevanagari_400Regular', b: 'NotoSansDevanagari_700Bold' },
};
// Editorial serif is Latin-only. Telugu/Hindi display uses REGULAR Noto — the
// bold face is too heavy for big headlines in these scripts; size carries it.
const DISPLAY: Record<Lang, string> = {
  en: '', // keep the Fraunces weight the style already set
  te: 'NotoSansTelugu_400Regular',
  hi: 'NotoSansDevanagari_400Regular',
};

function weightOf(fam: string): Weight {
  if (/SemiBold|_600/.test(fam)) return 's';
  if (/Bold|_700/.test(fam)) return 'b';
  if (/Medium|_500/.test(fam)) return 'm';
  return 'r';
}

export default function AppText({ style, ...rest }: TextProps) {
  const { i18n } = useTranslation();
  const lang = (['en', 'te', 'hi'].includes(i18n.language) ? i18n.language : 'en') as Lang;
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const fam = flat?.fontFamily;
  let swap: TextStyle | null = null;
  const isDisplay = fam ? /PlayfairDisplay|Fraunces/.test(fam) : false;
  if (fam && fam !== 'monospace') {
    if (isDisplay) {
      if (DISPLAY[lang]) swap = { fontFamily: DISPLAY[lang] }; // en keeps Fraunces
    } else {
      swap = { fontFamily: FAM[lang][weightOf(fam)] };
    }
  }
  // Optical tracking for the high-contrast Latin serif: big titles want to draw
  // in, small ones stay as authored. Applied only when the style hasn't set its
  // own letterSpacing, so a deliberate override always wins. Latin only — the
  // Noto scripts are not letter-spaced.
  if (isDisplay && lang === 'en' && flat?.letterSpacing == null && typeof flat?.fontSize === 'number') {
    const s = flat.fontSize;
    const track = s >= 28 ? -0.6 : s >= 20 ? -0.4 : s >= 16 ? -0.2 : 0;
    if (track) swap = { ...swap, letterSpacing: track };
  }
  // Telugu and Devanagari stack vowel signs above and below the baseline, so a
  // Latin-tuned lineHeight clips them. Floor every line at 1.45x the size.
  if (lang !== 'en' && typeof flat?.fontSize === 'number') {
    const min = Math.ceil(flat.fontSize * 1.45);
    if (!flat.lineHeight || flat.lineHeight < min) swap = { ...swap, lineHeight: min };
  }
  return <RNText {...rest} style={[style, swap]} />;
}
