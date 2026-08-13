import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { getProvider } from '../../lib/queries';
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

  const name = data.profiles?.full_name ?? 'Provider';
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
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.role}>{t('provider.roleLine')}</Text>
              <View style={styles.rr}>
                <Text style={styles.star}>★ {stats?.rating_avg?.toFixed(1) ?? '—'}</Text>
                <Text style={styles.rrMut}>
                  · {t('provider.jobsDone', { count: stats?.jobs_done ?? 0 })}
                  {data.years_exp ? ` · ${t('provider.yearsExp', { count: data.years_exp })}` : ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.voice}>
            <View style={styles.voicePlay}>
              <Ionicons name="play" size={13} color={colors.surface} />
            </View>
            <Text style={styles.voiceTxt}>{t('provider.voiceIntro')}</Text>
          </View>
        </SafeAreaView>

        <View style={styles.body}>
          <View style={styles.facts}>
            <Fact icon="shield-checkmark" color={colors.success} label={t('provider.factKyc')} />
            <Fact icon="time-outline" color={colors.ink} label={t('provider.factEta')} />
            <Fact icon="star" color={colors.goldDeep} label={t('provider.factRating')} />
          </View>

          {/* ₹0 coin on its ink stage */}
          <View style={styles.seal}>
            <View style={styles.coin}>
              <Text style={styles.coinTxt}>₹0</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sealTitle}>{t('provider.sealTitle')}</Text>
              <Text style={styles.sealSub}>{t('provider.sealSub')}</Text>
            </View>
          </View>

          <View style={styles.price}>
            <Text style={styles.priceLbl}>{t('provider.priceLabel')}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceK}>{t('provider.visitCharge')}</Text>
              <Text style={styles.priceV}>₹{data.visiting_charge ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.verifyNote}>
            <Ionicons name="qr-code-outline" size={19} color={colors.accent} />
            <Text style={styles.verifyTxt}>{t('provider.qrNote')}</Text>
          </View>
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
          <Text style={styles.ctaTxt}>{t('provider.request')}</Text>
        </Pressable>
        <Pressable style={styles.ghost}>
          <Ionicons name="call-outline" size={19} color={colors.ink} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Fact({ icon, color, label }: { icon: any; color: string; label: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={19} color={color} />
      <Text style={styles.factTxt}>{label}</Text>
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
  name: { fontFamily: font.teBold, fontSize: type.h1, color: colors.onDark },
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
    backgroundColor: 'rgba(255,122,26,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,122,26,0.4)',
    borderStyle: 'dashed',
    borderRadius: radius.chip,
    padding: space.md,
  },
  verifyTxt: { flex: 1, fontFamily: font.te, fontSize: type.small, color: colors.ink2, lineHeight: 18 },

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
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.surface },
  ghost: {
    width: tap.min,
    height: tap.min,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
