import { useEffect, useMemo, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, space, radius, font, type, shadow } from '../theme/tokens';
import { project, TILE, type LatLng } from '../lib/geo';

export type PinState = 'idle' | 'pinged' | 'accepted';
export type MapPin = LatLng & { id: string; name: string; state: PinState };

// CARTO's light basemap (OpenStreetMap data). Key-free, and the muted grey sits
// under the cream palette instead of fighting it.
const TILE_URL = (z: number, x: number, y: number) =>
  `https://basemaps.cartocdn.com/light_all/${z}/${x}/${y}@2x.png`;

function Pulse({ color, size = 26 }: { color: string; size?: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(a, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        { width: size, height: size, borderRadius: size / 2, borderColor: color },
        {
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
          transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.7, 3.2] }) }],
        },
      ]}
    />
  );
}

export default function LiveMap({
  center,
  pins,
  youLabel,
  height = 260,
  insetX = 32,
  zoom = 14,
}: {
  center: LatLng;
  pins: MapPin[];
  youLabel: string;
  height?: number;
  insetX?: number; // horizontal padding of the screen this sits in
  zoom?: number; // 14 ~ neighbourhood, the scale a rider app opens at
}) {
  // Width from the window, not onLayout: the tile grid has to be laid out on
  // the first render, and a layout callback lands one frame too late.
  const width = Math.max(useWindowDimensions().width - insetX, 1);

  const view = useMemo(() => {
    const c = project(center, zoom);
    // Top-left world pixel of the viewport, and the tile range covering it.
    const left = c.x - width / 2;
    const top = c.y - height / 2;
    const x0 = Math.floor(left / TILE);
    const y0 = Math.floor(top / TILE);
    const x1 = Math.floor((left + width) / TILE);
    const y1 = Math.floor((top + height) / TILE);
    const n = Math.pow(2, zoom);
    const tiles: { key: string; url: string; left: number; top: number }[] = [];
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        if (y < 0 || y >= n) continue;
        const wrapped = ((x % n) + n) % n;
        tiles.push({
          key: `${zoom}/${x}/${y}`,
          url: TILE_URL(zoom, wrapped, y),
          left: x * TILE - left,
          top: y * TILE - top,
        });
      }
    }
    // Pros outside the frame clamp to the edge instead of vanishing, so the
    // map always shows the whole pool the engine is ranking.
    const at = (p: LatLng) => {
      const q = project(p, zoom);
      return {
        left: Math.min(Math.max(q.x - left, 30), width - 30),
        top: Math.min(Math.max(q.y - top, 22), height - 34),
      };
    };
    return { tiles, at, zoom, center: at(center) };
  }, [center, width, height, zoom]);

  return (
    <View style={[styles.box, { height }]}>
      {view && (
        <>
          {view.tiles.map((t) => (
            <Image
              key={t.key}
              source={{ uri: t.url }}
              style={{ position: 'absolute', left: t.left, top: t.top, width: TILE, height: TILE }}
              fadeDuration={160}
            />
          ))}

          {pins.map((p) => {
            const pos = view.at(p);
            const live = p.state !== 'idle';
            const bg = p.state === 'accepted' ? colors.success : live ? colors.primary : colors.surface;
            const fg = live ? colors.onDark : colors.ink2;
            return (
              <View key={p.id} style={[styles.pin, { left: pos.left - 26, top: pos.top - 13 }]}>
                {live && <Pulse color={p.state === 'accepted' ? colors.success : colors.primary} />}
                <View style={[styles.pinDot, { backgroundColor: bg, borderColor: live ? bg : colors.line }]}>
                  {p.state === 'accepted' ? (
                    <Ionicons name="checkmark" size={13} color={fg} />
                  ) : (
                    <AppText style={[styles.pinInit, { color: fg }]}>{p.name.slice(0, 1)}</AppText>
                  )}
                </View>
                <View style={styles.pinLabel}>
                  <AppText style={styles.pinLabelTxt} numberOfLines={1}>
                    {p.name}
                  </AppText>
                </View>
              </View>
            );
          })}

          <View style={[styles.you, { left: view.center.left - 32, top: view.center.top - 12 }]}>
            <Pulse color={colors.primary} size={24} />
            <View style={styles.youDot}>
              <View style={styles.youCore} />
            </View>
            <View style={styles.youLabel}>
              <AppText style={styles.youLabelTxt}>{youLabel}</AppText>
            </View>
          </View>
        </>
      )}

      <View style={styles.attr}>
        <AppText style={styles.attrTxt}>© OpenStreetMap · CARTO</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.line2,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  pulse: { position: 'absolute', top: 0, borderWidth: 1.5 },

  pin: { position: 'absolute', width: 52, alignItems: 'center' },
  pinDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  pinInit: { fontFamily: font.bold, fontSize: 12 },
  pinLabel: {
    marginTop: 3,
    maxWidth: 92,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pinLabelTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.ink2 },

  you: { position: 'absolute', width: 64, alignItems: 'center' },
  youDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.onDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  youCore: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.onDark },
  youLabel: {
    marginTop: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  youLabelTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.onDark },

  attr: {
    position: 'absolute',
    right: 6,
    bottom: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  attrTxt: { fontFamily: font.regular, fontSize: 9, color: colors.ink2 },
});
