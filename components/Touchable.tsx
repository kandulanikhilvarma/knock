import { Pressable, type PressableProps } from 'react-native';
import { pressed as pressedStyle } from '../theme/tokens';

// Pressable that adds the standard tactile press (subtle scale + dim) without
// each call site repeating the style function. Drop-in for a plain <Pressable>:
// a caller's own style — object or function — still composes underneath.
export default function Touchable({ style, ...rest }: PressableProps) {
  return (
    <Pressable
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && pressedStyle,
      ]}
      {...rest}
    />
  );
}
