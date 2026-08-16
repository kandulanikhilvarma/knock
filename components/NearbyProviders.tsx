import { useMemo } from 'react';
import { View, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import LiveMap, { type MapPin } from './LiveMap';
import { colors, space, radius, font, type, shadow, pressed } from '../theme/tokens';
import { getAllProviders, providerName } from '../lib/queries';
import { useMyLocation } from '../lib/useMyLocation';
import { decodeGeohash, distanceKm } from '../lib/geo';

// The Rapido-style home map: your location plus the pros actually around you,
// standing idle, before anything is requested. Tapping a pin opens that pro.
export default function NearbyProviders({ liveSlug, liveCid }: { liveSlug: string; liveCid: string | null }) {
  const { t } = useTranslation();
  const router = useRouter();
  const me = useMyLocation();
  const pros = useQuery({ queryKey: ['all-providers'], queryFn: getAllProviders });

  const located = useMemo(() => {
    return (pros.data ?? [])
      .filter((p) => p.availability_status === 'available')
      .map((p) => {
        const at = decodeGeohash(p.area_geohash);
        return at ? { id: p.user_id, name: providerName(p).split(' ')[0] || 'Pro', ...at, km: distanceKm(me.coords, at) } : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => a.km - b.km);
  }, [pros.data, me.coords]);

  const pins: MapPin[] = located.slice(0, 6).map((r) => ({
    id: r.id,
    name: r.name,
    lat: r.lat,
    lng: r.lng,
    state: 'idle',
  }));

  const within3 = located.filter((r) => r.km <= 3).length;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <AppText style={styles.title}>{t('nearby.title')}</AppText>
        {me.precise && located.length > 0 && (
          <View style={styles.pill}>
            <View style={styles.dot} />
            <AppText style={styles.pillTxt}>{t('nearby.count', { count: Math.max(within3, located.length && 1) })}</AppText>
          </View>
        )}
      </View>

      <View style={styles.mapWrap}>
        <LiveMap center={me.coords} pins={pins} youLabel={t('dispatch.you')} height={210} insetX={32} zoom={13} />

        {/* Location off → a Rapido-style prompt sitting over the city fallback.
            iOS only shows the system dialog once; after a hard deny the OS won't
            re-prompt, so send the user to Settings instead of a button that
            silently no-ops. */}
        {me.denied && (
          <View style={styles.gate}>
            <View style={styles.gateCard}>
              <Ionicons name="location" size={22} color={colors.primary} />
              <AppText style={styles.gateTitle}>{t('nearby.offTitle')}</AppText>
              <AppText style={styles.gateSub}>
                {me.canAskAgain ? t('nearby.offSub') : t('nearby.offBlockedSub')}
              </AppText>
              <Pressable
                style={({ pressed: p }) => [styles.gateBtn, p && pressed]}
                onPress={() => (me.canAskAgain ? me.request() : Linking.openSettings())}
              >
                <AppText style={styles.gateBtnTxt}>
                  {me.canAskAgain ? t('nearby.turnOn') : t('nearby.openSettings')}
                </AppText>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed: p }) => [styles.cta, p && pressed]}
        onPress={() => router.push({ pathname: '/dispatch', params: { slug: liveSlug, cid: liveCid ?? '' } })}
      >
        <Ionicons name="flash" size={16} color={colors.onDark} />
        <AppText style={styles.ctaTxt}>{t('nearby.cta')}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: font.displayBold, fontSize: type.h1, color: colors.ink },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.tintSuccess,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  pillTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.successInk },

  mapWrap: { position: 'relative' },
  gate: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  gateCard: {
    alignItems: 'center',
    gap: 4,
    padding: space.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  gateTitle: { fontFamily: font.displayBold, fontSize: type.h3, color: colors.ink, marginTop: 4 },
  gateSub: {
    fontFamily: font.regular,
    fontSize: type.small,
    lineHeight: 18,
    color: colors.inkMuted,
    textAlign: 'center',
    maxWidth: 220,
  },
  gateBtn: {
    marginTop: space.sm,
    height: 42,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateBtnTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.onDark },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    ...shadow.soft,
  },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
});
