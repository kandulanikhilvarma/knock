import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import AppText from './AppText';
import { colors, space, radius, font, type, shadow } from '../theme/tokens';

// Three steps, drawn in the same monoline hand as the category art. This
// replaced a testimonial rail: quoting customers a pre-launch app has never
// served would be inventing proof.
const S = { stroke: colors.primary, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function Mark({ step }: { step: number }) {
  return (
    <Svg width={34} height={34} viewBox="0 0 34 34">
      {step === 0 && (
        <G {...S}>
          <Circle cx="15" cy="15" r="8" />
          <Path d="M21 21 L28 28" />
        </G>
      )}
      {step === 1 && (
        <G {...S}>
          <Rect x="7" y="7" width="20" height="20" rx="3" />
          <Path d="M12 12 h4 v4 h-4 z M18 12 h4 v4 h-4 z M12 18 h4 v4 h-4 z" />
          <Path d="M19 20 h3 v2" />
        </G>
      )}
      {step === 2 && (
        <G {...S}>
          <Path d="M7 12 h20 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 H7 a2 2 0 0 1 -2 -2 v-9 a2 2 0 0 1 2 -2 z" />
          <Path d="M5 17 h24" />
          <Path d="M9 22 h4" />
        </G>
      )}
    </Svg>
  );
}

const TINTS = [colors.pastelSage, colors.pastelBlue, colors.pastelPeach];

export default function HowItWorks() {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <AppText style={styles.title}>{t('how.title')}</AppText>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.chip, { backgroundColor: TINTS[i] }]}>
            <Mark step={i} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={styles.step}>{t(`how.s${i + 1}`)}</AppText>
            <AppText style={styles.sub}>{t(`how.s${i + 1}sub`)}</AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  title: { fontFamily: font.displayBold, fontSize: type.h1, color: colors.ink, marginBottom: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  chip: {
    width: 56,
    height: 56,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: { fontFamily: font.displayBold, fontSize: type.h2, color: colors.ink },
  sub: {
    fontFamily: font.regular,
    fontSize: type.small,
    lineHeight: 19,
    color: colors.inkMuted,
    marginTop: 2,
  },
});
