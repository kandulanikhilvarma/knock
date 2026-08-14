import { View, FlatList, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import AppText from '../../components/AppText';
import { Loading, ErrorState, Empty } from '../../components/StateView';
import { getProviderReviews } from '../../lib/bookings';
import { useSession } from '../../lib/session';
import { colors, space, radius, font, type, shadow } from '../../theme/tokens';

// §6 screen map: the pro's own reviews, the thing the whole rating loop feeds.
export default function MyReviews() {
  const { t } = useTranslation();
  const { session } = useSession();
  const uid = session?.user?.id;
  const q = useQuery({
    queryKey: ['my-reviews', uid],
    queryFn: () => getProviderReviews(uid!),
    enabled: !!uid,
  });

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState message={(q.error as Error)?.message} />;

  const rows = q.data ?? [];
  const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t('myReviews.title') }} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          rows.length ? (
            <View style={styles.head}>
              <AppText style={styles.avg}>{avg.toFixed(1)}</AppText>
              <View style={{ flex: 1 }}>
                <AppText style={styles.stars}>{'★'.repeat(Math.round(avg))}</AppText>
                <AppText style={styles.headSub}>{t('myReviews.count', { count: rows.length })}</AppText>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <AppText style={styles.cardStars}>{'★'.repeat(item.rating)}</AppText>
              <AppText style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</AppText>
            </View>
            {item.body ? <AppText style={styles.body}>{item.body}</AppText> : null}
            {item.tags?.length ? (
              <View style={styles.tags}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <AppText style={styles.tagTxt}>{t(`booking.tag_${tag}`, tag)}</AppText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Empty icon="star-outline" title={t('myReviews.empty')} sub={t('myReviews.emptySub')} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: space.lg, gap: space.sm, paddingBottom: space.xxl },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.md,
    ...shadow.soft,
  },
  avg: { fontFamily: font.displayBold, fontSize: 44, color: colors.ink },
  stars: { fontFamily: font.bold, fontSize: type.h3, color: colors.gold },
  headSub: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted, marginTop: 2 },
  card: {
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardStars: { fontFamily: font.bold, fontSize: type.body, color: colors.gold },
  date: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted },
  body: { fontFamily: font.regular, fontSize: type.body, lineHeight: 22, color: colors.ink2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.tintSuccess,
  },
  tagTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.successInk },
});
