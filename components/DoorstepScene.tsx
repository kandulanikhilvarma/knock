import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, AccessibilityInfo, Platform } from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';

// The home hero's anchor image: a Vijayawada street at dusk with one door lit
// gold — the product's whole promise in one picture (someone is coming to that
// door). Drawn, not photographed: it ships in the bundle, works offline, scales
// to any screen, and re-themes from tokens. A scooter drifts across the street
// so the scene reads as alive rather than wallpaper.
const W = 390;
const H = 132;
const GROUND = 112;

// x, width, height-above-ground, and which windows are lit.
const BUILDINGS: { x: number; w: number; h: number; lit: number[] }[] = [
  { x: -6, w: 46, h: 52, lit: [1] },
  { x: 44, w: 34, h: 38, lit: [] },
  { x: 82, w: 40, h: 62, lit: [0, 3] },
  { x: 126, w: 30, h: 44, lit: [2] },
  { x: 250, w: 38, h: 56, lit: [1, 2] },
  { x: 292, w: 32, h: 40, lit: [] },
  { x: 328, w: 46, h: 66, lit: [0, 4] },
  { x: 378, w: 26, h: 46, lit: [] },
];

function Windows({ b }: { b: { x: number; w: number; h: number; lit: number[] } }) {
  const cols = Math.max(1, Math.floor((b.w - 10) / 11));
  const rows = Math.max(1, Math.floor((b.h - 14) / 14));
  const cells = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = b.lit.includes(i);
      cells.push(
        <Rect
          key={`${r}-${c}`}
          x={b.x + 7 + c * 11}
          y={GROUND - b.h + 9 + r * 14}
          width={6}
          height={7}
          rx={1}
          fill={on ? colors.gold : colors.onDark}
          opacity={on ? 0.85 : 0.09}
        />,
      );
      i++;
    }
  }
  return <G>{cells}</G>;
}

export default function DoorstepScene() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      drift.setValue(0);
      Animated.timing(drift, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) run();
      });
    };

    // Start moving right away — gating the start on an async check left the
    // scooter parked whenever that promise didn't settle as expected.
    run();

    // Then honour "reduce motion" by stopping; the scene is complete standing still.
    let stopped = false;
    // Park it on the street rather than off-frame, so a still scene still shows
    // someone on the way instead of an empty road.
    const stop = () => {
      stopped = true;
      cancelled = true;
      drift.stopAnimation();
      drift.setValue(0.34);
    };
    if (Platform.OS === 'web') {
      if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) stop();
    } else {
      AccessibilityInfo.isReduceMotionEnabled()
        .then((reduced) => {
          if (reduced && !stopped) stop();
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      drift.stopAnimation();
    };
  }, [drift]);

  const x = drift.interpolate({ inputRange: [0, 1], outputRange: [-70, W + 40] });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <Defs>
          <LinearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0" />
            <Stop offset="1" stopColor={colors.primarySoft} stopOpacity="0.55" />
          </LinearGradient>
          <RadialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={colors.gold} stopOpacity="0.55" />
            <Stop offset="1" stopColor={colors.gold} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={W} height={H} fill="url(#dusk)" />

        {/* Kanaka Durga hill on the skyline — the city's own silhouette. */}
        <Path
          d={`M-10 ${GROUND} C 40 ${GROUND - 54}, 78 ${GROUND - 70}, 118 ${GROUND - 44} C 148 ${GROUND - 24}, 176 ${GROUND - 12}, 210 ${GROUND} Z`}
          fill={colors.primarySoft}
          opacity={0.5}
        />

        {BUILDINGS.map((b) => (
          <G key={b.x}>
            <Rect
              x={b.x}
              y={GROUND - b.h}
              width={b.w}
              height={b.h}
              rx={2}
              fill={colors.primarySoft}
              opacity={0.92}
            />
            <Windows b={b} />
          </G>
        ))}

        {/* The lit doorway — the one warm thing in the frame. */}
        <Circle cx={196} cy={GROUND - 22} r={44} fill="url(#lamp)" />
        <Rect x={164} y={GROUND - 58} width={64} height={58} rx={3} fill={colors.primarySoft} />
        <Path d={`M164 ${GROUND - 58} L196 ${GROUND - 76} L228 ${GROUND - 58} Z`} fill={colors.primarySoft} />
        <Rect x={186} y={GROUND - 34} width={20} height={34} rx={2} fill={colors.gold} opacity={0.92} />
        <Circle cx={202} cy={GROUND - 17} r={1.6} fill={colors.primary} />
        {/* Light spilling onto the street from the open door. */}
        <Path
          d={`M186 ${GROUND} L206 ${GROUND} L214 ${GROUND + 12} L178 ${GROUND + 12} Z`}
          fill={colors.gold}
          opacity={0.14}
        />

        {/* Street */}
        <Rect x="0" y={GROUND} width={W} height={H - GROUND} fill={colors.primary} opacity={0.55} />
        <Path
          d={`M0 ${GROUND + 0.5} H${W}`}
          stroke={colors.onDark}
          strokeWidth={1}
          opacity={0.16}
        />
      </Svg>

      {/* The pro, on the way. Separate layer so it can move without redrawing the scene. */}
      <Animated.View style={[styles.rider, { transform: [{ translateX: x }] }]}>
        <Svg width={54} height={30} viewBox="0 0 54 30">
          <G>
            <Circle cx="14" cy="24" r="4.6" fill={colors.onDark} opacity={0.9} />
            <Circle cx="40" cy="24" r="4.6" fill={colors.onDark} opacity={0.9} />
            <Path
              d="M10 20 L20 20 L26 13 L36 13 L42 20"
              stroke={colors.success}
              strokeWidth="2.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M27 13 L29 5 L35 5"
              stroke={colors.success}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="45" cy="18" r="2" fill={colors.gold} opacity={0.95} />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: H, width: '100%', overflow: 'hidden' },
  rider: { position: 'absolute', left: 0, bottom: 2 },
});
