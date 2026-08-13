import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, font, radius, space, type, shadow } from '../theme/tokens';
import type { ProviderCard as Provider } from '../lib/queries';
import Avatar from './Avatar';

export default function ProviderCard({
  provider,
  onPress,
}: {
  provider: Provider;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const name = provider.profiles?.full_name ?? 'Provider';
  const stats = provider.provider_stats;
  const verified = provider.verify_tier === 'verified';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <Avatar name={name} photoUrl={provider.photo_url} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {verified && (
              <View style={styles.badge}>
                <Ionicons name="checkmark" size={11} color={colors.ink} />
                <Text style={styles.badgeTxt}>VERIFIED</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.rating}>★ {stats?.rating_avg?.toFixed(1) ?? '—'}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.meta}>{t('provider.jobsShort', { count: stats?.jobs_done ?? 0 })}</Text>
            {provider.years_exp ? (
              <>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.meta}>{t('provider.yearsShort', { count: provider.years_exp })}</Text>
              </>
            ) : null}
          </View>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagTxt}>{t('provider.speaksTelugu')}</Text>
            </View>
            {provider.visiting_charge != null && (
              <View style={styles.tag}>
                <Text style={styles.tagTxt}>{t('provider.visit', { amount: provider.visiting_charge })}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ₹0 minted coin — the signature, on every provider card */}
      <View style={styles.coinRow}>
        <View style={styles.coin}>
          <Text style={styles.coinTxt}>₹0</Text>
        </View>
        <Text style={styles.coinLabel}>{t('provider.coinLine')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.md,
    gap: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  top: { flexDirection: 'row', gap: space.md },
  info: { flex: 1, gap: 4, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: { flexShrink: 1, fontFamily: font.teBold, fontSize: type.h3, color: colors.ink },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.gold,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeTxt: { fontFamily: font.bold, fontSize: 9, color: colors.ink, letterSpacing: 0.4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rating: { fontFamily: font.bold, fontSize: type.small, color: colors.goldDeep },
  meta: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
  dot: { color: colors.line },
  tags: { flexDirection: 'row', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  tag: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  tagTxt: { fontFamily: font.te, fontSize: type.chip, color: colors.ink },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.chip,
    padding: space.sm,
  },
  coin: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinTxt: { fontFamily: font.bold, fontSize: 11, color: colors.gold },
  coinLabel: { flex: 1, fontFamily: font.te, fontSize: type.chip, color: colors.ink2, lineHeight: 15 },
});
