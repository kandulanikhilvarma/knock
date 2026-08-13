import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, space, radius, font, type } from '../../theme/tokens';
import {
  getCategories,
  getFeaturedProvider,
  getCityEarnings,
  formatINR,
  categoryName,
  type Category,
} from '../../lib/queries';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ProviderCard from '../../components/ProviderCard';
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
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hi}>{t('home.greeting')}</Text>
            <View style={styles.loc}>
              <Ionicons name="location-outline" size={13} color={colors.inkMuted} />
              <Text style={styles.locTxt}>Vijayawada</Text>
            </View>
          </View>
          <LanguageSwitcher />
        </View>

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.inkMuted} />
          <Text style={styles.searchPh}>{t('home.searchPlaceholder')}</Text>
          <View style={styles.mic}>
            <Ionicons name="mic" size={16} color={colors.surface} />
          </View>
        </View>

        {/* City earnings — the number, stated plainly on an ink card */}
        <View style={styles.earn}>
          <Text style={styles.earnLbl}>{t('home.earnLabel')}</Text>
          <Text style={styles.earnNum}>
            ₹<Text style={styles.earnGold}>{formatINR(earnings.data ?? 0)}</Text>
          </Text>
          <View style={styles.earnSub}>
            <View style={styles.live}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTxt}>LIVE</Text>
            </View>
            <Text style={styles.earnSubTxt}>{t('home.earnSub')}</Text>
          </View>
        </View>

        {cats.isLoading && <Loading />}
        {cats.isError && <ErrorState message={(cats.error as Error)?.message} />}

        {live.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.available')}</Text>
            <Grid cats={live} lang={i18n.language} onPick={open} />
          </View>
        )}

        {featured.data && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.nearYou')}</Text>
            <ProviderCard
              provider={featured.data}
              onPress={() =>
                router.push({ pathname: '/provider/[id]', params: { id: featured.data!.user_id } })
              }
            />
          </View>
        )}

        {soon.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.comingSoon')}</Text>
            <Grid cats={soon} lang={i18n.language} onPick={open} dimmed />
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
  dimmed,
}: {
  cats: Category[];
  lang: string;
  onPick: (c: Category) => void;
  dimmed?: boolean;
}) {
  return (
    <View style={styles.grid}>
      {cats.map((c) => (
        <Pressable key={c.id} style={[styles.tile, dimmed && styles.tileDim]} onPress={() => onPick(c)}>
          {dimmed && (
            <View style={styles.soonTag}>
              <Text style={styles.soonTagTxt}>{t2(lang)}</Text>
            </View>
          )}
          <View style={styles.tileIc}>
            <Ionicons
              name={(c.icon ?? 'construct') as any}
              size={22}
              color={dimmed ? colors.inkMuted : colors.ink}
            />
          </View>
          <Text style={[styles.tileTxt, dimmed && styles.tileTxtDim]} numberOfLines={2}>
            {categoryName(c, lang)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// tiny inline "coming soon" tag label per language
function t2(lang: string) {
  return { en: 'Soon', te: 'త్వరలో', hi: 'जल्द' }[(['en', 'te', 'hi'].includes(lang) ? lang : 'en') as 'en'];
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingTop: space.sm },
  hi: { fontFamily: font.teBold, fontSize: type.h2, color: colors.ink },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  locTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: space.md,
  },
  searchPh: { flex: 1, fontFamily: font.te, fontSize: type.body, color: colors.inkMuted },
  mic: {
    width: 32,
    height: 32,
    borderRadius: radius.chip,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  earn: { backgroundColor: colors.ink, borderRadius: radius.card, padding: space.lg },
  earnLbl: { fontFamily: font.te, fontSize: type.small, color: colors.onDarkMuted },
  earnNum: { fontFamily: font.mono, fontSize: 28, color: colors.onDark, marginTop: 2, fontWeight: '700' },
  earnGold: { color: colors.gold, fontFamily: font.mono, fontWeight: '700' },
  earnSub: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 4 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5BE08C' },
  liveTxt: { fontFamily: font.bold, fontSize: 10, color: '#5BE08C' },
  earnSubTxt: { flex: 1, fontFamily: font.te, fontSize: type.small, color: colors.onDarkMuted },

  section: { gap: space.md },
  sectionTitle: { fontFamily: font.teBold, fontSize: type.h3, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    width: '30%',
    flexGrow: 1,
    minWidth: 96,
    minHeight: 92,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: space.sm,
    padding: space.md,
  },
  tileDim: { backgroundColor: colors.bg },
  tileIc: {
    width: 36,
    height: 36,
    borderRadius: radius.chip,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTxt: { fontFamily: font.te, fontSize: type.chip, color: colors.ink, fontWeight: '600' },
  tileTxtDim: { color: colors.inkMuted },
  soonTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.line2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  soonTagTxt: { fontFamily: font.te, fontSize: 8, color: colors.inkMuted },
});
