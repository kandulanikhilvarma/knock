import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap, shadow } from '../../theme/tokens';
import { useSession } from '../../lib/session';
import { getMyBookings } from '../../lib/bookings';
import { getCategories, categoryName } from '../../lib/queries';
import { categoryTint } from '../../lib/categoryTint';
import CategoryArt from '../../components/CategoryArt';
import Touchable from '../../components/Touchable';
import StatusPill from '../../components/StatusPill';
import { Loading, ErrorState, Empty } from '../../components/StateView';

export default function Bookings() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session, loading } = useSession();
  const q = useQuery({ queryKey: ['my-bookings'], queryFn: getMyBookings, enabled: !!session });
  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const label = (slug: string) => {
    const c = (cats.data ?? []).find((x) => x.slug === slug);
    return c ? categoryName(c, i18n.language) : slug;
  };
  const iconFor = (slug: string) => (cats.data ?? []).find((x) => x.slug === slug)?.icon ?? null;

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.head}>
        <AppText style={styles.title}>{t('tabs.bookings')}</AppText>
        <AppText style={styles.subtitle}>{t('bookingsTab.subtitle')}</AppText>
      </View>

      {!session && (
        <SignedOut cta={() => router.push('/auth/email')} />
      )}
      {session && q.isLoading && <Loading />}
      {session && q.isError && <ErrorState message={(q.error as Error)?.message} />}
      {session && q.data && (
        <FlatList
          data={q.data}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push({ pathname: '/booking/[id]', params: { id: item.id } })}
            >
              <CategoryArt slug={item.category_slug} size={38} bg={categoryTint(item.category_slug)} />
              <View style={styles.mid}>
                <AppText style={styles.cat} numberOfLines={1}>{label(item.category_slug)}</AppText>
                <StatusPill status={item.status} />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
            </Pressable>
          )}
          ListEmptyComponent={
            <Empty icon="reader-outline" title={t('bookingsTab.empty')} sub={t('bookingsTab.emptySub')} />
          }
        />
      )}
    </SafeAreaView>
  );
}

function SignedOut({ cta }: { cta: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.signedOut}>
      <View style={styles.soIcon}>
        <Ionicons name="lock-closed-outline" size={26} color={colors.inkMuted} />
      </View>
      <AppText style={styles.soTitle}>{t('booking.signInFirst')}</AppText>
      <AppText style={styles.soSub}>{t('bookingsTab.signInSub')}</AppText>
      <Touchable style={styles.soCta} onPress={cta}>
        <AppText style={styles.soCtaTxt}>{t('profileTab.signIn')}</AppText>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.md, gap: 2 },
  title: { fontFamily: font.displayBold, fontSize: type.display, color: colors.ink },
  subtitle: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.sm, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    ...shadow.soft,
  },
  thumb: { width: 54, height: 54, borderRadius: radius.chip },
  mid: { flex: 1, gap: 6 },
  cat: { fontFamily: font.teBold, fontSize: type.body, color: colors.ink },

  signedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  soIcon: { width: 56, height: 56, borderRadius: radius.pill, backgroundColor: colors.line2, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  soTitle: { fontFamily: font.displayBold, fontSize: type.h2, color: colors.ink, textAlign: 'center' },
  soSub: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },
  soCta: { marginTop: space.sm, height: tap.min, paddingHorizontal: space.xl, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  soCtaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
});
