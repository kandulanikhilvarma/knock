import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { supabase } from '../../lib/supabase';

// Email + password sign-in. Primary use today: test accounts (phone OTP needs
// an SMS provider that isn't wired yet). Also the provider login path.
export default function EmailAuthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    },
    onSuccess: () => router.back(),
  });

  const guest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    },
    onSuccess: () => router.back(),
  });

  const valid = email.includes('@') && password.length >= 6;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t('auth.emailTitle') }} />
      <Text style={styles.title}>{t('auth.emailTitle')}</Text>
      <Text style={styles.sub}>{t('auth.emailSub')}</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.emailPlaceholder')}
        placeholderTextColor={colors.inkMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.passwordPlaceholder')}
        placeholderTextColor={colors.inkMuted}
        secureTextEntry
      />

      <Pressable
        style={[styles.cta, (!valid || m.isPending) && styles.ctaOff]}
        disabled={!valid || m.isPending}
        onPress={() => m.mutate()}
      >
        <Text style={styles.ctaTxt}>{m.isPending ? t('auth.verifying') : t('auth.signInBtn')}</Text>
      </Pressable>
      {m.isError && <Text style={styles.err}>{(m.error as Error).message}</Text>}

      <View style={styles.divider} />
      <Pressable style={styles.guest} disabled={guest.isPending} onPress={() => guest.mutate()}>
        <Text style={styles.guestTxt}>{guest.isPending ? '…' : t('auth.guest')}</Text>
      </Pressable>
      {guest.isError && <Text style={styles.err}>{(guest.error as Error).message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: space.lg, gap: space.md },
  title: { fontFamily: font.bold, fontSize: type.h1, color: colors.ink, paddingTop: space.sm },
  sub: { fontFamily: font.regular, fontSize: type.body, color: colors.inkMuted },
  input: {
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    fontFamily: font.regular,
    fontSize: type.body,
    color: colors.ink,
  },
  cta: {
    height: tap.min,
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
  },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.bold, fontSize: type.body, color: colors.surface },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: space.sm },
  guest: {
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink },
});
