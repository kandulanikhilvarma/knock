import { useMemo, useState } from 'react';
import { View, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import CategoryArt from '../components/CategoryArt';
import ProviderCard from '../components/ProviderCard';
import { Empty } from '../components/StateView';
import { colors, space, radius, font, type, shadow, pressed } from '../theme/tokens';
import { getCategories, getAllProviders, categoryName, providerName, type Category } from '../lib/queries';
import { categoryTint } from '../lib/categoryTint';

// What people type is the problem ("fan not working"), not the trade name, so
// each category carries a keyword list in all three languages.
const KEYWORDS: Record<string, string[]> = {
  electrician: ['fan', 'light', 'switch', 'wiring', 'short', 'mcb', 'current', 'bulb', 'కరెంట్', 'ఫ్యాన్', 'లైట్', 'బిజలీ', 'पंखा', 'लाइट'],
  plumber: ['tap', 'leak', 'pipe', 'water', 'drain', 'toilet', 'sink', 'motor', 'నీళ్లు', 'పైపు', 'కుళాయి', 'नल', 'पानी'],
  ac_appliance: ['ac', 'fridge', 'washing', 'machine', 'tv', 'geyser', 'ro', 'cooling', 'gas', 'ఏసీ', 'ఫ్రిజ్', 'वॉशिंग', 'फ्रिज'],
  carpenter: ['door', 'wood', 'furniture', 'lock', 'hinge', 'తలుపు', 'दरवाज़ा'],
  painter: ['paint', 'wall', 'putty', 'పెయింట్', 'पेंट'],
  cleaning: ['clean', 'sofa', 'bathroom', 'deep', 'క్లీనింగ్', 'सफ़ाई'],
  pest_control: ['pest', 'cockroach', 'termite', 'bedbug', 'పురుగు', 'कीड़े'],
  two_wheeler: ['bike', 'scooter', 'puncture', 'బైక్', 'बाइक'],
  cctv: ['cctv', 'camera', 'wifi', 'router', 'network', 'కెమెరా', 'कैमरा'],
  tutor: ['tuition', 'maths', 'teacher', 'ట్యూషన్', 'ट्यूशन'],
  fitness: ['gym', 'yoga', 'trainer', 'యోగా', 'योग'],
  beautician: ['salon', 'hair', 'facial', 'mehndi', 'పార్లర్', 'पार्लर'],
};

function matches(q: string, cat: Category, lang: string): boolean {
  const hay = [
    cat.slug,
    cat.name_en,
    cat.name_te,
    cat.name_hi,
    ...(KEYWORDS[cat.slug] ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).some((w) => w.length > 1 && hay.includes(w));
}

export default function Search() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();

  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const pros = useQuery({ queryKey: ['all-providers'], queryFn: getAllProviders });

  const hitCats = useMemo(
    () => (term ? (cats.data ?? []).filter((c) => matches(term, c, i18n.language)) : (cats.data ?? []).filter((c) => c.is_live)),
    [term, cats.data, i18n.language],
  );
  const hitPros = useMemo(
    () =>
      term.length < 2
        ? []
        : (pros.data ?? []).filter((p) => providerName(p).toLowerCase().includes(term)),
    [term, pros.data],
  );

  const nothing = term.length > 1 && hitCats.length === 0 && hitPros.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={styles.field}>
          <Ionicons name="search" size={18} color={colors.inkMuted} />
          <TextInput
            style={styles.input}
            value={q}
            onChangeText={setQ}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={colors.inkMuted}
            autoFocus
            returnKeyType="search"
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {nothing && <Empty icon="search-outline" title={t('search.noneTitle')} sub={t('search.noneSub')} />}

        {hitCats.length > 0 && (
          <View style={styles.section}>
            <AppText style={styles.secTitle}>{term ? t('search.services') : t('search.popular')}</AppText>
            {hitCats.map((c) => (
              <Pressable
                key={c.id}
                style={({ pressed: p }) => [styles.row, p && pressed]}
                onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: c.slug } })}
              >
                <CategoryArt slug={c.slug} size={38} bg={categoryTint(c.slug)} />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.rowTitle}>{categoryName(c, i18n.language)}</AppText>
                  <AppText style={styles.rowSub}>
                    {c.is_live ? t('home.availableNow') : t('home.onboarding')}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {hitPros.length > 0 && (
          <View style={styles.section}>
            <AppText style={styles.secTitle}>{t('search.people')}</AppText>
            {hitPros.map((p) => (
              <ProviderCard
                key={p.user_id}
                provider={p}
                onPress={() => router.push({ pathname: '/provider/[id]', params: { id: p.user_id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.lg, paddingBottom: space.md },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 46,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: { flex: 1, fontFamily: font.regular, fontSize: type.body, color: colors.ink },

  content: { padding: space.lg, paddingTop: 0, gap: space.xl, paddingBottom: space.xxl },
  section: { gap: space.sm },
  secTitle: { fontFamily: font.displayBold, fontSize: type.h2, color: colors.ink, marginBottom: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  rowTitle: { fontFamily: font.displayBold, fontSize: type.h3, color: colors.ink },
  rowSub: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted, marginTop: 1 },
});
