import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { getBooking, subscribeBooking, swapProvider, type Booking, type BookingStatus } from '../../lib/bookings';
import { getProvider } from '../../lib/queries';
import ProviderCard from '../../components/ProviderCard';
import { Loading, ErrorState } from '../../components/StateView';

// Statuses where the customer is still waiting on a match.
const SEARCHING: BookingStatus[] = ['requested', 'finding_pro'];

export default function BookingStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();

  const q = useQuery({ queryKey: ['booking', id], queryFn: () => getBooking(id!), enabled: !!id });
  const [live, setLive] = useState<Booking | null>(null);

  // Realtime overrides the initial fetch as the status machine advances.
  useEffect(() => {
    if (!id) return;
    return subscribeBooking(id, setLive);
  }, [id]);

  const booking = live ?? q.data ?? null;

  const swap = useMutation({ mutationFn: () => swapProvider(id!) });

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState message={(q.error as Error)?.message} />;
  if (!booking) return <ErrorState message={t('booking.notFound')} />;

  const status = booking.status;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: t('booking.statusTitle') }} />

      {SEARCHING.includes(status) && (
        <View style={styles.finding}>
          <View style={styles.liveDot} />
          <ActivityIndicator color={colors.accent} style={{ marginVertical: space.md }} />
          <Text style={styles.findTitle}>{t('booking.findingPro')}</Text>
          <Text style={styles.findSub}>{t('booking.findingSub')}</Text>
        </View>
      )}

      {status === 'assigned' && booking.assigned_provider_id && (
        <Assigned
          providerId={booking.assigned_provider_id}
          swapUsed={booking.swap_used}
          onSwap={() => swap.mutate()}
          swapping={swap.isPending}
        />
      )}

      {status === 'failed' && (
        <View style={styles.fallback}>
          <Text style={styles.fbTitle}>{t('booking.noProviders')}</Text>
          <Text style={styles.fbSub}>{t('booking.noProvidersSub')}</Text>
          <Pressable
            style={styles.cta}
            onPress={() =>
              router.replace({ pathname: '/category/[slug]', params: { slug: booking.category_slug } })
            }
          >
            <Text style={styles.ctaTxt}>{t('booking.browseCta')}</Text>
          </Pressable>
        </View>
      )}

      {['verified', 'in_progress', 'done'].includes(status) && (
        <View style={styles.stateCard}>
          <Text style={styles.stateTxt}>{t(`booking.state.${status}`)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function Assigned({
  providerId,
  swapUsed,
  onSwap,
  swapping,
}: {
  providerId: string;
  swapUsed: boolean;
  onSwap: () => void;
  swapping: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const p = useQuery({ queryKey: ['provider', providerId], queryFn: () => getProvider(providerId) });

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.matched}>
        <Text style={styles.matchedTxt}>{t('booking.matched')}</Text>
      </View>

      {p.isLoading && <Loading />}
      {p.data && (
        <ProviderCard
          provider={p.data}
          onPress={() => router.push({ pathname: '/provider/[id]', params: { id: providerId } })}
        />
      )}

      {!swapUsed && (
        <Pressable style={styles.swap} disabled={swapping} onPress={onSwap}>
          <Text style={styles.swapTxt}>{swapping ? t('booking.swapping') : t('booking.swap')}</Text>
        </Pressable>
      )}
      {swapUsed && <Text style={styles.swapUsed}>{t('booking.swapUsed')}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },

  finding: { alignItems: 'center', paddingVertical: space.xxl, gap: space.xs },
  liveDot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.accent },
  findTitle: { fontFamily: font.teBold, fontSize: type.h2, color: colors.ink, textAlign: 'center' },
  findSub: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },

  matched: {
    backgroundColor: colors.success,
    borderRadius: radius.chip,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    alignSelf: 'flex-start',
  },
  matchedTxt: { fontFamily: font.teBold, fontSize: type.small, color: colors.surface },

  swap: {
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.ink },
  swapUsed: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },

  fallback: { gap: space.sm, paddingVertical: space.lg },
  fbTitle: { fontFamily: font.teBold, fontSize: type.h2, color: colors.ink },
  fbSub: { fontFamily: font.te, fontSize: type.body, color: colors.inkMuted },

  stateCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: space.lg },
  stateTxt: { fontFamily: font.teBold, fontSize: type.h3, color: colors.ink, textAlign: 'center' },

  cta: {
    height: tap.min,
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
  },
  ctaTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.surface },
});
