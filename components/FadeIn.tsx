import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type ViewStyle } from 'react-native';

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
  style?: ViewStyle;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    }).start();
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
