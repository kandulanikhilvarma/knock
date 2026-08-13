import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, font } from '../theme/tokens';

// Maps a booking status to a coloured pill. `on`/`in_progress`/`verified`/`done`
// read as proof (green); `finding_pro` is the one live action (saffron); dead
// ends (failed/cancelled) go muted/red. Keys live under booking.state.* .
const META: Record<string, { fg: string; bg: string }> = {
  requested: { fg: colors.inkMuted, bg: colors.line2 },
  finding_pro: { fg: colors.accent, bg: 'rgba(255,122,26,0.12)' },
  assigned: { fg: colors.ink, bg: colors.line2 },
  verified: { fg: colors.successInk, bg: 'rgba(18,161,80,0.12)' },
  in_progress: { fg: colors.successInk, bg: 'rgba(18,161,80,0.12)' },
  done: { fg: colors.successInk, bg: 'rgba(18,161,80,0.12)' },
  cancelled: { fg: colors.inkMuted, bg: colors.line2 },
  failed: { fg: colors.danger, bg: 'rgba(214,69,69,0.10)' },
};

export default function StatusPill({ status }: { status: string }) {
  const { t } = useTranslation();
  const m = META[status] ?? META.requested;
  return (
    <View style={[styles.pill, { backgroundColor: m.bg }]}>
      <Text style={[styles.txt, { color: m.fg }]}>{t(`booking.state.${status}`, status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  txt: { fontFamily: font.teBold, fontSize: 11, letterSpacing: 0.2 },
});
