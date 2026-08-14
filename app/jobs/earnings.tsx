import { View, FlatList, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import AppText from '../../components/AppText';
import CategoryArt from '../../components/CategoryArt';
import { Loading, ErrorState, Empty } from '../../components/StateView';
import { categoryTint } from '../../lib/categoryTint';
import { getMyBookings } from '../../lib/bookings';
import { getCategories, categoryName, formatINR } from '../../lib/queries';
import { colors, space, radius, font, type, shadow } from '../../theme/tokens';

// §6 screen map: "Earnings log (self-reported)". The app never touches the
// money, so this is a record of what the pro said they were paid, nothing more.
export default function Earnings() {
  const { t, i18n } = useTranslation();
  const q = useQuery({ queryKey: ['my-bookings'], queryFn: getMyBookings });
  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState message={(q.error as Error)?.message} />;

  const paid = (q.data ?? []).filter((b) => b.paid_at);
  const total = paid.reduce((s, b) => s + (b.price_agreed ?? 0), 0);
  const label = (slug: string) => {
    const c = (cats.data ?? []).find((x) => x.slug === slug);
    return c ? categoryName(c, i18n.language) : slug;
  };
  const month = new Date();
  month.setDate(1);
  const thisMonth = paid.filter((b) => new Date(b.paid_at!) >= month);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t('earnings.title') }} />
      <FlatList
        data={paid}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.block}>
            <AppText style={styles.blockLbl}>{t('earnings.kept')}</AppText>
            <AppText style={styles.blockNum}>₹{formatINR(total)}</AppText>
            <AppText style={styles.blockSub}>
              {t('earnings.jobsLine', { count: paid.length, month: thisMonth.length })}
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <CategoryArt slug={item.category_slug} size={34} bg={categoryTint(item.category_slug)} />
            <View style={{ flex: 1 }}>
              <AppText style={styles.rowTitle}>{label(item.category_slug)}</AppText>
              <AppText style={styles.rowSub}>
                {new Date(item.paid_at!).toLocaleDateString()} ·{' '}
                {t(`earnings.method_${item.pay_method === 'cash' ? 'cash' : 'upi'}`)}
              </AppText>
            </View>
            <AppText style={styles.amount}>
              {item.price_agreed ? `₹${formatINR(item.price_agreed)}` : '·'}
            </AppText>
          </View>
        )}
        ListEmptyComponent={
          <Empty icon="wallet-outline" title={t('earnings.empty')} sub={t('earnings.emptySub')} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: space.lg, gap: space.sm, paddingBottom: space.xxl },
  block: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    padding: space.xl,
    marginBottom: space.md,
    ...shadow.card,
  },
  blockLbl: { fontFamily: font.regular, fontSize: type.small, color: colors.onDarkMuted },
  blockNum: {
    fontFamily: font.displayBold,
    fontSize: 42,
    lineHeight: 48,
    color: colors.onDark,
    marginTop: 2,
  },
  blockSub: { fontFamily: font.regular, fontSize: type.small, color: colors.onDarkMuted, marginTop: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowTitle: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink },
  rowSub: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted, marginTop: 1 },
  amount: { fontFamily: font.displayBold, fontSize: type.h3, color: colors.ink },
});
