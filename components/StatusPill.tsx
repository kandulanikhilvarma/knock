import { View, Text, StyleSheet } from 'react-native';
import AppText from './AppText';
import { useTranslation } from 'react-i18next';
import { colors, radius, font } from '../theme/tokens';

// Maps a booking status to a coloured pill. `on`/`in_progress`/`verified`/`done`
// read as proof (green); `finding_pro` is the one live action (saffron); dead
// ends (failed/cancelled) go muted/red. Keys live under booking.state.* .
const META: Record<string, { fg: string; bg: string }> = {
  requested: { fg: colors.inkMuted, bg: colors.line2 },
  finding_pro: { fg: colors.goldDeep, bg: colors.tintGold },
  assigned: { fg: colors.ink, bg: colors.line2 },
  verified: { fg: colors.successInk, bg: colors.tintSuccess },
  in_progress: { fg: colors.successInk, bg: colors.tintSuccess },
  done: { fg: colors.successInk, bg: colors.tintSuccess },
  cancelled: { fg: colors.inkMuted, bg: colors.line2 },
  failed: { fg: colors.danger, bg: colors.line2 },
};

export default function StatusPill({ status }: { status: string }) {
  const { t } = useTranslation();
  const m = META[status] ?? META.requested;
  return (
    <View style={[styles.pill, { backgroundColor: m.bg }]}>
      <AppText style={[styles.txt, { color: m.fg }]}>{t(`booking.state.${status}`, status)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  txt: { fontFamily: font.teBold, fontSize: 11, letterSpacing: 0.2 },
});
