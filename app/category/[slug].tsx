import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import {
  getCategories,
  getProvidersByCategory,
  categoryName,
  joinWaitlist,
} from '../../lib/queries';
import ProviderCard from '../../components/ProviderCard';
import Touchable from '../../components/Touchable';
import CategoryArt from '../../components/CategoryArt';
import { categoryTint } from '../../lib/categoryTint';
import { track } from '../../lib/analytics';
import { Ionicons } from '@expo/vector-icons';
import { Loading, ErrorState, Empty } from '../../components/StateView';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const category = (cats.data ?? []).find((c) => c.slug === slug);
  const title = category ? categoryName(category, i18n.language) : '';
  const isLive = category?.is_live ?? false;

  useEffect(() => {
    if (slug) track('category_view', { slug });
  }, [slug]);

  const providers = useQuery({
    queryKey: ['providers', slug],
    queryFn: () => getProvidersByCategory(slug!),
    enabled: !!slug && isLive,
  });

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title }} />
      {!category && cats.isLoading && <Loading />}

      {category && !isLive && (
        <Waitlist categoryId={category.id} title={title} slug={category.slug} icon={category.icon} />
      )}

      {category && isLive && (
        <>
          {providers.isLoading && <Loading />}
          {providers.isError && <ErrorState message={(providers.error as Error)?.message} />}
          {providers.data && (
            <FlatList
              data={providers.data}
              keyExtractor={(p) => p.user_id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <ProviderCard
                  provider={item}
                  onPress={() =>
                    router.push({ pathname: '/provider/[id]', params: { id: item.user_id } })
                  }
                />
              )}
              ListEmptyComponent={
                <Empty title={t('category.noProviders')} sub={t('category.noProvidersSub')} />
              }
            />
          )}
        </>
      )}
    </View>
  );
}

function Waitlist({
  categoryId,
  title,
  slug,
  icon,
}: {
  categoryId: string;
  title: string;
  slug: string;
  icon?: string | null;
}) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const m = useMutation({
    mutationFn: () => joinWaitlist(categoryId, phone.trim(), 'Vijayawada'),
  });

  if (m.isSuccess) {
    return <Empty icon="checkmark-circle" title={t('category.waitlistDone')} sub={t('category.waitlistDoneSub')} />;
  }

  const valid = /^\d{10}$/.test(phone.trim());

  return (
    <ScrollView contentContainerStyle={styles.waitlist} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <CategoryArt slug={slug} size={48} bg={categoryTint(slug)} />
        <View style={{ flex: 1 }}>
          <View style={styles.heroBadge}>
            <AppText style={styles.heroBadgeTxt}>{t('category.onboardingBadge')}</AppText>
          </View>
          <AppText style={styles.heroTitle}>{title}</AppText>
        </View>
      </View>

      <AppText style={styles.wTitle}>{t('category.onboardingTitle', { category: title })}</AppText>
      <AppText style={styles.wSub}>{t('category.onboardingSub')}</AppText>

      <View style={styles.notifyBox}>
        <Ionicons name="notifications-outline" size={18} color={colors.accent} />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('category.phonePlaceholder')}
          placeholderTextColor={colors.inkMuted}
          keyboardType="number-pad"
          maxLength={10}
        />
      </View>
      <Touchable
        style={[styles.cta, (!valid || m.isPending) && styles.ctaOff]}
        disabled={!valid || m.isPending}
        onPress={() => m.mutate()}
      >
        <AppText style={styles.ctaTxt}>{t('category.notifyMe')}</AppText>
      </Touchable>
      {m.isError && <AppText style={styles.err}>{(m.error as Error).message}</AppText>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: space.lg, gap: space.md },
  waitlist: { padding: space.lg, gap: space.md },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.ink,
    borderRadius: radius.card,
    padding: space.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  heroBadgeTxt: { fontFamily: font.teBold, fontSize: 10, color: colors.ink, letterSpacing: 0.4 },
  heroTitle: { fontFamily: font.displayBold, fontSize: type.hero, color: colors.onDark },
  wTitle: { fontFamily: font.displayBold, fontSize: type.h1, color: colors.ink },
  wSub: { fontFamily: font.regular, fontSize: type.body, color: colors.inkMuted, lineHeight: 22 },
  notifyBox: {
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: font.regular,
    fontSize: type.body,
    color: colors.ink,
  },
  cta: {
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger },
});
