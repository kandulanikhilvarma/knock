import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { verifyOtp, getMyProfile } from '../../lib/auth';

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Missing param (e.g. deep-link straight here) → back to phone entry.
  useEffect(() => {
    if (!phone) router.replace('/auth/phone');
  }, [phone, router]);
  if (!phone) return null;

  const valid = /^\d{4,8}$/.test(code.trim());

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      await verifyOtp(phone, code.trim());
      const profile = await getMyProfile();
      // First sign-in with no role yet → choose role; else into the app.
      if (!profile?.role) router.replace('/auth/role');
      else router.replace('/(tabs)');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ title: '' }} />
      <View style={styles.body}>
        <AppText style={styles.title}>{t('auth.otpTitle')}</AppText>
        <AppText style={styles.sub}>{t('auth.otpSub', { phone })}</AppText>

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="––––––"
          placeholderTextColor={colors.line}
          keyboardType="number-pad"
          maxLength={8}
          autoFocus
        />
        {err && <AppText style={styles.err}>{err}</AppText>}

        <Pressable
          style={[styles.cta, (!valid || busy) && styles.ctaOff]}
          disabled={!valid || busy}
          onPress={submit}
        >
          <AppText style={styles.ctaTxt}>{busy ? t('auth.verifying') : t('auth.verify')}</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: space.xl, gap: space.md },
  title: { fontFamily: font.displayBold, fontSize: type.hero, color: colors.ink },
  sub: { fontFamily: font.regular, fontSize: type.body, color: colors.inkMuted, marginBottom: space.sm },
  input: {
    height: 64,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    textAlign: 'center',
    letterSpacing: 8,
    fontFamily: font.bold,
    fontSize: type.h1,
    color: colors.ink,
  },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger },
  cta: {
    marginTop: space.sm,
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
});
