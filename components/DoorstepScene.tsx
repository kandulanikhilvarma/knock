import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, AccessibilityInfo, Platform } from 'react-native';
import Svg, {
  Path, Rect, Circle, G, Defs, LinearGradient, RadialGradient, Stop,
} from 'react-native-svg';
import { colors } from '../theme/tokens';

// The home hero's anchor image: a Vijayawada street at dusk with one door lit
// gold — the product's whole promise in one picture (someone is on the way to
// that door). Drawn, not photographed: it ships in the bundle, works offline on
// a weak connection, stays sharp at any size, and re-themes from tokens.
const W = 390;
const H = 168;
const GROUND = 138;

// Two depth layers. The far row is smaller and dimmer, the near row solid —
// that separation is what stops a skyline reading as a row of flat blocks.
const FAR = [
  { x: 6, w: 30, h: 44 }, { x: 40, w: 22, h: 32 }, { x: 66, w: 34, h: 54 },
  { x: 104, w: 24, h: 38 }, { x: 236, w: 28, h: 48 }, { x: 268, w: 36, h: 60 },
  { x: 308, w: 24, h: 36 }, { x: 336, w: 32, h: 52 },
];
const NEAR = [
  { x: -8, w: 44, h: 62, lit: [1, 4] },
  { x: 40, w: 34, h: 44, lit: [2] },
  { x: 78, w: 30, h: 72, lit: [0, 5] },
  { x: 252, w: 40, h: 66, lit: [1, 3] },
  { x: 296, w: 30, h: 46, lit: [0] },
  { x: 330, w: 46, h: 78, lit: [2, 6] },
];

function Windows({ b }: { b: { x: number; w: number; h: number; lit: number[] } }) {
  const cols = Math.max(1, Math.floor((b.w - 12) / 12));
  const rows = Math.max(1, Math.floor((b.h - 18) / 15));
  const cells = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = b.lit.includes(i);
      cells.push(
        <Rect
          key={`${r}-${c}`}
          x={b.x + 8 + c * 12}
          y={GROUND - b.h + 11 + r * 15}
          width={6}
          height={8}
          rx={1.5}
          fill={on ? colors.gold : colors.onDark}
          opacity={on ? 0.9 : 0.08}
        />,
      );
      i++;
    }
  }
  return <G>{cells}</G>;
}

// A coconut palm — the detail that places this street in coastal Andhra rather
// than any generic city skyline.
function Palm({ x, s = 1 }: { x: number; s?: number }) {
  const st = {
    stroke: colors.primarySoft,
    strokeWidth: 2.4 * s,
    fill: 'none',
    strokeLinecap: 'round',
  } as const;
  return (
    <G opacity={0.75}>
      <Path d={`M${x} ${GROUND} q ${-3 * s} ${-22 * s} ${1 * s} ${-38 * s}`} {...st} />
      {[-1, 1].map((d) => (
        <G key={d}>
          <Path d={`M${x + s} ${GROUND - 38 * s} q ${d * 13 * s} ${-5 * s} ${d * 19 * s} ${5 * s}`} {...st} />
          <Path d={`M${x + s} ${GROUND - 38 * s} q ${d * 11 * s} ${-11 * s} ${d * 12 * s} ${-2 * s}`} {...st} />
        </G>
      ))}
    </G>
  );
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
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) run();
      });
    };
    run();

    // Honour "reduce motion" by parking the rider mid-street rather than
    // off-frame, so a still scene still shows someone on the way.
    let stopped = false;
    const stop = () => {
      stopped = true;
      cancelled = true;
      drift.stopAnimation();
      drift.setValue(0.42);
    };
    if (Platform.OS === 'web') {
      if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) stop();
    } else {
      AccessibilityInfo.isReduceMotionEnabled()
        .then((r) => {
          if (r && !stopped) stop();
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
      drift.stopAnimation();
    };
  }, [drift]);

  const x = drift.interpolate({ inputRange: [0, 1], outputRange: [-110, W + 60] });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0" />
            <Stop offset="0.55" stopColor={colors.primarySoft} stopOpacity="0.35" />
            <Stop offset="1" stopColor={colors.gold} stopOpacity="0.10" />
          </LinearGradient>
          <RadialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={colors.gold} stopOpacity="0.62" />
            <Stop offset="1" stopColor={colors.gold} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="moon" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={colors.onDark} stopOpacity="0.30" />
            <Stop offset="1" stopColor={colors.onDark} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="hb" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.gold} stopOpacity="0.38" />
            <Stop offset="1" stopColor={colors.gold} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width={W} height={H} fill="url(#sky)" />

        <Circle cx={330} cy={34} r={30} fill="url(#moon)" />
        <Circle cx={330} cy={34} r={9} fill={colors.onDark} opacity={0.5} />
        {[[46, 26], [96, 16], [150, 34], [206, 20], [268, 30], [300, 12], [370, 46]].map(([sx, sy], i) => (
          <Circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 1.5 : 1} fill={colors.onDark} opacity={0.35} />
        ))}

        {/* Kanaka Durga hill — the city's own silhouette on the skyline. */}
        <Path
          d={`M-10 ${GROUND} C 30 ${GROUND - 58}, 74 ${GROUND - 82}, 120 ${GROUND - 50} C 152 ${GROUND - 28}, 180 ${GROUND - 12}, 214 ${GROUND} Z`}
          fill={colors.primarySoft}
          opacity={0.42}
        />

        <G opacity={0.4}>
          {FAR.map((b) => (
            <Rect key={b.x} x={b.x} y={GROUND - b.h} width={b.w} height={b.h} rx={2} fill={colors.primarySoft} />
          ))}
        </G>

        {NEAR.map((b) => (
          <G key={b.x}>
            <Rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} rx={2.5} fill={colors.primarySoft} />
            <Windows b={b} />
          </G>
        ))}

        <Palm x={124} s={0.9} />
        <Palm x={244} s={0.75} />

        {/* The lit doorway — the one warm thing in the frame, and the point. */}
        <Circle cx={190} cy={GROUND - 26} r={54} fill="url(#lamp)" />
        <Rect x={156} y={GROUND - 66} width={70} height={66} rx={3} fill={colors.primarySoft} />
        <Path d={`M150 ${GROUND - 66} L191 ${GROUND - 88} L232 ${GROUND - 66} Z`} fill={colors.primarySoft} />
        <Rect x={166} y={GROUND - 56} width={12} height={12} rx={2} fill={colors.gold} opacity={0.5} />
        <Rect x={204} y={GROUND - 56} width={12} height={12} rx={2} fill={colors.gold} opacity={0.5} />
        <Rect x={179} y={GROUND - 36} width={24} height={36} rx={2} fill={colors.gold} opacity={0.95} />
        <Circle cx={198} cy={GROUND - 18} r={1.8} fill={colors.primary} />
        <Rect x={172} y={GROUND - 3} width={38} height={3} rx={1.5} fill={colors.primarySoft} />
        {/* Light spilling from the open door onto the street. */}
        <Path
          d={`M179 ${GROUND} L203 ${GROUND} L215 ${GROUND + 16} L167 ${GROUND + 16} Z`}
          fill={colors.gold}
          opacity={0.16}
        />

        {/* Street */}
        <Rect x="0" y={GROUND} width={W} height={H - GROUND} fill={colors.primary} opacity={0.6} />
        <Path d={`M0 ${GROUND + 0.5} H${W}`} stroke={colors.onDark} strokeWidth={1} opacity={0.18} />
        <G opacity={0.16}>
          {[10, 58, 106, 154, 202, 250, 298, 346].map((dx) => (
            <Rect key={dx} x={dx} y={GROUND + 17} width={20} height={2} rx={1} fill={colors.onDark} />
          ))}
        </G>
      </Svg>

      {/* The pro, on the way — own layer so it moves without redrawing the scene. */}
      <Animated.View style={[styles.rider, { transform: [{ translateX: x }] }]}>
        <Svg width={104} height={62} viewBox="0 0 104 62">
          <Defs>
            <LinearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.gold} stopOpacity="0.38" />
              <Stop offset="1" stopColor={colors.gold} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d="M84 34 L104 24 L104 46 Z" fill="url(#beam)" />

          <G>
            <Circle cx="44" cy="14" r="7.5" fill={colors.onDark} />
            <Path d="M36.5 13 a7.5 7.5 0 0 1 15 0 z" fill={colors.success} />
            <Path d="M44 22 L40 38" stroke={colors.onDark} strokeWidth="7" strokeLinecap="round" />
            <Path d="M44 25 L64 31" stroke={colors.onDark} strokeWidth="4.6" strokeLinecap="round" />
            <Path d="M41 37 L52 41" stroke={colors.onDark} strokeWidth="5" strokeLinecap="round" />
          </G>

          <G>
            <Path d="M30 44 L52 44 L60 33 L70 33" stroke={colors.success} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M64 31 L58 22 L50 22" stroke={colors.success} strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <Path d="M52 44 q 12 0 16 -8" stroke={colors.success} strokeWidth="4" fill="none" strokeLinecap="round" />
            <Circle cx="78" cy="33" r="3.4" fill={colors.gold} />
            <Circle cx="26" cy="48" r="9" fill="none" stroke={colors.onDark} strokeWidth="3.6" />
            <Circle cx="74" cy="48" r="9" fill="none" stroke={colors.onDark} strokeWidth="3.6" />
            <Circle cx="26" cy="48" r="2.4" fill={colors.onDark} opacity="0.7" />
            <Circle cx="74" cy="48" r="2.4" fill={colors.onDark} opacity="0.7" />
          </G>

          {/* Tool box on the back — he is coming to work, not just passing by. */}
          <Rect x="14" y="30" width="18" height="14" rx="2.5" fill={colors.gold} opacity="0.9" />
          <Path d="M20 30 v-3 h6 v3" stroke={colors.gold} strokeWidth="2" fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: H, width: '100%', overflow: 'hidden' },
  rider: { position: 'absolute', left: 0, bottom: 0 },
});
