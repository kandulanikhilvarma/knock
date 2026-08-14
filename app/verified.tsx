import { View, ScrollView, Pressable, Linking, Platform, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import { colors, space, radius, font, type, shadow, pressed } from '../theme/tokens';

// Verified Pro, explained. App Store 3.1.3 forbids pointing iOS users at an
// outside purchase, and the post-Epic link entitlement is US-only — so on iOS
// this screen states the benefits and stops. Android may link to the portal.
const BENEFITS = ['badge', 'priority', 'filter', 'support'] as const;
const PORTAL = 'https://services.app/pro';

export default function VerifiedUpsell() {
  const { t } = useTranslation();
  const canLink = Platform.OS === 'android';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: t('verified.title') }} />

      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={26} color={colors.onDark} />
        </View>
        <AppText style={styles.heroTitle}>{t('verified.heroTitle')}</AppText>
        <AppText style={styles.heroSub}>{t('verified.heroSub')}</AppText>
      </View>

      <View style={styles.list}>
        {BENEFITS.map((b) => (
          <View key={b} style={styles.row}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <View style={{ flex: 1 }}>
              <AppText style={styles.rowTitle}>{t(`verified.${b}`)}</AppText>
              <AppText style={styles.rowSub}>{t(`verified.${b}Sub`)}</AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.zero}>
        <AppText style={styles.zeroTxt}>{t('verified.stillZero')}</AppText>
      </View>

      {canLink ? (
        <Pressable
          style={({ pressed: p }) => [styles.cta, p && pressed]}
          onPress={() => Linking.openURL(PORTAL)}
        >
          <AppText style={styles.ctaTxt}>{t('verified.learnMore')}</AppText>
        </Pressable>
      ) : (
        <AppText style={styles.note}>{t('verified.iosNote')}</AppText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },

  hero: { gap: space.sm },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  heroTitle: {
    fontFamily: font.displayBold,
    fontSize: type.hero,
    lineHeight: type.hero + 4,
    color: colors.ink,
  },
  heroSub: { fontFamily: font.regular, fontSize: type.body, lineHeight: 23, color: colors.ink2 },

  list: { gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  rowTitle: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink },
  rowSub: { fontFamily: font.regular, fontSize: type.small, lineHeight: 19, color: colors.inkMuted, marginTop: 2 },

  zero: {
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: colors.tintGold,
  },
  zeroTxt: { fontFamily: font.semibold, fontSize: type.small, lineHeight: 20, color: colors.goldDeep },

  cta: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  note: { fontFamily: font.regular, fontSize: type.small, lineHeight: 19, color: colors.inkMuted },
});
