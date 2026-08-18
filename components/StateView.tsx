import { View, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import OrganicLines from './OrganicLines';
import { colors, font, radius, space, type, tap, pressed } from '../theme/tokens';

// Shared loading / error / empty states — every list screen ships all three (GATE 4→5).
export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function ErrorState({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.center}>
      <View style={[styles.chip, { backgroundColor: colors.pastelPink }]}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.danger} />
      </View>
      <AppText style={styles.title}>{t('common.crashTitle')}</AppText>
      {message ? <AppText style={styles.sub}>{message}</AppText> : null}
    </View>
  );
}

// Empty state, made warm: a pastel glyph chip over a faint organic motif, a serif
// line, and an optional forest pill so the screen can invite the next step
// instead of just reporting absence.
export function Empty({
  title,
  sub,
  icon,
  tint = colors.pastelSage,
  action,
}: {
  title: string;
  sub?: string;
  icon?: string;
  tint?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.center}>
      <View style={styles.motif} pointerEvents="none">
        <OrganicLines color={colors.primary} opacity={0.06} />
      </View>
      {icon ? (
        <View style={[styles.chip, { backgroundColor: tint }]}>
          <Ionicons name={icon as any} size={30} color={colors.primary} />
        </View>
      ) : null}
      <AppText style={styles.title}>{title}</AppText>
      {sub ? <AppText style={styles.sub}>{sub}</AppText> : null}
      {action ? (
        <Pressable
          style={({ pressed: p }) => [styles.cta, p && pressed]}
          onPress={action.onPress}
          accessibilityRole="button"
        >
          <AppText style={styles.ctaTxt}>{action.label}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  motif: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  chip: {
    width: 76,
    height: 76,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  title: {
    fontFamily: font.displayBold,
    fontSize: type.h1,
    letterSpacing: -0.3,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: font.regular,
    fontSize: type.body,
    lineHeight: 22,
    color: colors.inkMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  cta: {
    marginTop: space.md,
    height: tap.min,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
});
