import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type } from '../../theme/tokens';
import { setRole } from '../../lib/auth';

export default function RoleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function pick(role: 'customer' | 'provider') {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      await setRole(role);
      router.replace('/(tabs)');
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.body}>
        <AppText style={styles.title}>{t('auth.roleTitle')}</AppText>

        <Pressable style={styles.card} onPress={() => pick('customer')} disabled={busy}>
          <Ionicons name="search" size={28} color={colors.primary} />
          <AppText style={styles.cardTitle}>{t('auth.roleCustomer')}</AppText>
          <AppText style={styles.cardSub}>{t('auth.roleCustomerSub')}</AppText>
        </Pressable>

        <Pressable style={styles.card} onPress={() => pick('provider')} disabled={busy}>
          <Ionicons name="construct" size={28} color={colors.primary} />
          <AppText style={styles.cardTitle}>{t('auth.roleProvider')}</AppText>
          <AppText style={styles.cardSub}>{t('auth.roleProviderSub')}</AppText>
        </Pressable>

        {err && <AppText style={styles.err}>{err}</AppText>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: space.xl, gap: space.lg, justifyContent: 'center' },
  title: { fontFamily: font.bold, fontSize: type.h1, color: colors.ink, marginBottom: space.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.xl,
    gap: space.xs,
  },
  cardTitle: { fontFamily: font.bold, fontSize: type.h3, color: colors.ink, marginTop: space.sm },
  cardSub: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger, textAlign: 'center' },
});
