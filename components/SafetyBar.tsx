import { useState } from 'react';
import { View, Pressable, Share, Linking, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, space, radius, font, type, pressed } from '../theme/tokens';

// Master plan §6-2b safety rails: an SOS that dials 112 and a share link so
// family can watch the job. Shown only while someone is at or inside the door.
export default function SafetyBar({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation();
  const [armed, setArmed] = useState(false);

  const link = `https://services.app/j/${bookingId}`;

  async function share() {
    try {
      await Share.share({ message: t('safety.shareBody', { link }) });
    } catch {
      // user dismissed the sheet
    }
  }

  function sos() {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 4000);
      return;
    }
    Linking.openURL('tel:112');
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed: p }) => [styles.btn, styles.share, p && pressed]}
        onPress={share}
      >
        <Ionicons name="share-outline" size={16} color={colors.ink} />
        <AppText style={styles.shareTxt} numberOfLines={1}>
          {t('safety.share')}
        </AppText>
      </Pressable>

      <Pressable
        style={({ pressed: p }) => [styles.btn, styles.sos, armed && styles.sosArmed, p && pressed]}
        onPress={sos}
      >
        <Ionicons name="alert-circle" size={16} color={colors.onDark} />
        <AppText style={styles.sosTxt} numberOfLines={1}>
          {armed ? t('safety.sosConfirm') : t('safety.sos')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: space.sm },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
  },
  share: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  shareTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.ink },
  sos: { backgroundColor: colors.danger },
  sosArmed: { backgroundColor: '#8E2E1C' },
  sosTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.onDark },
});
