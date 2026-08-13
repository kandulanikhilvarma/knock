import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { useSession } from '../../lib/session';
import { signOut } from '../../lib/auth';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Loading } from '../../components/StateView';

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, loading } = useSession();

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.body}>
        <Text style={styles.title}>{t('tabs.profile')}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>{t('profileTab.language')}</Text>
          <LanguageSwitcher />
        </View>

        {session ? (
          <>
            <View style={styles.card}>
              <Text style={styles.label}>{t('profileTab.phone')}</Text>
              <Text style={styles.value}>{session.user.phone ?? '—'}</Text>
            </View>
            <Pressable style={styles.link} onPress={() => router.push('/jobs')}>
              <Text style={styles.linkTxt}>{t('profileTab.myJobs')}</Text>
            </Pressable>
            <Pressable style={styles.signout} onPress={() => signOut()}>
              <Text style={styles.signoutTxt}>{t('profileTab.signOut')}</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.cta} onPress={() => router.push('/auth/email')}>
            <Text style={styles.ctaTxt}>{t('profileTab.signIn')}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: space.lg, gap: space.lg },
  title: { fontFamily: font.bold, fontSize: type.h1, color: colors.ink, paddingTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    gap: space.xs,
  },
  value: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink },
  link: {
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink },
  cta: {
    height: tap.min,
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { fontFamily: font.bold, fontSize: type.body, color: colors.surface },
  signout: {
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signoutTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.danger },
});
