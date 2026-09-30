import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

// The OS "reduce motion" setting, live. Loops and entrances hold still when it
// is on. Web answers synchronously from matchMedia so the first frame is right.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      Platform.OS === 'web' &&
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((r) => alive && setReduced(r))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
