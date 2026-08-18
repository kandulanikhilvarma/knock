import { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import LiveMap, { type MapPin } from './LiveMap';
import { colors, space, radius, font, type, shadow } from '../theme/tokens';
import { getProvidersByCategory, providerName } from '../lib/queries';
import { useMyLocation } from '../lib/useMyLocation';
import { decodeGeohash, distanceKm } from '../lib/geo';

// The waiting screen, made alive. While the server runs the real dispatch, this
// shows the neighbourhood the request went into: your block, the pros around it,
// and a ping that rolls across the nearest three so the wait reads as motion,
// not a dead spinner. Pure visualisation — it drives no writes.
export default function FindingPro({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const me = useMyLocation();
  const pros = useQuery({
    queryKey: ['finding-pros', slug],
    queryFn: () => getProvidersByCategory(slug),
  });

  const fallbackName = t('provider.unnamed').split(' ')[0];
  const located = useMemo(() => {
    const rows = (pros.data ?? [])
      .map((p) => {
        const at = decodeGeohash(p.area_geohash);
        return at
          ? { id: p.user_id, name: providerName(p).split(' ')[0] || fallbackName, ...at, km: distanceKm(me.coords, at) }
          : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    rows.sort((a, b) => a.km - b.km);
    return rows.slice(0, 4);
  }, [pros.data, me.coords, fallbackName]);

  // Roll the "pinged" highlight across the three nearest pros, one at a time.
  const [ping, setPing] = useState(0);
  useEffect(() => {
    const n = Math.min(located.length, 3);
    if (n === 0) return;
    const id = setInterval(() => setPing((p) => (p + 1) % n), 1100);
    return () => clearInterval(id);
  }, [located.length]);

  const pins: MapPin[] = located.map((r, i) => ({
    id: r.id,
    name: r.name,
    lat: r.lat,
    lng: r.lng,
    state: i < 3 && i === ping ? 'pinged' : 'idle',
  }));

  const within3 = located.filter((r) => r.km <= 3).length;
  const nearestKm = located[0]?.km;

  // Breathing dot next to the headline so the copy itself feels live.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <View style={styles.wrap}>
      <LiveMap center={me.coords} pins={pins} youLabel={t('dispatch.you')} />

      <View style={styles.meta}>
        <Animated.View style={[styles.metaDot, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }]} />
        <AppText style={styles.metaTxt}>{t('dispatch.nearbyCount', { count: within3 })}</AppText>
        {nearestKm !== undefined && (
          <AppText style={styles.metaFar}>{t('dispatch.nearest', { km: nearestKm.toFixed(1) })}</AppText>
        )}
      </View>

      <View style={styles.head}>
        <AppText style={styles.title}>{t('booking.findingPro')}</AppText>
        <AppText style={styles.sub}>{t('booking.findingSub')}</AppText>
      </View>

      <View style={styles.zero}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.gold} />
        <AppText style={styles.zeroTxt}>{t('booking.zeroNote')}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  metaTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.successInk },
  metaFar: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted },
  head: { gap: 4 },
  title: { fontFamily: font.displayBold, fontSize: type.hero, color: colors.ink, letterSpacing: -0.4 },
  sub: { fontFamily: font.regular, fontSize: type.body, lineHeight: 22, color: colors.inkMuted, maxWidth: '92%' },
  zero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  zeroTxt: { flex: 1, fontFamily: font.regular, fontSize: type.small, color: colors.ink2 },
});
