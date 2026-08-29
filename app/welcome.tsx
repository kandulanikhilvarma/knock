import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import OrganicLines from '../components/OrganicLines';
import { LANG_KEY } from '../components/LanguageSwitcher';
import { colors, space, radius, font, type, shadow, pressed } from '../theme/tokens';

export const SEEN_KEY = 'app.welcomeSeen';

// Master plan §2-4: the language picker belongs on the FIRST launch, not buried
// in settings. Each option is written in its own script so it needs no reading.
const LANGS = [
  { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
  { code: 'en', label: 'English', sub: 'English' },
  { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
];

export default function Welcome() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  async function pick(code: string) {
    await i18n.changeLanguage(code);
    AsyncStorage.multiSet([
      [LANG_KEY, code],
      [SEEN_KEY, '1'],
    ]).catch(() => {});
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.hero}>
        <OrganicLines color={colors.primary} opacity={0.12} />
        <View style={styles.coin}>
          <AppText style={styles.coinTxt}>₹0</AppText>
        </View>
        <AppText lockFont style={styles.brand}>{t('app.name')}</AppText>
        <AppText style={styles.title}>{t('welcome.title')}</AppText>
        <AppText style={styles.sub}>{t('welcome.sub')}</AppText>
      </View>

      <View style={styles.list}>
        <AppText style={styles.pickLbl}>{t('welcome.choose')}</AppText>
        {LANGS.map((l) => {
          const on = i18n.language === l.code;
          return (
            <Pressable
              key={l.code}
              style={({ pressed: p }) => [styles.row, on && styles.rowOn, p && pressed]}
              onPress={() => pick(l.code)}
            >
              <View style={{ flex: 1 }}>
                <AppText style={[styles.rowTxt, on && styles.rowTxtOn]}>{l.label}</AppText>
                <AppText style={[styles.rowSub, on && styles.rowSubOn]}>{l.sub}</AppText>
              </View>
              <Ionicons
                name={on ? 'checkmark-circle' : 'chevron-forward'}
                size={20}
                color={on ? colors.onDark : colors.inkMuted}
              />
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: space.lg, justifyContent: 'space-between' },
  hero: { paddingTop: space.xxl, overflow: 'hidden' },
  coin: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
  },
  coinTxt: { fontFamily: font.displayBold, fontSize: 22, color: colors.goldDeep },
  brand: { fontFamily: font.displayBold, fontSize: type.display, letterSpacing: -0.8, color: colors.primary, marginBottom: space.xs },
  title: {
    fontFamily: font.displayBold,
    fontSize: type.display,
    lineHeight: type.display + 4,
    color: colors.ink,
  },
  sub: {
    fontFamily: font.regular,
    fontSize: type.body,
    lineHeight: 23,
    color: colors.ink2,
    marginTop: space.md,
    maxWidth: '92%',
  },

  list: { gap: space.sm, paddingBottom: space.lg },
  pickLbl: {
    fontFamily: font.semibold,
    fontSize: type.small,
    color: colors.inkMuted,
    marginBottom: space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 66,
    paddingHorizontal: space.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  rowOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  rowTxt: { fontFamily: font.displayBold, fontSize: type.h2, color: colors.ink },
  rowTxtOn: { color: colors.onDark },
  rowSub: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted },
  rowSubOn: { color: colors.onDarkMuted },
});
