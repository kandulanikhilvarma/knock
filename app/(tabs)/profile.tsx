import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { useState } from 'react';
import { useSession } from '../../lib/session';
import { signOut, deleteAccount } from '../../lib/auth';
import { getMyProviderProfile, setAvailability, type Availability } from '../../lib/provider';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Loading } from '../../components/StateView';

const STATES: Availability[] = ['available', 'busy', 'paused'];

function DeleteAccount() {
  const { t } = useTranslation();
  const [armed, setArmed] = useState(false);
  const m = useMutation({ mutationFn: deleteAccount });
  return (
    <Pressable
      style={styles.delete}
      disabled={m.isPending}
      onPress={() => (armed ? m.mutate() : setArmed(true))}
    >
      <Text style={styles.deleteTxt}>
        {m.isPending ? '…' : armed ? t('profileTab.deleteConfirm') : t('profileTab.delete')}
      </Text>
    </Pressable>
  );
}

function ProviderSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const q = useQuery({ queryKey: ['my-provider'], queryFn: getMyProviderProfile });
  const m = useMutation({ mutationFn: (s: Availability) => setAvailability(s), onSuccess: () => q.refetch() });

  if (q.isLoading) return null;

  // not a provider yet → invite
  if (!q.data) {
    return (
      <Pressable style={styles.link} onPress={() => router.push('/provider-setup')}>
        <Text style={styles.linkTxt}>{t('providerSetup.become')}</Text>
      </Pressable>
    );
  }

  const current = q.data.availability_status as Availability;
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('providerSetup.availability')}</Text>
      <View style={styles.seg}>
        {STATES.map((s) => (
          <Pressable key={s} style={[styles.segBtn, current === s && styles.segOn]} disabled={m.isPending} onPress={() => m.mutate(s)}>
            <Text style={[styles.segTxt, current === s && styles.segTxtOn]}>{t(`providerSetup.status_${s}`)}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.editLink} onPress={() => router.push('/provider-setup')}>
        <Text style={styles.editTxt}>{t('providerSetup.edit')}</Text>
      </Pressable>
    </View>
  );
}

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
            <ProviderSection />
            <Pressable style={styles.link} onPress={() => router.push('/jobs')}>
              <Text style={styles.linkTxt}>{t('profileTab.myJobs')}</Text>
            </Pressable>
            <Pressable style={styles.signout} onPress={() => signOut()}>
              <Text style={styles.signoutTxt}>{t('profileTab.signOut')}</Text>
            </Pressable>
            <DeleteAccount />
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
  seg: { flexDirection: 'row', gap: space.xs, marginTop: space.xs },
  segBtn: { flex: 1, height: 40, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.success, borderColor: colors.success },
  segTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
  segTxtOn: { color: colors.surface },
  editLink: { marginTop: space.sm },
  editTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.accent },
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
  delete: { height: tap.min, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
  deleteTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.danger },
});
