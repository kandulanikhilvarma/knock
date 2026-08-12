import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { getCategories, categoryName, type Category } from '../../lib/queries';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Loading, ErrorState } from '../../components/StateView';

export default function Home() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const live = (data ?? []).filter((c) => c.is_live);
  const soon = (data ?? []).filter((c) => !c.is_live);

  function open(cat: Category) {
    router.push({ pathname: '/category/[slug]', params: { slug: cat.slug } });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t('home.greeting')}</Text>
            <Text style={styles.tagline}>{t('app.tagline')}</Text>
          </View>
          <LanguageSwitcher />
        </View>

        <View style={styles.counter}>
          <Ionicons name="cash-outline" size={18} color={colors.surface} />
          <Text style={styles.counterText}>
            {t('home.counter', { amount: '0', city: 'Vijayawada' })}
          </Text>
        </View>

        {isLoading && <Loading />}
        {isError && <ErrorState message={(error as Error)?.message} />}

        {live.length > 0 && (
          <Section title={t('home.available')}>
            <Grid cats={live} lang={i18n.language} onPick={open} />
          </Section>
        )}

        {soon.length > 0 && (
          <Section title={t('home.comingSoon')}>
            <Grid cats={soon} lang={i18n.language} onPick={open} dimmed />
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
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
          <Ionicons name={(c.icon ?? 'construct') as any} size={26} color={dimmed ? colors.inkMuted : colors.primary} />
          <Text style={[styles.tileTxt, dimmed && styles.tileTxtDim]} numberOfLines={2}>
            {categoryName(c, lang)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.xl, paddingBottom: space.xxl },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingTop: space.sm },
  greeting: { fontFamily: font.bold, fontSize: type.h1, color: colors.ink },
  tagline: { fontFamily: font.medium, fontSize: type.body, color: colors.accent, marginTop: 2 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    padding: space.lg,
  },
  counterText: { flex: 1, fontFamily: font.semibold, fontSize: type.small, color: colors.surface },
  section: { gap: space.md },
  sectionTitle: { fontFamily: font.semibold, fontSize: type.h3, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    width: '30%',
    minHeight: 92,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    padding: space.md,
    minWidth: 96,
  },
  tileDim: { backgroundColor: colors.bg },
  tileTxt: { fontFamily: font.medium, fontSize: type.chip, color: colors.ink, textAlign: 'center' },
  tileTxtDim: { color: colors.inkMuted },
});
