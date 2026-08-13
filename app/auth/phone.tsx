import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { sendOtp, toE164 } from '../../lib/auth';

export default function PhoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = /^\d{10}$/.test(phone.trim());

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const e164 = toE164(phone);
      await sendOtp(e164);
      router.push({ pathname: '/auth/otp', params: { phone: e164 } });
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
        <AppText style={styles.title}>{t('auth.phoneTitle')}</AppText>
        <AppText style={styles.sub}>{t('auth.phoneSub')}</AppText>

        <View style={styles.inputRow}>
          <AppText style={styles.prefix}>+91</AppText>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('auth.phonePlaceholder')}
            placeholderTextColor={colors.inkMuted}
            keyboardType="number-pad"
            maxLength={10}
            autoFocus
          />
        </View>
        {err && <AppText style={styles.err}>{err}</AppText>}

        <Pressable
          style={[styles.cta, (!valid || busy) && styles.ctaOff]}
          disabled={!valid || busy}
          onPress={submit}
        >
          <AppText style={styles.ctaTxt}>{busy ? t('auth.sending') : t('auth.sendCode')}</AppText>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
  prefix: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink },
  input: { flex: 1, fontFamily: font.regular, fontSize: type.body, color: colors.ink, height: '100%' },
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
