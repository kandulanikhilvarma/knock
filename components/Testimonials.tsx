import { View, ScrollView, StyleSheet } from 'react-native';
import AppText from './AppText';
import { useTranslation } from 'react-i18next';
import { colors, space, radius, font, type, shadow } from '../theme/tokens';

// Real-people social proof on Home. Named Vijayawada locals + a short quote and
// rating — the trust cue right before someone books. Quotes are localised; the
// names/areas are proper nouns, stable across languages. Avatar = pastel initial
// (no stock face photography — keeps it honest).
const PEOPLE = [
  { key: 'tq1', name: 'Lakshmi P.', area: 'Benz Circle', tint: colors.pastelPink },
  { key: 'tq2', name: 'Ramesh K.', area: 'Governorpet', tint: colors.pastelBlue },
  { key: 'tq3', name: 'Anitha R.', area: 'Auto Nagar', tint: colors.pastelPeach },
];

export default function Testimonials() {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <AppText style={styles.title}>{t('home.lovedTitle')}</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
        snapToInterval={280}
      >
        {PEOPLE.map((p) => (
          <View key={p.key} style={styles.card}>
            <AppText style={styles.stars}>★★★★★</AppText>
            <AppText style={styles.quote}>{t(`home.${p.key}`)}</AppText>
            <View style={styles.who}>
              <View style={[styles.avatar, { backgroundColor: p.tint }]}>
                <AppText style={styles.avatarTxt}>{p.name.charAt(0)}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.name}>{p.name}</AppText>
                <AppText style={styles.area}>{p.area}</AppText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  title: { fontFamily: font.displayBold, fontSize: type.h1, color: colors.ink },
  row: { gap: space.md, paddingRight: space.lg },
  card: {
    width: 264,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    gap: space.sm,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  stars: { fontFamily: font.regular, fontSize: type.small, color: colors.gold, letterSpacing: 1 },
  quote: { fontFamily: font.regular, fontSize: type.body, color: colors.ink2, lineHeight: 22 },
  who: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  avatar: { width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: font.displayBold, fontSize: type.body, color: colors.ink },
  name: { fontFamily: font.semibold, fontSize: type.small, color: colors.ink },
  area: { fontFamily: font.regular, fontSize: type.chip, color: colors.inkMuted },
});
