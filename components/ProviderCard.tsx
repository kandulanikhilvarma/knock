import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, space, type } from '../theme/tokens';
import type { ProviderCard as Provider } from '../lib/queries';
import Avatar from './Avatar';

export default function ProviderCard({
  provider,
  onPress,
}: {
  provider: Provider;
  onPress?: () => void;
}) {
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
                <Ionicons name="shield-checkmark" size={12} color={colors.surface} />
                <Text style={styles.badgeTxt}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={13} color={colors.accent} />
            <Text style={styles.meta}>{stats?.rating_avg?.toFixed(1) ?? '—'}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.meta}>{stats?.jobs_done ?? 0} jobs</Text>
            {provider.years_exp ? (
              <>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.meta}>{provider.years_exp}y exp</Text>
              </>
            ) : null}
          </View>
          {provider.visiting_charge != null && (
            <View style={styles.chip}>
              <Text style={styles.chipTxt}>Visit ₹{provider.visiting_charge}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ₹0-commission ribbon — §5 signature, on every provider card */}
      <View style={styles.ribbon}>
        <Text style={styles.ribbonTxt}>₹0 commission · keeps 100%</Text>
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
  },
  top: { flexDirection: 'row', gap: space.md },
  info: { flex: 1, gap: 4, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: { flexShrink: 1, fontFamily: font.bold, fontSize: type.h3, color: colors.ink },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.success,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.surface },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
  dot: { color: colors.line, fontSize: type.small },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 2,
    backgroundColor: colors.bg,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  chipTxt: { fontFamily: font.medium, fontSize: type.chip, color: colors.ink },
  ribbon: {
    backgroundColor: '#EAF2FB',
    borderRadius: 8,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  ribbonTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.primary },
});
