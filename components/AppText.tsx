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
  // Noto ships 400 + 700 only: medium folds to regular, semibold to bold.
  te: { r: 'NotoSansTelugu_400Regular', m: 'NotoSansTelugu_400Regular', s: 'NotoSansTelugu_700Bold', b: 'NotoSansTelugu_700Bold' },
  hi: { r: 'NotoSansDevanagari_400Regular', m: 'NotoSansDevanagari_400Regular', s: 'NotoSansDevanagari_700Bold', b: 'NotoSansDevanagari_700Bold' },
};
// Editorial serif is Latin-only; Telugu/Hindi display falls back to their bold.
const DISPLAY: Record<Lang, string> = {
  en: '', // keep the Fraunces weight the style already set
  te: 'NotoSansTelugu_700Bold',
  hi: 'NotoSansDevanagari_700Bold',
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
  if (fam && fam !== 'monospace') {
    if (/PlayfairDisplay|Fraunces/.test(fam)) {
      if (DISPLAY[lang]) swap = { fontFamily: DISPLAY[lang] }; // en keeps Fraunces
    } else {
      swap = { fontFamily: FAM[lang][weightOf(fam)] };
    }
  }
  // Telugu and Devanagari stack vowel signs above and below the baseline, so a
  // Latin-tuned lineHeight clips them. Floor every line at 1.45x the size.
  if (lang !== 'en' && typeof flat?.fontSize === 'number') {
    const min = Math.ceil(flat.fontSize * 1.45);
    if (!flat.lineHeight || flat.lineHeight < min) swap = { ...swap, lineHeight: min };
  }
  return <RNText {...rest} style={[style, swap]} />;
}
