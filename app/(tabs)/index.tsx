import { useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText from '../../components/AppText';
import { SEEN_KEY } from '../welcome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, space, radius, font, type, shadow, pressed } from '../../theme/tokens';
import {
  getCategories,
  getCityEarnings,
  formatINR,
  categoryName,
  type Category,
} from '../../lib/queries';
import { categoryTint } from '../../lib/categoryTint';
import { useSession, firstName } from '../../lib/session';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import CategoryArt from '../../components/CategoryArt';
import TrustPillars from '../../components/TrustPillars';
import HowItWorks from '../../components/HowItWorks';
import NearbyProviders from '../../components/NearbyProviders';
import DoorstepScene from '../../components/DoorstepScene';
import FadeIn from '../../components/FadeIn';
import { Loading, ErrorState } from '../../components/StateView';

export default function Home() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session, loading: sessLoading } = useSession();
  const myName = firstName(session?.user);
  const insets = useSafeAreaInsets();

  // First launch goes to the language picker (§2-4), once. A signed-in user has
  // already been through the app — don't bounce them to the picker on return.
  useEffect(() => {
    if (sessLoading || session) return;
    AsyncStorage.getItem(SEEN_KEY)
      .then((seen) => {
        if (!seen) router.replace('/welcome');
      })
      .catch(() => {});
  }, [router, session, sessLoading]);

  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const earnings = useQuery({ queryKey: ['earnings'], queryFn: getCityEarnings });

  const live = (cats.data ?? []).filter((c) => c.is_live);
  const soon = (cats.data ?? []).filter((c) => !c.is_live);

  function open(cat: Category) {
    router.push({ pathname: '/category/[slug]', params: { slug: cat.slug } });
  }


  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero — a deep forest band that reaches the top edge, the ₹0 promise
            as a badge, the headline and search living on the dark ground. */}
        <FadeIn style={[styles.hero, { paddingTop: insets.top + space.md }]}>
          <View style={styles.heroGlow} pointerEvents="none" />
          <View style={styles.heroTop}>
            <View style={styles.loc}>
              <View style={styles.locMk}>
                <Ionicons name="location" size={13} color={colors.onDark} />
              </View>
              <AppText style={styles.locTxt}>Vijayawada</AppText>
            </View>
            <LanguageSwitcher onDark />
          </View>

          <View style={styles.greetRow}>
            {myName && <AppText style={styles.hi}>{t('home.hi', { name: myName })}</AppText>}
            <View style={styles.coin}>
              <View style={styles.coinDisc}>
                <AppText style={styles.coinDiscTxt}>₹0</AppText>
              </View>
              <AppText style={styles.coinTxt}>{t('home.zeroCommission')}</AppText>
            </View>
          </View>

          <AppText style={styles.headline}>{t('home.greeting')}</AppText>

          <Pressable
            style={({ pressed: p }) => [styles.search, p && pressed]}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={18} color={colors.inkMuted} />
            <AppText style={styles.searchPh}>{t('home.searchPlaceholder')}</AppText>
            <View style={styles.mic}>
              <Ionicons name="arrow-forward" size={16} color={colors.onDark} />
            </View>
          </Pressable>

          {/* The band ends in a lit street — the promise, pictured. */}
          <View style={styles.scene}>
            <DoorstepScene />
          </View>
        </FadeIn>

        <View style={styles.body}>
          {/* Rapido-style: your location + the pros around you, up front. This is
              the primary action — book a pro to your door. */}
          <FadeIn delay={140}>
            <NearbyProviders liveSlug={live[0]?.slug ?? 'electrician'} liveCid={live[0]?.id ?? null} />
          </FadeIn>

          {cats.isLoading && <Loading />}
          {cats.isError && <ErrorState message={(cats.error as Error)?.message} onRetry={() => cats.refetch()} />}

          {/* The core task: pick a trade. */}
          {live.length > 0 && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>{t('home.available')}</AppText>
              <Grid cats={live} lang={i18n.language} onPick={open} />
            </View>
          )}

          <HowItWorks />

          <TrustPillars />

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

          {/* City earnings — proof strip at the foot, out of the booking path. */}
          <View style={styles.earn}>
            <View style={styles.earnGlow} pointerEvents="none" />
            <AppText style={styles.earnLbl}>{t('home.earnLabel')}</AppText>
            <AppText style={styles.earnNum}>₹{formatINR(earnings.data ?? 0)}</AppText>
            <View style={styles.earnSub}>
              {!!earnings.data && (
                <View style={styles.live}>
                  <View style={styles.liveDot} />
                  <AppText style={styles.liveTxt}>LIVE</AppText>
                </View>
              )}
              <AppText style={styles.earnSubTxt}>
                {earnings.data ? t('home.earnSub') : t('home.earnSubZero')}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
  content: { paddingBottom: space.xxl },

  // Full-bleed forest band, rounded at the base.
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
    ...shadow.card,
  },
  heroGlow: {
    position: 'absolute',
    right: -60,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primarySoft,
    opacity: 0.5,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  locMk: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  locTxt: { fontFamily: font.display, fontSize: type.h3, color: colors.onDark, letterSpacing: -0.2 },

  greetRow: { flexDirection: 'row', alignItems: 'center', minHeight: 34, marginTop: space.xl },
  hi: { fontFamily: font.teBold, fontSize: type.body, color: '#8FE3AB', letterSpacing: 0.2 },
  coin: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(207,138,60,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(207,138,60,0.5)',
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 12,
  },
  coinDisc: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  coinDiscTxt: { fontFamily: font.displayBold, fontSize: 12, color: '#241703' },
  coinTxt: { fontFamily: font.semibold, fontSize: 10, lineHeight: 12, color: colors.tintGold, letterSpacing: 0.2 },

  headline: {
    fontFamily: font.displayBold,
    fontSize: type.display,
    lineHeight: type.display + 2,
    letterSpacing: -0.6,
    color: colors.onDark,
    marginTop: space.md,
    maxWidth: '92%',
  },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingLeft: space.lg,
    paddingRight: 7,
    marginTop: space.xl,
    ...shadow.card,
  },
  searchPh: { flex: 1, fontFamily: font.regular, fontSize: type.body, color: colors.inkMuted },
  mic: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Full-bleed to the band edges: cancel the hero's own padding so the street
  // runs corner to corner and the forest ends in a skyline.
  scene: {
    marginHorizontal: -space.lg,
    marginBottom: -space.xl,
    marginTop: space.xl,
  },

  body: { padding: space.lg, gap: space.lg },

  earn: { backgroundColor: colors.primary, borderRadius: radius.card, padding: space.xl, overflow: 'hidden', ...shadow.card },
  earnGlow: {
    position: 'absolute',
    left: -40,
    bottom: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.gold,
    opacity: 0.14,
  },
  earnLbl: { fontFamily: font.regular, fontSize: type.small, color: colors.onDarkMuted },
  earnNum: {
    fontFamily: font.displayBold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1,
    color: colors.onDark,
    marginTop: 3,
    fontVariant: ['tabular-nums'],
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
    padding: space.xl,
    gap: space.md,
    justifyContent: 'flex-start',
    ...shadow.soft,
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
