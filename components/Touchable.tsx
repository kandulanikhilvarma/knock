import { Pressable, type PressableProps } from 'react-native';
import { pressed as pressedStyle } from '../theme/tokens';

// Pressable that adds the standard tactile press (subtle scale + dim) without
// each call site repeating the style function. Drop-in for a plain <Pressable>:
// a caller's own style — object or function — still composes underneath.
export default function Touchable({ style, disabled, accessibilityRole, ...rest }: PressableProps) {
  return (
    <Pressable
      // Default to the button role + reflect disabled state for screen readers.
      // A caller can still override the role (e.g. "link", "tab").
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && pressedStyle,
      ]}
      {...rest}
    />
  );
}
