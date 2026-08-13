import Svg, { Path, Circle, Rect, Line, Ellipse, G } from 'react-native-svg';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

// Hand-drawn monoline marks per trade — the crafted, editorial alternative to
// generic icons. Single forest stroke on the category's pastel block, matching
// the organic line motif. viewBox is 44×44; add a slug in ART to extend.
const S = { stroke: colors.primary, strokeWidth: 2.1, fill: 'none' } as const;
const R = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function Art({ slug }: { slug: string }) {
  switch (slug) {
    case 'electrician':
      return <Path {...S} {...R} d="M25 6 L13 25 H21 L19 39 L31 18 H23 Z" />;
    case 'plumber':
      return (
        <G {...S} {...R}>
          <Path d="M9 15 H23 A6 6 0 0 1 29 21 V25" />
          <Path d="M6 15 H12" />
          <Path d="M29 30 c-3 3 -3 7 0 7 s3 -4 0 -7 z" />
        </G>
      );
    case 'ac_appliance':
      return (
        <G {...S} {...R}>
          <Rect x="7" y="11" width="30" height="15" rx="3" />
          <Line x1="11" y1="21" x2="33" y2="21" />
          <Path d="M13 31 q3 -3 6 0 M24 31 q3 -3 6 0" />
        </G>
      );
    case 'carpenter':
      return (
        <G {...S} {...R}>
          <Rect x="10" y="10" width="18" height="7" rx="1.5" />
          <Path d="M19 17 L23 37" />
        </G>
      );
    case 'painter':
      return (
        <G {...S} {...R}>
          <Rect x="8" y="11" width="19" height="9" rx="3" />
          <Path d="M27 15 h5 v6 h-6" />
          <Path d="M29 21 V30 a3 3 0 0 1 -3 3 h-2" />
        </G>
      );
    case 'cleaning':
      return (
        <G {...S} {...R}>
          <Path d="M18 17 h8 v16 a3 3 0 0 1 -3 3 h-2 a3 3 0 0 1 -3 -3 z" />
          <Path d="M18 17 v-4 h6 v4" />
          <Path d="M18 15 l-5 2" />
          <Circle cx="10" cy="12" r="1" />
          <Circle cx="9" cy="17" r="1" />
          <Circle cx="13" cy="9" r="1" />
        </G>
      );
    case 'pest_control':
      return (
        <G {...S} {...R}>
          <Ellipse cx="22" cy="25" rx="7" ry="9" />
          <Circle cx="22" cy="14" r="3.5" />
          <Path d="M20 11 l-3 -3 M24 11 l3 -3" />
          <Path d="M15 21 h-5 M29 21 h5 M15 27 h-5 M29 27 h5" />
        </G>
      );
    case 'two_wheeler':
      return (
        <G {...S} {...R}>
          <Circle cx="13" cy="31" r="5" />
          <Circle cx="33" cy="31" r="5" />
          <Path d="M13 31 L21 21 H28 L33 31" />
          <Path d="M21 21 H16 M28 21 h5" />
        </G>
      );
    case 'cctv':
      return (
        <G {...S} {...R}>
          <Path d="M9 15 L30 12 l1 8 -21 3 z" />
          <Circle cx="20" cy="17" r="3" />
          <Path d="M31 16 h5 M33 20 V32" />
        </G>
      );
    case 'tutor':
      return (
        <G {...S} {...R}>
          <Path d="M22 14 c-4 -3 -8 -3 -12 0 v18 c4 -3 8 -3 12 0 c4 -3 8 -3 12 0 V14 c-4 -3 -8 -3 -12 0 z" />
          <Path d="M22 14 V32" />
        </G>
      );
    case 'fitness':
      return (
        <G {...S} {...R}>
          <Line x1="15" y1="22" x2="29" y2="22" />
          <Rect x="8" y="16" width="6" height="12" rx="2" />
          <Rect x="30" y="16" width="6" height="12" rx="2" />
        </G>
      );
    case 'beautician':
      return (
        <G {...S} {...R}>
          <Circle cx="14" cy="31" r="4" />
          <Circle cx="30" cy="31" r="4" />
          <Path d="M17 28 L34 11 M27 28 L10 11" />
        </G>
      );
    default:
      return <Circle {...S} cx="22" cy="22" r="10" />;
  }
}

export default function CategoryArt({
  slug,
  size = 44,
  bg,
  muted,
  style,
}: {
  slug: string;
  size?: number;
  bg?: string;
  muted?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const box = Math.round(size * 1.28);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: box,
          height: box,
          borderRadius: Math.round(box * 0.32),
          backgroundColor: muted ? colors.line2 : bg ?? colors.pastelSage,
          opacity: muted ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 44 44">
        <Art slug={slug} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
