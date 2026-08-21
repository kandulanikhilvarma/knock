import { useEffect } from 'react';
import { Platform, View, Pressable, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { Stack, useRouter, type ErrorBoundaryProps } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoSansTelugu_400Regular,
  NotoSansTelugu_700Bold,
} from '@expo-google-fonts/noto-sans-telugu';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';
// Indic DISPLAY faces — give Telugu/Hindi headlines the same character + weight
// English gets from Bricolage (Noto Sans is body-grade only). Baloo superfamily:
// warm, confident, multi-weight, one design across scripts.
import {
  BalooTammudu2_600SemiBold,
  BalooTammudu2_700Bold,
  BalooTammudu2_800ExtraBold,
} from '@expo-google-fonts/baloo-tammudu-2';
import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';

import { useTranslation } from 'react-i18next';
import AppText from '../components/AppText';
import { colors, font, space, radius, type, tap } from '../theme/tokens';

import { initSentry, Sentry } from '../lib/sentry';
import { setSessionFromUrl } from '../lib/auth';

import '../lib/i18n';

initSentry();
SplashScreen.preventAutoHideAsync();

// Web only: RN-web draws the browser's black focus box on every <input>. Kill it
// and give keyboard users a soft forest ring instead (focus-visible = keyboard,
// not mouse, so a tap never shows a box). Also stop the mobile-first layout from
// ever scrolling sideways on a wide desktop window.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('app-web-fixes')) {
  const s = document.createElement('style');
  s.id = 'app-web-fixes';
  s.textContent = `
    input, textarea { outline: none !important; }
    input:focus-visible, textarea:focus-visible {
      outline: 2px solid rgba(15,58,44,0.35) !important;
      outline-offset: 2px;
    }
    html, body, #root { overflow-x: hidden; max-width: 100%; }
  `;
  document.head.appendChild(s);
}

const queryClient = new QueryClient();

// One consistent, premium back control for every stack screen. Safe-back: if the
// history is empty (deep link, web refresh, or a screen reached via replace) the
// native arrow would be dead — fall back to home so "back" always goes somewhere.
function HeaderBack() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      hitSlop={12}
      style={({ pressed }) => [hb.back, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.back')}
    >
      <Ionicons name="chevron-back" size={22} color={colors.ink} />
    </Pressable>
  );
}

function RootLayout() {
  const { i18n } = useTranslation();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSansTelugu_400Regular,
    NotoSansTelugu_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_700Bold,
    BalooTammudu2_600SemiBold,
    BalooTammudu2_700Bold,
    BalooTammudu2_800ExtraBold,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Finish sign-in when a magic link / OAuth redirect deep-links back into the
  // app — cold start (getInitialURL) and warm (the 'url' event) both.
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      setSessionFromUrl(url).catch(() => {});
    });
    Linking.getInitialURL().then((url) => {
      if (url) setSessionFromUrl(url).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  // Header titles are drawn by the navigator, so the serif has to be swapped
  // per script here the way AppText does it everywhere else.
  const lang = i18n.language;
  const headerFont =
    lang === 'te' ? font.teBold : lang === 'hi' ? font.hiBold : font.display;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
            headerTintColor: colors.ink,
            headerTitleStyle: { fontFamily: headerFont, color: colors.ink },
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: colors.bg },
            // Every stack header gets the same safe-back control (screens with
            // headerShown:false — tabs, welcome, search, dispatch — bring their own).
            headerBackVisible: false,
            headerLeft: () => <HeaderBack />,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="category/[slug]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="provider/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="auth/phone" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="auth/otp" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="auth/role" options={{ headerShown: false }} />
          {/* These set their own titles; without a header there is no way back. */}
          <Stack.Screen name="auth/email" options={{ headerShown: true }} />
          <Stack.Screen name="booking/new" options={{ headerShown: true }} />
          <Stack.Screen name="booking/[id]" options={{ headerShown: true }} />
          <Stack.Screen name="chat/[bookingId]" options={{ headerShown: true }} />
          <Stack.Screen name="jobs/index" options={{ headerShown: true }} />
          <Stack.Screen name="jobs/earnings" options={{ headerShown: true }} />
          <Stack.Screen name="jobs/reviews" options={{ headerShown: true }} />
          <Stack.Screen name="verified" options={{ headerShown: true }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="provider-setup" options={{ headerShown: true }} />
          <Stack.Screen name="addresses" options={{ headerShown: true }} />
          <Stack.Screen name="dispatch" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

// expo-router renders this instead of a white screen when a child route throws
// during render. `retry` re-mounts the segment. Sentry.wrap (below) still gets
// the report; this is the recovery UI the user sees.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <View style={eb.screen}>
      <AppText style={eb.title}>{t('common.crashTitle')}</AppText>
      <AppText style={eb.sub}>{t('common.crashSub')}</AppText>
      {__DEV__ && <AppText style={eb.detail}>{error.message}</AppText>}
      <Pressable style={eb.cta} onPress={retry} accessibilityRole="button">
        <AppText style={eb.ctaTxt}>{t('common.crashRetry')}</AppText>
      </Pressable>
    </View>
  );
}

const hb = StyleSheet.create({
  back: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const eb = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  title: { fontFamily: font.displayBold, fontSize: type.hero, color: colors.ink, textAlign: 'center' },
  sub: { fontFamily: font.regular, fontSize: type.body, color: colors.inkMuted, textAlign: 'center' },
  detail: { fontFamily: font.mono, fontSize: type.small, color: colors.danger, textAlign: 'center', marginTop: space.sm },
  cta: { marginTop: space.md, height: tap.min, paddingHorizontal: space.xl, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
});

// Wraps the tree so unhandled render errors reach Sentry with the route stack.
export default Sentry.wrap(RootLayout);
