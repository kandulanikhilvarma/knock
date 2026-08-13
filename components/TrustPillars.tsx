import { View, Text, StyleSheet } from 'react-native';
import AppText from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, space, radius, font, type, shadow } from '../theme/tokens';

// The four promises that make this app trustworthy — surfaced on Home so a
// first-time visitor sees them before booking. Icons + short lines, ink card.
const PILLARS: { icon: string; color: string; key: string }[] = [
  { icon: 'shield-checkmark', color: colors.success, key: 'idChecked' },
  { icon: 'qr-code', color: colors.accent, key: 'qrDoor' },
  { icon: 'cash-outline', color: colors.gold, key: 'directPay' },
  { icon: 'ribbon-outline', color: colors.onDark, key: 'zeroComm' },
];

export default function TrustPillars() {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <AppText style={styles.title}>{t('trust.title')}</AppText>
      <View style={styles.grid}>
        {PILLARS.map((p) => (
          <View key={p.key} style={styles.pillar}>
            <View style={styles.iconWrap}>
              <Ionicons name={p.icon as any} size={18} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.pTitle}>{t(`trust.${p.key}`)}</AppText>
              <AppText style={styles.pSub}>{t(`trust.${p.key}Sub`)}</AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: space.lg, gap: space.md, ...shadow.card },
  title: { fontFamily: font.teBold, fontSize: type.h3, color: colors.ink },
  grid: { gap: space.md },
  pillar: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  iconWrap: { width: 38, height: 38, borderRadius: radius.chip, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  pTitle: { fontFamily: font.teBold, fontSize: type.small, color: colors.ink, lineHeight: 18 },
  pSub: { fontFamily: font.te, fontSize: type.chip, color: colors.inkMuted, lineHeight: 15, marginTop: 1 },
});
