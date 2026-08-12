import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, font, type } from '../theme/tokens';

export default function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.center}>
        <Text style={styles.title}>{t(titleKey)}</Text>
        <Text style={styles.sub}>{t('common.comingSoon')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  title: { fontFamily: font.bold, fontSize: type.h2, color: colors.ink },
  sub: { fontFamily: font.regular, fontSize: type.body, color: colors.inkMuted },
});
