import { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import NearbyMap, { type MapPin } from '../components/NearbyMap';
import { colors, space, radius, font, type, shadow, pressed } from '../theme/tokens';
import { getProvidersByCategory, providerName } from '../lib/queries';
import { startDemoBooking } from '../lib/bookings';

// The dispatch loop, made visible: your block on the map, the pros around it,
// then the four steps the engine actually runs (rank → wave 1 → first accept).
const STEPS = ['s1', 's2', 's3', 's4'] as const;

export default function Dispatch() {
  const { t } = useTranslation();
  const router = useRouter();
  const { slug, cid } = useLocalSearchParams<{ slug?: string; cid?: string }>();
  const categorySlug = slug ?? 'electrician';

  const pros = useQuery({
    queryKey: ['dispatch-pros', categorySlug],
    queryFn: () => getProvidersByCategory(categorySlug),
  });

  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{ id: string; providerId: string | null } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const started = useRef(false);

  // Real work starts immediately; the steps below narrate it while it runs.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startDemoBooking(cid ?? null, categorySlug)
      .then(setResult)
      .catch((e: Error) => setFailed(e.message));
  }, [cid, categorySlug]);

  useEffect(() => {
    const a = setTimeout(() => setStep((s) => Math.max(s, 1)), 800);
    const b = setTimeout(() => setStep((s) => Math.max(s, 2)), 1900);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  useEffect(() => {
    if (!result || step < 2) return;
    setStep(3);
    const to = setTimeout(
      () => router.replace({ pathname: '/booking/[id]', params: { id: result.id } }),
      1700,
    );
    return () => clearTimeout(to);
  }, [result, step, router]);

  const fallbackName = t('provider.unnamed').split(' ')[0];
  const list = (pros.data ?? []).slice(0, 5);
  const acceptedId = result?.providerId ?? null;

  const pins: MapPin[] = useMemo(() => {
    if (step < 1) return [];
    // The pro who took the job is always shown, even if outside the top five.
    const rows = list.map((p) => ({
      id: p.user_id,
      name: providerName(p).split(' ')[0] || fallbackName,
    }));
    if (acceptedId && !rows.some((r) => r.id === acceptedId)) {
      rows[0] = { id: acceptedId, name: fallbackName };
    }
    return rows.map((r, i) => ({
      ...r,
      state:
        step >= 3 && r.id === acceptedId
          ? ('accepted' as const)
          : step >= 2 && i < 3
            ? ('pinged' as const)
            : ('idle' as const),
    }));
  }, [list, step, acceptedId, fallbackName]);

  const acceptedName =
    (() => { const p = list.find((x) => x.user_id === acceptedId); return (p ? providerName(p) : '') || t('provider.unnamed'); })();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.bar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed: p }) => [styles.close, p && pressed]}
        >
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
        <AppText style={styles.title}>{failed ? t('dispatch.failed') : t('dispatch.title')}</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NearbyMap pins={pins} youLabel={t('dispatch.you')} />

        <View style={styles.meta}>
          <View style={styles.metaDot} />
          <AppText style={styles.metaTxt}>
            {t('dispatch.nearbyCount', { count: Math.max(list.length, 1) })}
          </AppText>
        </View>

        {failed ? (
          <View style={styles.failBox}>
            <AppText style={styles.failSub}>{t('dispatch.failedSub')}</AppText>
            <Pressable
              style={({ pressed: p }) => [styles.cta, p && pressed]}
              onPress={() => router.replace({ pathname: '/category/[slug]', params: { slug: categorySlug } })}
            >
              <AppText style={styles.ctaTxt}>{t('booking.browseCta')}</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.steps}>
            {STEPS.map((k, i) => (
              <Step
                key={k}
                n={i + 1}
                last={i === STEPS.length - 1}
                state={step > i ? 'done' : step === i ? 'active' : 'todo'}
                title={i === 3 && step >= 3 ? `${acceptedName} · ${t('dispatch.s4')}` : t(`dispatch.${k}`)}
                sub={
                  i === 3
                    ? step >= 3
                      ? t('dispatch.s4sub', { name: acceptedName })
                      : t('dispatch.s4pending')
                    : t(`dispatch.${k}sub`)
                }
              />
            ))}
          </View>
        )}

        <View style={styles.zero}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.gold} />
          <AppText style={styles.zeroTxt}>
            {step >= 3 ? t('dispatch.zero', { name: acceptedName }) : t('booking.zeroNote')}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({
  n,
  title,
  sub,
  state,
  last,
}: {
  n: number;
  title: string;
  sub: string;
  state: 'todo' | 'active' | 'done';
  last: boolean;
}) {
  const a = useRef(new Animated.Value(state === 'todo' ? 0 : 1)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: state === 'todo' ? 0 : 1,
      duration: 260,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [a, state]);

  const done = state === 'done';
  const active = state === 'active';
  return (
    <Animated.View
      style={[
        styles.step,
        { opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.42, 1] }) },
      ]}
    >
      <View style={styles.rail}>
        <View
          style={[
            styles.bullet,
            done && styles.bulletDone,
            active && styles.bulletActive,
          ]}
        >
          {done ? (
            <Ionicons name="checkmark" size={13} color={colors.onDark} />
          ) : active ? (
            <ActivityIndicator size="small" color={colors.onDark} />
          ) : (
            <AppText style={styles.bulletTxt}>{n}</AppText>
          )}
        </View>
        {!last && <View style={[styles.line, done && styles.lineDone]} />}
      </View>
      <View style={styles.stepBody}>
        <AppText style={styles.stepTitle}>{title}</AppText>
        <AppText style={styles.stepSub}>{sub}</AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontFamily: font.displayBold, fontSize: type.h1, color: colors.ink },

  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg },

  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  metaTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.successInk },

  steps: { gap: 0 },
  step: { flexDirection: 'row', gap: space.md },
  rail: { alignItems: 'center', width: 28 },
  bullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  bulletDone: { backgroundColor: colors.success, borderColor: colors.success },
  bulletTxt: { fontFamily: font.bold, fontSize: type.small, color: colors.inkMuted },
  line: { flex: 1, width: 2, backgroundColor: colors.line, marginVertical: 4 },
  lineDone: { backgroundColor: colors.success },
  stepBody: { flex: 1, paddingBottom: space.xl },
  stepTitle: { fontFamily: font.displayBold, fontSize: type.h2, color: colors.ink },
  stepSub: {
    fontFamily: font.regular,
    fontSize: type.small,
    lineHeight: 19,
    color: colors.inkMuted,
    marginTop: 3,
  },

  failBox: { gap: space.md },
  failSub: { fontFamily: font.regular, fontSize: type.body, color: colors.ink2 },
  cta: {
    alignSelf: 'flex-start',
    height: 46,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },

  zero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  zeroTxt: { flex: 1, fontFamily: font.regular, fontSize: type.small, color: colors.ink2 },
});
