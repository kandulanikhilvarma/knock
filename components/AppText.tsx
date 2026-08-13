import { Text as RNText, StyleSheet, type TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';

// Locale-aware text. Screens author styles with any font.* family; this swaps the
// family to the ACTIVE language's script at render — English→Inter, Telugu→Noto
// Telugu, Hindi→Noto Devanagari — preserving the weight tier. Numbers set in
// 'monospace' stay mono. Fixes English rendering in the Telugu face.
type Weight = 'r' | 'm' | 's' | 'b';
const FAM: Record<'en' | 'te' | 'hi', Record<Weight, string>> = {
  en: { r: 'Inter_400Regular', m: 'Inter_500Medium', s: 'Inter_600SemiBold', b: 'Inter_700Bold' },
  // Noto ships 400 + 700 only: medium folds to regular, semibold to bold.
  te: { r: 'NotoSansTelugu_400Regular', m: 'NotoSansTelugu_400Regular', s: 'NotoSansTelugu_700Bold', b: 'NotoSansTelugu_700Bold' },
  hi: { r: 'NotoSansDevanagari_400Regular', m: 'NotoSansDevanagari_400Regular', s: 'NotoSansDevanagari_700Bold', b: 'NotoSansDevanagari_700Bold' },
};

function weightOf(fam: string): Weight {
  if (/SemiBold|_600/.test(fam)) return 's';
  if (/Bold|_700/.test(fam)) return 'b';
  if (/Medium|_500/.test(fam)) return 'm';
  return 'r';
}

export default function AppText({ style, ...rest }: TextProps) {
  const { i18n } = useTranslation();
  const lang = (['en', 'te', 'hi'].includes(i18n.language) ? i18n.language : 'en') as 'en';
  const flat = StyleSheet.flatten(style) as { fontFamily?: string } | undefined;
  const fam = flat?.fontFamily;
  const swap = fam && fam !== 'monospace' ? { fontFamily: FAM[lang][weightOf(fam)] } : null;
  return <RNText {...rest} style={[style, swap]} />;
}
