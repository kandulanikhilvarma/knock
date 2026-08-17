import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
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
import {
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

import { useTranslation } from 'react-i18next';
import { colors, font } from '../theme/tokens';

import { initSentry, Sentry } from '../lib/sentry';
import { setSessionFromUrl } from '../lib/auth';

import '../lib/i18n';

initSentry();
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
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
            contentStyle: { backgroundColor: colors.bg },
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

// Wraps the tree so unhandled render errors reach Sentry with the route stack.
export default Sentry.wrap(RootLayout);
