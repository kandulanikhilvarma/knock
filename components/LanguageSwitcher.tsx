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

export default function LanguageSwitcher({ onDark = false }: { onDark?: boolean }) {
  const { i18n } = useTranslation();
  const active = i18n.language;

  async function pick(code: string) {
    await i18n.changeLanguage(code);
    AsyncStorage.setItem(LANG_KEY, code).catch(() => {});
  }

  return (
    <View style={[styles.row, onDark && styles.rowDark]}>
      {LANGS.map((l) => {
        const on = active === l.code;
        return (
          <Pressable
            key={l.code}
            onPress={() => pick(l.code)}
            style={[
              onDark ? styles.chipDark : styles.chip,
              on && (onDark ? styles.chipOnDark : styles.chipOn),
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={l.name}
            accessibilityState={{ selected: on }}
          >
            <AppText
              style={[
                onDark ? styles.txtDark : styles.txt,
                on && (onDark ? styles.txtOnDark : styles.txtOn),
              ]}
            >
              {l.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xs },
  // onDark: one translucent pill housing the chips, matching the forest hero.
  rowDark: { gap: 2, padding: 3, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.1)' },
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
  chipDark: {
    minWidth: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: radius.pill,
  },
  chipOnDark: { backgroundColor: colors.surface },
  txtDark: { fontFamily: font.semibold, fontSize: type.small, color: colors.onDarkMuted },
  txtOnDark: { color: colors.primary },
});
