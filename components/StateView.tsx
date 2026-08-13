import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AppText from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, space, type } from '../theme/tokens';

// Shared loading / error / empty states — every list screen ships all three (GATE 4→5).
export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <View style={styles.center}>
      <AppText style={styles.title}>Something went wrong</AppText>
      {message ? <AppText style={styles.sub}>{message}</AppText> : null}
    </View>
  );
}

export function Empty({ title, sub, icon }: { title: string; sub?: string; icon?: string }) {
  return (
    <View style={styles.center}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon as any} size={26} color={colors.inkMuted} />
        </View>
      ) : null}
      <AppText style={styles.title}>{title}</AppText>
      {sub ? <AppText style={styles.sub}>{sub}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.xs },
  iconWrap: { width: 56, height: 56, borderRadius: radius.pill, backgroundColor: colors.line2, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  title: { fontFamily: font.semibold, fontSize: type.h3, color: colors.ink, textAlign: 'center' },
  sub: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },
});
