import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AppText from '../../components/AppText';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap, pressed } from '../../theme/tokens';
import { supabase } from '../../lib/supabase';
import { signInWithGoogle, sendEmailCode, verifyEmailCode } from '../../lib/auth';

// Finishes any auth session left open when the app was backgrounded mid-redirect.
WebBrowser.maybeCompleteAuthSession();

// Sign-in. Google is the one-tap path; email + password stays for pros and test
// accounts (phone OTP needs an SMS provider that isn't wired yet).
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

  const google = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: () => router.back(),
  });

  const guest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    },
    onSuccess: () => router.back(),
  });

  // Passwordless: email a 6-digit code, then verify it in-app. No deep link, so
  // it works inside Expo Go (unlike Google/magic-link, which need a dev build).
  const [code, setCode] = useState('');
  const send = useMutation({ mutationFn: () => sendEmailCode(email) });
  const verify = useMutation({
    mutationFn: () => verifyEmailCode(email, code),
    onSuccess: () => router.back(),
  });

  const emailValid = email.includes('@');
  const valid = emailValid && password.length >= 6;
  const busy = m.isPending || google.isPending || guest.isPending || send.isPending || verify.isPending;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t('auth.emailTitle') }} />

      <View style={styles.brand}>
        <View style={styles.coin}>
          <AppText style={styles.coinTxt}>₹0</AppText>
        </View>
        <AppText style={styles.tagline}>{t('app.tagline')}</AppText>
      </View>

      <AppText style={styles.title}>{t('auth.emailTitle')}</AppText>
      <AppText style={styles.sub}>{t('auth.emailSub')}</AppText>

      {/* One-tap Google — the frictionless primary path. */}
      <Pressable
        style={({ pressed: p }) => [styles.google, p && pressed, busy && styles.ctaOff]}
        disabled={busy}
        onPress={() => google.mutate()}
      >
        <Ionicons name="logo-google" size={18} color={colors.onDark} />
        <AppText style={styles.googleTxt}>{google.isPending ? t('auth.verifying') : t('auth.google')}</AppText>
      </Pressable>
      {google.isError && <AppText style={styles.err}>{(google.error as Error).message}</AppText>}

      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <AppText style={styles.orTxt}>{t('auth.or')}</AppText>
        <View style={styles.orLine} />
      </View>

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
        style={({ pressed: p }) => [styles.cta, p && pressed, (!valid || busy) && styles.ctaOff]}
        disabled={!valid || busy}
        onPress={() => m.mutate()}
      >
        <AppText style={styles.ctaTxt}>{m.isPending ? t('auth.verifying') : t('auth.signInBtn')}</AppText>
      </Pressable>
      {m.isError && <AppText style={styles.err}>{(m.error as Error).message}</AppText>}

      {/* Passwordless code — no password needed, just the email above. Works in
          Expo Go because there's no redirect: read the code, type it here. */}
      {send.isSuccess ? (
        <View style={styles.codeBox}>
          <AppText style={styles.sentTxt}>{t('auth.codeSentTo', { email })}</AppText>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('auth.codePlaceholder')}
            placeholderTextColor={colors.inkMuted}
            keyboardType="number-pad"
            autoFocus
            maxLength={6}
          />
          <Pressable
            style={({ pressed: p }) => [styles.cta, p && pressed, (code.length < 6 || busy) && styles.ctaOff]}
            disabled={code.length < 6 || busy}
            onPress={() => verify.mutate()}
          >
            <AppText style={styles.ctaTxt}>{verify.isPending ? t('auth.verifying') : t('auth.verifyCode')}</AppText>
          </Pressable>
          {verify.isError && <AppText style={styles.err}>{(verify.error as Error).message}</AppText>}
          <Pressable disabled={busy} onPress={() => send.mutate()}>
            <AppText style={styles.resend}>{send.isPending ? t('auth.sending') : t('auth.resend')}</AppText>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed: p }) => [styles.linkBtn, p && pressed, (!emailValid || busy) && styles.ctaOff]}
          disabled={!emailValid || busy}
          onPress={() => send.mutate()}
        >
          <AppText style={styles.linkTxt}>{send.isPending ? t('auth.sending') : t('auth.emailCode')}</AppText>
        </Pressable>
      )}
      {send.isError && !send.isSuccess && <AppText style={styles.err}>{(send.error as Error).message}</AppText>}

      <Pressable style={styles.guest} disabled={busy} onPress={() => guest.mutate()}>
        <AppText style={styles.guestTxt}>{guest.isPending ? '…' : t('auth.guest')}</AppText>
      </Pressable>
      {guest.isError && <AppText style={styles.err}>{(guest.error as Error).message}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: space.lg, gap: space.md },
  brand: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  coin: {
    width: 56, height: 56, borderRadius: radius.pill, backgroundColor: colors.ink,
    borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  coinTxt: { fontFamily: font.bold, fontSize: 18, color: colors.gold },
  tagline: { fontFamily: font.teBold, fontSize: type.small, color: colors.inkMuted, letterSpacing: 0.3 },
  title: { fontFamily: font.displayBold, fontSize: type.hero, color: colors.ink },
  sub: { fontFamily: font.regular, fontSize: type.body, color: colors.inkMuted, marginTop: -space.xs },

  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    marginTop: space.sm,
  },
  googleTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xs },
  orLine: { flex: 1, height: 1, backgroundColor: colors.line },
  orTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },

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
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.primary },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger },

  linkBtn: { height: tap.min, alignItems: 'center', justifyContent: 'center' },
  linkTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.primary },
  codeBox: { gap: space.sm },
  sentTxt: { fontFamily: font.medium, fontSize: type.small, lineHeight: 19, color: colors.inkMuted },
  codeInput: {
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    fontFamily: font.semibold,
    fontSize: type.hero,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.ink,
  },
  resend: { fontFamily: font.semibold, fontSize: type.small, color: colors.primary, textAlign: 'center', paddingVertical: space.sm },
  guest: {
    height: tap.min,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  guestTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.inkMuted },
});
