import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { colors, space, radius, font, type } from '../../theme/tokens';
import { useSession } from '../../lib/session';
import { getMyThreads } from '../../lib/chat';
import { Loading, ErrorState, Empty } from '../../components/StateView';

export default function Chat() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, loading } = useSession();
  const q = useQuery({ queryKey: ['threads'], queryFn: getMyThreads, enabled: !!session });

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>{t('tabs.chat')}</Text>
      {!session && <Empty title={t('booking.signInFirst')} />}
      {session && q.isLoading && <Loading />}
      {session && q.isError && <ErrorState message={(q.error as Error)?.message} />}
      {session && q.data && (
        <FlatList
          data={q.data}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => router.push({ pathname: '/chat/[bookingId]', params: { bookingId: item.id } })}
            >
              <Text style={styles.cat}>{item.category_slug}</Text>
              <Text style={styles.status}>{t(`booking.state.${item.status}`, item.status)}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Empty title={t('chat.noThreads')} sub={t('chat.noThreadsSub')} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: font.bold, fontSize: type.h1, color: colors.ink, padding: space.lg },
  list: { paddingHorizontal: space.lg, gap: space.sm },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cat: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink, textTransform: 'capitalize' },
  status: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
});
