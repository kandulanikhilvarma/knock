import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
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
import Testimonials from '../../components/Testimonials';
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

  // One tap opens the dispatch screen: your block on the map, the pros around
  // it, then the engine's real run (rank → wave 1 → first accept → booking).
  function runDemo() {
    const c = live[0];
    router.push({ pathname: '/dispatch', params: { slug: c?.slug ?? 'electrician', cid: c?.id ?? '' } });
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
          <Pressable
            style={({ pressed: p }) => [styles.demoCta, p && pressed]}
            disabled={cats.isLoading}
            onPress={runDemo}
          >
            {cats.isLoading ? (
              <ActivityIndicator color={colors.onDark} size="small" />
            ) : (
              <Ionicons name="flash" size={16} color={colors.onDark} />
            )}
            <AppText style={styles.demoCtaTxt}>{t('home.demoCta')}</AppText>
          </Pressable>
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

        <Testimonials />

        {soon.length > 0 && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('home.nextUp')}</AppText>
            <AppText style={styles.sectionSub}>{t('home.nextUpSub')}</AppText>
            <View style={styles.grid}>
              {soon.map((c) => (
                <Pressable
                  key={c.id}
                  style={({ pressed: p }) => [
                    styles.soonTile,
                    { backgroundColor: categoryTint(c.slug) },
                    p && pressed,
                  ]}
                  onPress={() => open(c)}
                >
                  <View style={styles.soonArt}>
                    <CategoryArt slug={c.slug} size={40} bg={colors.surface} />
                  </View>
                  <AppText style={styles.soonTxt} numberOfLines={3}>
                    {categoryName(c, i18n.language)}
                  </AppText>
                  <View style={styles.soonChip}>
                    <Ionicons name="person-add-outline" size={12} color={colors.ink} />
                    <AppText style={styles.soonChipTxt} numberOfLines={1}>
                      {t('home.onboarding')}
                    </AppText>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Grid({ cats, lang, onPick }: { cats: Category[]; lang: string; onPick: (c: Category) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.grid}>
      {cats.map((c) => (
        <Pressable
          key={c.id}
          style={({ pressed: p }) => [styles.tile, p && pressed]}
          onPress={() => onPick(c)}
        >
          <CategoryArt slug={c.slug} size={52} bg={categoryTint(c.slug)} />
          <AppText style={styles.tileTxt} numberOfLines={3}>
            {categoryName(c, lang)}
          </AppText>
          <View style={styles.avail}>
            <View style={styles.availDot} />
            <AppText style={styles.availTxt}>{t('home.availableNow')}</AppText>
          </View>
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
  demoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    alignSelf: 'flex-start',
    marginTop: space.lg,
    height: 46,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    ...shadow.soft,
  },
  demoCtaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },

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
  sectionSub: {
    fontFamily: font.regular,
    fontSize: type.small,
    lineHeight: 19,
    color: colors.inkMuted,
    marginTop: -space.sm,
    maxWidth: '92%',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    width: '47%',
    flexGrow: 0,
    minWidth: 150,
    minHeight: 176,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.xl,
    gap: space.md,
    justifyContent: 'flex-start',
    ...shadow.card,
  },
  // h2, not h1: at 47% width a single long trade name ("Electrician",
  // "ఎలక్ట్రీషియన్") breaks mid-word at the display size.
  tileTxt: {
    fontFamily: font.displayBold,
    fontSize: type.h2,
    lineHeight: type.h2 + 3,
    color: colors.ink,
    marginTop: 'auto',
  },

  // Onboarding trades read as a different, warmer object: the pastel is the
  // whole tile, the art sits on a cream chip. Wanted, not disabled.
  soonTile: {
    width: '47%',
    flexGrow: 0,
    minWidth: 150,
    minHeight: 168,
    borderRadius: radius.card,
    padding: space.lg,
    gap: space.md,
    ...shadow.soft,
  },
  soonArt: { alignSelf: 'flex-start' },
  soonTxt: {
    fontFamily: font.displayBold,
    fontSize: type.h2,
    lineHeight: type.h2 + 2,
    color: colors.ink,
    marginTop: 'auto',
  },
  soonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  soonChipTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.ink },
  avail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  availDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  availTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.successInk, letterSpacing: 0.2 },
});
