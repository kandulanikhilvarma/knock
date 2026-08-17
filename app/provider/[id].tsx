import { View, Image, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { getProvider, providerName } from '../../lib/queries';
import { getProviderReviews } from '../../lib/bookings';
import Avatar from '../../components/Avatar';
import { Loading, ErrorState, Empty } from '../../components/StateView';

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => getProvider(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState message={(error as Error)?.message} />;
  if (!data) return <Empty title={t('provider.notFound')} />;

  const name = providerName(data) || t('provider.unnamed');
  const stats = data.provider_stats;
  const verified = data.verify_tier === 'verified';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Black hero */}
        <SafeAreaView edges={['top']} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.avaWrap}>
              <Avatar name={name} photoUrl={data.photo_url} size={76} />
              {verified && (
                <View style={styles.avaRing}>
                  <Ionicons name="checkmark" size={13} color={colors.surface} />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.name}>{name}</AppText>
              <AppText style={styles.role}>{t('provider.roleLine')}</AppText>
              <View style={styles.rr}>
                <AppText style={styles.star}>★ {stats?.rating_avg?.toFixed(1) ?? '·'}</AppText>
                <AppText style={styles.rrMut}>
                  · {t('provider.jobsDone', { count: stats?.jobs_done ?? 0 })}
                  {data.years_exp ? ` · ${t('provider.yearsExp', { count: data.years_exp })}` : ''}
                </AppText>
              </View>
            </View>
          </View>

          {data.voice_intro_url ? (
            <Pressable style={styles.voice} onPress={() => Linking.openURL(data.voice_intro_url!)}>
              <View style={styles.voicePlay}>
                <Ionicons name="play" size={13} color={colors.surface} />
              </View>
              <AppText style={styles.voiceTxt}>{t('provider.voiceIntro')}</AppText>
            </Pressable>
          ) : null}

          {data.work_photos?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
              {data.work_photos.map((u) => (
                <Image key={u} source={{ uri: u }} style={styles.galleryImg} />
              ))}
            </ScrollView>
          ) : null}
        </SafeAreaView>

        <View style={styles.body}>
          <View style={styles.facts}>
            {verified && (
              <Fact icon="shield-checkmark" color={colors.success} label={t('provider.factKyc')} />
            )}
            {data.city ? <Fact icon="location-outline" color={colors.ink} label={data.city} /> : null}
            {stats?.jobs_done ? (
              <Fact
                icon="star"
                color={colors.goldDeep}
                label={t('provider.factRatingReal', {
                  rating: stats.rating_avg.toFixed(1),
                  count: stats.jobs_done,
                })}
              />
            ) : (
              <Fact icon="sparkles-outline" color={colors.goldDeep} label={t('provider.newHere')} />
            )}
          </View>

          {/* ₹0 coin on its ink stage */}
          <View style={styles.seal}>
            <View style={styles.coin}>
              <AppText style={styles.coinTxt}>₹0</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.sealTitle}>{t('provider.sealTitle')}</AppText>
              <AppText style={styles.sealSub}>{t('provider.sealSub')}</AppText>
            </View>
          </View>

          <View style={styles.price}>
            <AppText style={styles.priceLbl}>{t('provider.priceLabel')}</AppText>
            <View style={styles.priceRow}>
              <AppText style={styles.priceK}>{t('provider.visitCharge')}</AppText>
              <AppText style={styles.priceV}>₹{data.visiting_charge ?? '·'}</AppText>
            </View>
          </View>

          <View style={styles.verifyNote}>
            <Ionicons name="qr-code-outline" size={19} color={colors.accent} />
            <AppText style={styles.verifyTxt}>{t('provider.qrNote')}</AppText>
          </View>

          <Reviews providerId={id!} />
        </View>
      </ScrollView>

      {/* Saffron request bar — the one action */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          style={styles.cta}
          onPress={() =>
            router.push({ pathname: '/booking/new', params: { slug: data.services?.[0] ?? '' } })
          }
        >
          <AppText style={styles.ctaTxt}>{t('provider.request')}</AppText>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Fact({ icon, color, label }: { icon: any; color: string; label: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={19} color={color} />
      <AppText style={styles.factTxt}>{label}</AppText>
    </View>
  );
}

function Reviews({ providerId }: { providerId: string }) {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ['reviews', providerId], queryFn: () => getProviderReviews(providerId) });
  if (!q.data || q.data.length === 0) return null;
  return (
    <View style={styles.reviews}>
      <AppText style={styles.reviewsTitle}>{t('provider.reviewsTitle')}</AppText>
      {q.data.slice(0, 10).map((r) => (
        <View key={r.id} style={styles.reviewRow}>
          <AppText style={styles.reviewStars}>{'★'.repeat(r.rating)}</AppText>
          {r.tags.length > 0 && (
            <AppText style={styles.reviewTags}>{r.tags.map((tag) => t(`booking.tag_${tag}`)).join(' · ')}</AppText>
          )}
          {r.body ? <AppText style={styles.reviewBody}>{r.body}</AppText> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 110 },
  hero: { backgroundColor: colors.ink, paddingHorizontal: space.lg, paddingBottom: space.xl },
  heroTop: { flexDirection: 'row', gap: space.md, alignItems: 'center', paddingTop: space.sm },
  avaWrap: { position: 'relative' },
  avaRing: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 25,
    height: 25,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: font.displayBold, fontSize: type.hero, color: colors.onDark },
  role: { fontFamily: font.te, fontSize: type.small, color: colors.onDarkMuted, marginTop: 2 },
  rr: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  star: { fontFamily: font.bold, fontSize: type.small, color: colors.gold },
  rrMut: { fontFamily: font.te, fontSize: type.small, color: colors.onDarkMuted },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.chip,
    padding: space.sm,
    marginTop: space.lg,
  },
  voicePlay: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTxt: { fontFamily: font.te, fontSize: type.small, color: colors.onDarkMuted },
  gallery: { gap: space.sm, paddingTop: space.md },
  galleryImg: { width: 120, height: 120, borderRadius: radius.card, backgroundColor: colors.line2 },

  body: { padding: space.lg, gap: space.md },
  facts: { flexDirection: 'row', gap: space.sm },
  fact: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.chip,
    padding: space.md,
    alignItems: 'center',
    gap: 5,
  },
  factTxt: { fontFamily: font.te, fontSize: type.chip, color: colors.inkMuted, textAlign: 'center', lineHeight: 14 },

  seal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.ink,
    borderRadius: radius.card,
    padding: space.lg,
  },
  coin: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinTxt: { fontFamily: font.bold, fontSize: 15, color: colors.gold },
  sealTitle: { fontFamily: font.teBold, fontSize: type.small, color: colors.onDark, lineHeight: 18 },
  sealSub: { fontFamily: font.te, fontSize: type.chip, color: colors.onDarkMuted, marginTop: 2 },

  price: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.chip,
    padding: space.md,
  },
  priceLbl: { fontFamily: font.te, fontSize: type.chip, color: colors.inkMuted },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  priceK: { fontFamily: font.te, fontSize: type.small, color: colors.ink, fontWeight: '600' },
  priceV: { fontFamily: font.mono, fontSize: type.body, color: colors.ink, fontWeight: '700' },

  verifyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.tintGold,
    borderWidth: 1,
    borderColor: colors.gold,
    borderStyle: 'dashed',
    borderRadius: radius.chip,
    padding: space.md,
  },
  verifyTxt: { flex: 1, fontFamily: font.te, fontSize: type.small, color: colors.ink2, lineHeight: 18 },

  reviews: { gap: space.sm, marginTop: space.xs },
  reviewsTitle: { fontFamily: font.teBold, fontSize: type.h3, color: colors.ink },
  reviewRow: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.chip, padding: space.md, gap: 3 },
  reviewStars: { fontFamily: font.regular, fontSize: type.small, color: colors.gold },
  reviewTags: { fontFamily: font.te, fontSize: type.small, color: colors.ink2 },
  reviewBody: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  cta: {
    flex: 1,
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  ghost: {
    width: tap.min,
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
