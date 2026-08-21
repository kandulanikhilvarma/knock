import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

// Gentle mount entrance: fade + a short rise. JS-driven Animated (works in Expo
// Go, no Reanimated/dev-build needed). `delay` staggers a column of these. The
// animation always runs on mount, so content never stays hidden.
export default function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    });
    // Content must never depend on an animation finishing to become visible.
    // requestAnimationFrame is paused in a hidden tab and throttled under low
    // power, which would otherwise strand this subtree at opacity 0 forever.
    // setTimeout still fires in those conditions, so it snaps to visible.
    const safety = setTimeout(() => t.setValue(1), delay + 1200);
    anim.start(({ finished }) => {
      if (finished) clearTimeout(safety);
    });
    return () => {
      clearTimeout(safety);
      anim.stop();
    };
  }, [t, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t,
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
