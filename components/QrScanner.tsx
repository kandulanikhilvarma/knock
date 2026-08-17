import { useState } from 'react';
import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import { colors, space, radius, font, type, tap } from '../theme/tokens';

// Full-screen QR reader. Fires onScan once with the decoded string, then closes.
export default function QrScanner({
  visible,
  onClose,
  onScan,
}: {
  visible: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}) {
  const { t } = useTranslation();
  const [perm, requestPerm] = useCameraPermissions();
  const [handled, setHandled] = useState(false);

  const handle = (value: string) => {
    if (handled) return;
    setHandled(true);
    onScan(value);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} onShow={() => setHandled(false)}>
      <View style={styles.root}>
        {perm?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handled ? undefined : (r) => handle(r.data)}
          />
        ) : (
          <View style={styles.perm}>
            <Ionicons name="camera-outline" size={30} color={colors.onDark} />
            <AppText style={styles.permTitle}>{t('scan.permTitle')}</AppText>
            <AppText style={styles.permSub}>{t('scan.permSub')}</AppText>
            <Pressable style={styles.allow} onPress={() => requestPerm()}>
              <AppText style={styles.allowTxt}>{t('scan.allow')}</AppText>
            </Pressable>
          </View>
        )}

        {perm?.granted && (
          <SafeAreaView style={styles.overlay} pointerEvents="box-none">
            <View style={styles.frame} />
            <AppText style={styles.hint}>{t('scan.hint')}</AppText>
          </SafeAreaView>
        )}

        <SafeAreaView style={styles.closeWrap} pointerEvents="box-none">
          <Pressable
            style={styles.close}
            hitSlop={10}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.close')}
          >
            <Ionicons name="close" size={22} color={colors.onDark} />
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  perm: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  permTitle: { fontFamily: font.displayBold, fontSize: type.h2, color: colors.onDark },
  permSub: { fontFamily: font.regular, fontSize: type.small, color: colors.onDarkMuted, textAlign: 'center' },
  allow: {
    marginTop: space.md, height: tap.min, paddingHorizontal: space.xl, borderRadius: radius.pill,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  allowTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  frame: { width: 240, height: 240, borderRadius: radius.card, borderWidth: 3, borderColor: colors.onDark },
  hint: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark, textAlign: 'center' },
  closeWrap: { position: 'absolute', top: 0, right: 0 },
  close: {
    margin: space.lg, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
});
