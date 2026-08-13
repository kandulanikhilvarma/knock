import Svg, { Path } from 'react-native-svg';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

// The flowing single-stroke line motif from the Shifud reference. Sits behind
// hero content as a quiet texture. Two long curves, low-contrast ink.
export default function OrganicLines({
  color = colors.ink,
  opacity = 0.08,
  style,
}: {
  color?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 260"
      preserveAspectRatio="xMidYMid slice"
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    >
      <Path
        d="M-20 70 C 80 10, 150 130, 250 70 S 420 20, 440 120"
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={opacity}
        fill="none"
      />
      <Path
        d="M-30 150 C 90 210, 180 90, 280 160 S 430 210, 460 150"
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={opacity}
        fill="none"
      />
      <Path
        d="M40 -10 C 120 60, 60 160, 160 210"
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={opacity * 0.8}
        fill="none"
      />
    </Svg>
  );
}
