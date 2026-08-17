import { View, Text, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { colors, font, radius, space, type } from '../theme/tokens';

// `name` is the language's endonym — read aloud by screen readers, where the
// two-glyph chip label ("EN", "తె") would be meaningless.
const LANGS: { code: string; label: string; name: string }[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'te', label: 'తె', name: 'తెలుగు' },
  { code: 'hi', label: 'हि', name: 'हिन्दी' },
];

export const LANG_KEY = 'app.lang';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const active = i18n.language;

  async function pick(code: string) {
    await i18n.changeLanguage(code);
    AsyncStorage.setItem(LANG_KEY, code).catch(() => {});
  }

  return (
    <View style={styles.row}>
      {LANGS.map((l) => {
        const on = active === l.code;
        return (
          <Pressable
            key={l.code}
            onPress={() => pick(l.code)}
            style={[styles.chip, on && styles.chipOn]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={l.name}
            accessibilityState={{ selected: on }}
          >
            <AppText style={[styles.txt, on && styles.txtOn]}>{l.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xs },
  chip: {
    minWidth: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  txt: { fontFamily: font.semibold, fontSize: type.small, color: colors.inkMuted },
  txtOn: { color: colors.surface },
});
