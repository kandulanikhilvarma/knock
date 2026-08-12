import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { getProvider } from '../../lib/queries';
import Avatar from '../../components/Avatar';
import { Loading, ErrorState, Empty } from '../../components/StateView';

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => getProvider(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState message={(error as Error)?.message} />;
  if (!data) return <Empty title={t('provider.notFound')} />;

  const name = data.profiles?.full_name ?? 'Provider';
  const stats = data.provider_stats;
  const verified = data.verify_tier === 'verified';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar name={name} photoUrl={data.photo_url} size={88} />
          <Text style={styles.name}>{name}</Text>
          {verified && (
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={13} color={colors.surface} />
              <Text style={styles.badgeTxt}>{t('provider.verified')}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Ionicons name="star" size={15} color={colors.accent} />
            <Text style={styles.meta}>{stats?.rating_avg?.toFixed(1) ?? '—'}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.meta}>{t('provider.jobsDone', { count: stats?.jobs_done ?? 0 })}</Text>
            {data.years_exp ? (
              <>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.meta}>{t('provider.yearsExp', { count: data.years_exp })}</Text>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.ribbon}>
          <Text style={styles.ribbonTxt}>{t('provider.ribbon')}</Text>
        </View>

        {data.bio ? (
          <View style={styles.block}>
            <Text style={styles.blockLabel}>{t('provider.about')}</Text>
            <Text style={styles.blockBody}>{data.bio}</Text>
          </View>
        ) : null}

        {data.visiting_charge != null && (
          <View style={styles.block}>
            <Text style={styles.blockLabel}>{t('provider.visitCharge')}</Text>
            <Text style={styles.blockBody}>₹{data.visiting_charge}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA — §5. Booking flow wires in at P3 (dispatch). */}
      <View style={styles.footer}>
        <Pressable style={styles.cta} onPress={() => Alert.alert(t('provider.ctaSoon'))}>
          <Text style={styles.ctaTxt}>{t('provider.request')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.lg, paddingBottom: 120 },
  hero: { alignItems: 'center', gap: space.sm, paddingTop: space.md },
  name: { fontFamily: font.bold, fontSize: type.h1, color: colors.ink },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: space.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.surface },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
  dot: { color: colors.line },
  ribbon: { backgroundColor: '#EAF2FB', borderRadius: radius.card, padding: space.md, alignItems: 'center' },
  ribbonTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.primary },
  block: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    gap: 4,
  },
  blockLabel: { fontFamily: font.semibold, fontSize: type.small, color: colors.inkMuted },
  blockBody: { fontFamily: font.regular, fontSize: type.body, color: colors.ink },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: space.lg,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  cta: {
    height: tap.min,
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { fontFamily: font.bold, fontSize: type.body, color: colors.surface },
});
