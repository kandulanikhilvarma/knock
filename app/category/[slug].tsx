import { useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
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
import CategoryImage from '../../components/CategoryImage';
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
        <CategoryImage slug={slug} icon={icon} dim width={800} style={styles.heroImg} />
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeTxt}>{t('common.comingSoon')}</Text>
        </View>
        <Text style={styles.heroTitle}>{title}</Text>
      </View>

      <Text style={styles.wTitle}>{t('category.comingSoonTitle', { category: title })}</Text>
      <Text style={styles.wSub}>{t('category.comingSoonSub')}</Text>

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
      <Pressable
        style={[styles.cta, (!valid || m.isPending) && styles.ctaOff]}
        disabled={!valid || m.isPending}
        onPress={() => m.mutate()}
      >
        <Text style={styles.ctaTxt}>{t('category.notifyMe')}</Text>
      </Pressable>
      {m.isError && <Text style={styles.err}>{(m.error as Error).message}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: space.lg, gap: space.md },
  waitlist: { padding: space.lg, gap: space.md },
  hero: {
    height: 170,
    borderRadius: radius.card,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: space.lg,
  },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroBadge: {
    position: 'absolute',
    top: space.md,
    left: space.md,
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  heroBadgeTxt: { fontFamily: font.teBold, fontSize: 10, color: colors.ink, letterSpacing: 0.4 },
  heroTitle: { fontFamily: font.teBold, fontSize: type.h1, color: colors.surface },
  wTitle: { fontFamily: font.teBold, fontSize: type.h2, color: colors.ink },
  wSub: { fontFamily: font.te, fontSize: type.body, color: colors.inkMuted, lineHeight: 22 },
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
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.bold, fontSize: type.body, color: colors.surface },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger },
});
