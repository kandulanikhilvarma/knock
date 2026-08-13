import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { useSession } from '../../lib/session';
import { getMyThreads } from '../../lib/chat';
import { getCategories, categoryName } from '../../lib/queries';
import CategoryImage from '../../components/CategoryImage';
import StatusPill from '../../components/StatusPill';
import { Loading, ErrorState, Empty } from '../../components/StateView';

export default function Chat() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session, loading } = useSession();
  const q = useQuery({ queryKey: ['threads'], queryFn: getMyThreads, enabled: !!session });
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
        <Text style={styles.title}>{t('tabs.chat')}</Text>
        <Text style={styles.subtitle}>{t('chatTab.subtitle')}</Text>
      </View>

      {!session && (
        <View style={styles.signedOut}>
          <View style={styles.soIcon}>
            <Ionicons name="chatbubbles-outline" size={26} color={colors.inkMuted} />
          </View>
          <Text style={styles.soTitle}>{t('booking.signInFirst')}</Text>
          <Text style={styles.soSub}>{t('chat.noThreadsSub')}</Text>
          <Pressable style={styles.soCta} onPress={() => router.push('/auth/email')}>
            <Text style={styles.soCtaTxt}>{t('profileTab.signIn')}</Text>
          </Pressable>
        </View>
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
              onPress={() => router.push({ pathname: '/chat/[bookingId]', params: { bookingId: item.id } })}
            >
              <CategoryImage slug={item.category_slug} icon={iconFor(item.category_slug)} width={160} style={styles.thumb} />
              <View style={styles.mid}>
                <Text style={styles.cat} numberOfLines={1}>{label(item.category_slug)}</Text>
                <StatusPill status={item.status} />
              </View>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accent} />
            </Pressable>
          )}
          ListEmptyComponent={
            <Empty icon="chatbubbles-outline" title={t('chat.noThreads')} sub={t('chat.noThreadsSub')} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.md, gap: 2 },
  title: { fontFamily: font.teBold, fontSize: type.h1, color: colors.ink },
  subtitle: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.sm, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  thumb: { width: 54, height: 54, borderRadius: radius.chip },
  mid: { flex: 1, gap: 6 },
  cat: { fontFamily: font.teBold, fontSize: type.body, color: colors.ink },

  signedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  soIcon: { width: 56, height: 56, borderRadius: radius.pill, backgroundColor: colors.line2, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  soTitle: { fontFamily: font.teBold, fontSize: type.h3, color: colors.ink, textAlign: 'center' },
  soSub: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },
  soCta: { marginTop: space.sm, height: tap.min, paddingHorizontal: space.xl, borderRadius: radius.card, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  soCtaTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.surface },
});
