import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, Rect, G, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, space, radius, font, type, shadow } from '../theme/tokens';

export type PinState = 'idle' | 'pinged' | 'accepted';
export type MapPin = { id: string; name: string; state: PinState };

// Fixed slots around the customer, near→far. Fractions of the map box.
const SLOTS = [
  { x: 0.2, y: 0.26 },
  { x: 0.78, y: 0.22 },
  { x: 0.15, y: 0.73 },
  { x: 0.83, y: 0.68 },
  { x: 0.52, y: 0.12 },
];

// A drawn neighbourhood, not a satellite tile: sage blocks, cream lanes, the
// river band. Same monoline hand as the category art.
function Streets() {
  return (
    <Svg style={StyleSheet.absoluteFill as never} viewBox="0 0 320 200" preserveAspectRatio="none">
      <Rect x="0" y="0" width="320" height="200" fill={colors.surface} />
      <G opacity={0.55}>
        <Rect x="14" y="16" width="82" height="52" rx="8" fill={colors.pastelSage} />
        <Rect x="212" y="24" width="94" height="44" rx="8" fill={colors.pastelBlue} />
        <Rect x="22" y="122" width="76" height="60" rx="8" fill={colors.pastelPeach} />
        <Rect x="220" y="130" width="86" height="54" rx="8" fill={colors.pastelSage} />
      </G>
      <Path d="M-10 96 C 60 84, 120 112, 180 96 S 300 78, 340 92" stroke={colors.pastelBlue} strokeWidth={16} fill="none" opacity={0.7} />
      <G stroke={colors.line} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.9}>
        <Path d="M108 -6 V 206" />
        <Path d="M204 -6 V 206" />
        <Path d="M-6 74 H 326" />
        <Path d="M-6 150 H 326" />
      </G>
      <G stroke={colors.line2} strokeWidth={1.4} strokeLinecap="round" fill="none">
        <Path d="M56 -6 V 74" />
        <Path d="M262 74 V 206" />
        <Path d="M108 40 H 204" />
      </G>
    </Svg>
  );
}

function Ping({ color }: { color: string }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(a, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  const style = {
    opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
    transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 3.4] }) }],
  };
  return <Animated.View pointerEvents="none" style={[styles.ping, { borderColor: color }, style]} />;
}

function Pin({ pin, index }: { pin: MapPin; index: number }) {
  const slot = SLOTS[index % SLOTS.length];
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 320,
      delay: 90 * index,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [a, index]);

  const live = pin.state !== 'idle';
  const bg = pin.state === 'accepted' ? colors.success : live ? colors.primary : colors.surface;
  const fg = live ? colors.onDark : colors.ink2;

  return (
    <Animated.View
      style={[
        styles.pinWrap,
        { left: `${slot.x * 100}%`, top: `${slot.y * 100}%` },
        { opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }] },
      ]}
    >
      {live && <Ping color={pin.state === 'accepted' ? colors.success : colors.primary} />}
      <View style={[styles.pinDot, { backgroundColor: bg, borderColor: live ? bg : colors.line }]}>
        {pin.state === 'accepted' ? (
          <Ionicons name="checkmark" size={13} color={fg} />
        ) : (
          <AppText style={[styles.pinInit, { color: fg }]}>{pin.name.slice(0, 1)}</AppText>
        )}
      </View>
      <View style={styles.pinLabel}>
        <AppText style={styles.pinLabelTxt} numberOfLines={1}>
          {pin.name}
        </AppText>
      </View>
    </Animated.View>
  );
}

export default function NearbyMap({ pins, youLabel }: { pins: MapPin[]; youLabel: string }) {
  return (
    <View style={styles.box}>
      <Streets />
      <View style={styles.you}>
        <Svg width={64} height={64} style={styles.youRings} viewBox="0 0 64 64">
          <Circle cx="32" cy="32" r="30" stroke={colors.primary} strokeWidth={1} fill="none" opacity={0.18} />
          <Circle cx="32" cy="32" r="20" stroke={colors.primary} strokeWidth={1} fill="none" opacity={0.28} />
        </Svg>
        <View style={styles.youDot}>
          <View style={styles.youCore} />
        </View>
        <View style={styles.youLabel}>
          <AppText style={styles.youLabelTxt}>{youLabel}</AppText>
        </View>
      </View>
      {pins.map((p, i) => (
        <Pin key={p.id} pin={p} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },

  you: { position: 'absolute', left: '50%', top: '50%', alignItems: 'center', marginLeft: -32, marginTop: -32 },
  youRings: { position: 'absolute', left: 0, top: 0 },
  youDot: {
    marginTop: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  youCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.onDark },
  youLabel: {
    marginTop: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  youLabelTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.onDark },

  pinWrap: { position: 'absolute', alignItems: 'center', marginLeft: -26, marginTop: -13 },
  ping: { position: 'absolute', top: 0, width: 26, height: 26, borderRadius: 13, borderWidth: 1.5 },
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
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pinLabelTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.ink2 },
});
