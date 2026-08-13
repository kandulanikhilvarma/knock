import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, space, radius, font, type, shadow, pressed } from '../../theme/tokens';
import {
  getCategories,
  getFeaturedProvider,
  getCityEarnings,
  formatINR,
  categoryName,
  type Category,
} from '../../lib/queries';
import { categoryTint } from '../../lib/categoryTint';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ProviderCard from '../../components/ProviderCard';
import CategoryArt from '../../components/CategoryArt';
import TrustPillars from '../../components/TrustPillars';
import OrganicLines from '../../components/OrganicLines';
import { Loading, ErrorState } from '../../components/StateView';

export default function Home() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const featured = useQuery({ queryKey: ['featured'], queryFn: getFeaturedProvider });
  const earnings = useQuery({ queryKey: ['earnings'], queryFn: getCityEarnings });

  const live = (cats.data ?? []).filter((c) => c.is_live);
  const soon = (cats.data ?? []).filter((c) => !c.is_live);

  function open(cat: Category) {
    router.push({ pathname: '/category/[slug]', params: { slug: cat.slug } });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero — organic motif behind an editorial serif headline */}
        <View style={styles.hero}>
          <OrganicLines color={colors.primary} opacity={0.1} />
          <View style={styles.heroTop}>
            <View style={styles.loc}>
              <Ionicons name="location-outline" size={13} color={colors.inkMuted} />
              <AppText style={styles.locTxt}>Vijayawada</AppText>
            </View>
            <LanguageSwitcher />
          </View>
          <AppText style={styles.headline}>{t('home.greeting')}</AppText>
        </View>

        <Pressable style={styles.search}>
          <Ionicons name="search" size={18} color={colors.inkMuted} />
          <AppText style={styles.searchPh}>{t('home.searchPlaceholder')}</AppText>
          <View style={styles.mic}>
            <Ionicons name="mic" size={16} color={colors.onDark} />
          </View>
        </Pressable>

        {/* City earnings — forest block, big serif number */}
        <View style={styles.earn}>
          <AppText style={styles.earnLbl}>{t('home.earnLabel')}</AppText>
          <AppText style={styles.earnNum}>₹{formatINR(earnings.data ?? 0)}</AppText>
          <View style={styles.earnSub}>
            <View style={styles.live}>
              <View style={styles.liveDot} />
              <AppText style={styles.liveTxt}>LIVE</AppText>
            </View>
            <AppText style={styles.earnSubTxt}>{t('home.earnSub')}</AppText>
          </View>
        </View>

        {cats.isLoading && <Loading />}
        {cats.isError && <ErrorState message={(cats.error as Error)?.message} />}

        {live.length > 0 && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('home.available')}</AppText>
            <Grid cats={live} lang={i18n.language} onPick={open} />
          </View>
        )}

        {featured.data && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('home.nearYou')}</AppText>
            <ProviderCard
              provider={featured.data}
              onPress={() =>
                router.push({ pathname: '/provider/[id]', params: { id: featured.data!.user_id } })
              }
            />
          </View>
        )}

        <TrustPillars />

        {soon.length > 0 && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('home.comingSoon')}</AppText>
            <Grid cats={soon} lang={i18n.language} onPick={open} soon />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Grid({
  cats,
  lang,
  onPick,
  soon,
}: {
  cats: Category[];
  lang: string;
  onPick: (c: Category) => void;
  soon?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.grid}>
      {cats.map((c) => (
        <Pressable
          key={c.id}
          style={({ pressed: p }) => [styles.tile, p && pressed]}
          onPress={() => onPick(c)}
        >
          <View style={styles.tileTop}>
            <CategoryArt slug={c.slug} size={42} bg={categoryTint(c.slug)} muted={soon} />
            {soon && (
              <View style={styles.soonTag}>
                <AppText style={styles.soonTagTxt}>{t('home.soonTag')}</AppText>
              </View>
            )}
          </View>
          <AppText style={[styles.tileTxt, soon && styles.tileTxtSoon]} numberOfLines={2}>
            {categoryName(c, lang)}
          </AppText>
          {soon ? (
            <AppText style={styles.tileSoonHint}>{t('home.soonHint')}</AppText>
          ) : (
            <View style={styles.avail}>
              <View style={styles.availDot} />
              <AppText style={styles.availTxt}>{t('home.availableNow')}</AppText>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },

  hero: { paddingTop: space.sm, paddingBottom: space.xs, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
  headline: {
    fontFamily: font.displayBold,
    fontSize: type.display,
    lineHeight: type.display + 4,
    color: colors.ink,
    marginTop: space.md,
    maxWidth: '90%',
  },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
  },
  searchPh: { flex: 1, fontFamily: font.regular, fontSize: type.body, color: colors.inkMuted },
  mic: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  earn: { backgroundColor: colors.primary, borderRadius: radius.card, padding: space.xl, ...shadow.card },
  earnLbl: { fontFamily: font.regular, fontSize: type.small, color: colors.onDarkMuted },
  earnNum: {
    fontFamily: font.displayBold,
    fontSize: 46,
    lineHeight: 52,
    color: colors.onDark,
    marginTop: 2,
  },
  earnSub: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  live: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8FE3AB' },
  liveTxt: { fontFamily: font.bold, fontSize: 10, color: '#8FE3AB', letterSpacing: 0.5 },
  earnSubTxt: { flex: 1, fontFamily: font.regular, fontSize: type.small, color: colors.onDarkMuted },

  section: { gap: space.md },
  sectionTitle: { fontFamily: font.displayBold, fontSize: type.h1, color: colors.ink },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    width: '47%',
    flexGrow: 0,
    minWidth: 150,
    minHeight: 138,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    gap: space.sm,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tileTxt: { fontFamily: font.displayBold, fontSize: type.h2, color: colors.ink, lineHeight: type.h2 + 2 },
  tileTxtSoon: { color: colors.inkMuted },
  avail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  availDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  availTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.successInk, letterSpacing: 0.2 },
  tileSoonHint: { fontFamily: font.regular, fontSize: type.chip, color: colors.inkMuted },
  soonTag: {
    backgroundColor: colors.line2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  soonTagTxt: { fontFamily: font.semibold, fontSize: 9, color: colors.inkMuted, letterSpacing: 0.3 },
});
