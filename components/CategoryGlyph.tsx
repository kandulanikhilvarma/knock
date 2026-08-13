import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/tokens';

// A category's mark: one icon in a tinted chip. Replaces the earlier stock-photo
// tiles — restraint reads more premium than generic photography, and it stays on
// the ink/paper system. `tone` sets the treatment: paper chip + ink glyph
// (default), ink chip + gold glyph (feature), or muted (coming-soon).
type Tone = 'paper' | 'ink' | 'muted';

const TONES: Record<Tone, { bg: string; fg: string; border?: string }> = {
  paper: { bg: colors.bg, fg: colors.ink, border: colors.line },
  ink: { bg: colors.ink, fg: colors.gold },
  muted: { bg: colors.line2, fg: colors.inkMuted },
};

export default function CategoryGlyph({
  icon,
  size = 48,
  tone = 'paper',
  bg,
  style,
}: {
  icon?: string | null;
  size?: number;
  tone?: Tone;
  bg?: string; // pastel override (Shifud category block)
  style?: StyleProp<ViewStyle>;
}) {
  const t = TONES[tone];
  const chipBg = bg ?? t.bg;
  const fg = bg ? colors.ink : t.fg;
  return (
    <View
      style={[
        styles.chip,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          backgroundColor: chipBg,
          borderColor: bg ? 'transparent' : t.border ?? 'transparent',
          borderWidth: bg || !t.border ? 0 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={(icon ?? 'construct') as any} size={Math.round(size * 0.46)} color={fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { alignItems: 'center', justifyContent: 'center' },
});
