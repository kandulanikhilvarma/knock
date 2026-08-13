import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors, space, radius, font, type, tap, shadow } from '../../theme/tokens';
import { getMyOffers, respondOffer, type OfferWithBooking } from '../../lib/bookings';
import { getCategories, categoryName } from '../../lib/queries';
import { categoryTint } from '../../lib/categoryTint';
import CategoryArt from '../../components/CategoryArt';
import { Loading, ErrorState, Empty } from '../../components/StateView';

export default function JobsScreen() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ['offers'], queryFn: getMyOffers, refetchInterval: 5000 });

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t('jobs.title') }} />
      {q.isLoading && <Loading />}
      {q.isError && <ErrorState message={(q.error as Error)?.message} />}
      {q.data && (
        <FlatList
          data={q.data}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <OfferCard offer={item} onDone={() => q.refetch()} />}
          ListEmptyComponent={<Empty icon="briefcase-outline" title={t('jobs.empty')} sub={t('jobs.emptySub')} />}
        />
      )}
    </View>
  );
}

function OfferCard({ offer, onDone }: { offer: OfferWithBooking; onDone: () => void }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const slug = offer.bookings?.category_slug ?? '';
  const cat = (cats.data ?? []).find((c) => c.slug === slug);
  const catLabel = cat ? categoryName(cat, i18n.language) : slug;
  const deadline = new Date(offer.sent_at).getTime() + offer.window_sec * 1000;
  const [left, setLeft] = useState(Math.max(0, Math.round((deadline - Date.now()) / 1000)));

  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000))), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const m = useMutation({
    mutationFn: (action: 'accept' | 'decline') => respondOffer(offer.id, action),
    onSuccess: (res) => {
      if (res.accepted && offer.bookings) {
        router.push({ pathname: '/booking/[id]', params: { id: offer.bookings.id } });
      }
      onDone();
    },
  });

  const expired = left <= 0;
  const b = offer.bookings;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <CategoryArt slug={slug} size={34} bg={categoryTint(slug)} />
        <AppText style={styles.cat} numberOfLines={1}>{catLabel}</AppText>
        <AppText style={[styles.timer, expired && styles.timerOff]}>
          {expired ? t('jobs.expired') : t('jobs.secLeft', { sec: left })}
        </AppText>
      </View>
      {b?.description ? <AppText style={styles.desc}>{b.description}</AppText> : null}
      {b?.address ? <AppText style={styles.addr}>{b.address}</AppText> : null}

      <View style={styles.coinRow}>
        <View style={styles.coin}>
          <AppText style={styles.coinTxt}>₹0</AppText>
        </View>
        <AppText style={styles.coinNote}>{t('jobs.zeroNote')}</AppText>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.decline, m.isPending && styles.off]}
          disabled={m.isPending || expired}
          onPress={() => m.mutate('decline')}
        >
          <AppText style={styles.declineTxt}>{t('jobs.decline')}</AppText>
        </Pressable>
        <Pressable
          style={[styles.accept, (m.isPending || expired) && styles.off]}
          disabled={m.isPending || expired}
          onPress={() => m.mutate('accept')}
        >
          <AppText style={styles.acceptTxt}>{t('jobs.accept')}</AppText>
        </Pressable>
      </View>
      {m.data && !m.data.accepted && (
        <AppText style={styles.lost}>{m.data.taken ? t('jobs.taken') : t('jobs.expired')}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: space.lg, gap: space.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: space.lg, gap: space.sm, ...shadow.card },
  top: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  thumb: { width: 40, height: 40, borderRadius: radius.chip },
  cat: { flex: 1, fontFamily: font.displayBold, fontSize: type.h2, color: colors.ink },
  timer: { fontFamily: font.mono, fontSize: type.small, color: colors.accent, fontWeight: '700' },
  timerOff: { color: colors.inkMuted },
  desc: { fontFamily: font.te, fontSize: type.body, color: colors.ink2 },
  addr: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.ink, borderRadius: radius.chip, padding: space.sm },
  coin: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  coinTxt: { fontFamily: font.bold, fontSize: 11, color: colors.gold },
  coinNote: { flex: 1, fontFamily: font.te, fontSize: type.chip, color: colors.onDarkMuted },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
  decline: { flex: 1, height: tap.min, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  declineTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink },
  accept: { flex: 2, height: tap.min, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  acceptTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  off: { opacity: 0.4 },
  lost: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },
});
