import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, space, radius, font, type } from '../../theme/tokens';

export default function Home() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('home.greeting')}</Text>
        <Text style={styles.tagline}>{t('app.tagline')}</Text>
      </View>

      {/* ₹0-commission city earnings counter — §5 signature element */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {t('home.counter', { amount: '0', city: 'Vijayawada' })}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.lg },
  header: { paddingTop: space.xl, gap: space.xs },
  greeting: { fontFamily: font.bold, fontSize: type.h1, color: colors.ink },
  tagline: { fontFamily: font.medium, fontSize: type.body, color: colors.accent },
  counter: {
    marginTop: space.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    padding: space.lg,
  },
  counterText: { fontFamily: font.semibold, fontSize: type.small, color: colors.surface },
});
