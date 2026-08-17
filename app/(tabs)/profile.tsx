import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
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
      <AppText style={styles.deleteTxt}>
        {m.isPending ? '…' : armed ? t('profileTab.deleteConfirm') : t('profileTab.delete')}
      </AppText>
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
      <Pressable style={styles.linkRow} onPress={() => router.push('/provider-setup')}>
        <View style={[styles.linkIcon, { backgroundColor: colors.pastelPeach }]}>
          <Ionicons name="briefcase-outline" size={18} color={colors.accent} />
        </View>
        <AppText style={styles.linkTxt}>{t('providerSetup.become')}</AppText>
        <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
      </Pressable>
    );
  }

  const current = q.data.availability_status as Availability;
  const verified = q.data.verify_tier === 'verified';
  return (
    <>
    <View style={styles.card}>
      <AppText style={styles.label}>{t('providerSetup.availability')}</AppText>
      <View style={styles.seg}>
        {STATES.map((s) => (
          <Pressable key={s} style={[styles.segBtn, current === s && styles.segOn]} disabled={m.isPending} onPress={() => m.mutate(s)}>
            <AppText style={[styles.segTxt, current === s && styles.segTxtOn]}>{t(`providerSetup.status_${s}`)}</AppText>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.editLink} onPress={() => router.push('/provider-setup')}>
        <AppText style={styles.editTxt}>{t('providerSetup.edit')}</AppText>
      </Pressable>
    </View>

    <Pressable style={styles.linkRow} onPress={() => router.push('/jobs/earnings')}>
      <View style={styles.linkIcon}>
        <Ionicons name="wallet-outline" size={18} color={colors.ink} />
      </View>
      <AppText style={styles.linkTxt}>{t('earnings.title')}</AppText>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>

    <Pressable style={styles.linkRow} onPress={() => router.push('/jobs/reviews')}>
      <View style={styles.linkIcon}>
        <Ionicons name="star-outline" size={18} color={colors.ink} />
      </View>
      <AppText style={styles.linkTxt}>{t('myReviews.title')}</AppText>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>

    {!verified && (
      <Pressable style={styles.linkRow} onPress={() => router.push('/verified')}>
        <View style={[styles.linkIcon, { backgroundColor: colors.tintSuccess }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.successInk} />
        </View>
        <AppText style={styles.linkTxt}>{t('verified.title')}</AppText>
        <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
      </Pressable>
    )}
    </>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, loading } = useSession();

  if (loading) return <Loading />;

  const user = session?.user;
  const isGuest = !!user?.is_anonymous;
  // Anonymous users come back with email/phone as empty strings, not null, so
  // ?? would happily hand back "" and render a blank name and avatar.
  const email = user?.email || null;
  const phone = user?.phone || null;
  const identity = email ?? phone ?? t('profileTab.guestName');
  const initial = identity.charAt(0).toUpperCase();
  const accountType = isGuest ? t('profileTab.typeGuest') : email ? t('profileTab.typeEmail') : t('profileTab.typePhone');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText style={styles.title}>{t('tabs.profile')}</AppText>

        {session ? (
          <View style={styles.idCard}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarTxt}>{initial}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.idName} numberOfLines={1}>{identity}</AppText>
              <View style={styles.typeChip}>
                <AppText style={styles.typeChipTxt}>{accountType}</AppText>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.idCard}>
            <View style={[styles.avatar, { backgroundColor: colors.line2 }]}>
              <Ionicons name="person-outline" size={22} color={colors.inkMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.idName}>{t('profileTab.guestName')}</AppText>
              <AppText style={styles.idSub}>{t('profileTab.signInSub')}</AppText>
            </View>
          </View>
        )}

        <View style={styles.row}>
          <AppText style={styles.label}>{t('profileTab.language')}</AppText>
          <LanguageSwitcher />
        </View>

        {session ? (
          <>
            <ProviderSection />
            <Pressable style={styles.linkRow} onPress={() => router.push('/jobs')}>
              <View style={styles.linkIcon}>
                <Ionicons name="albums-outline" size={18} color={colors.ink} />
              </View>
              <AppText style={styles.linkTxt}>{t('profileTab.myJobs')}</AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
            </Pressable>
            <Pressable style={styles.linkRow} onPress={() => router.push('/addresses')}>
              <View style={styles.linkIcon}>
                <Ionicons name="location-outline" size={18} color={colors.ink} />
              </View>
              <AppText style={styles.linkTxt}>{t('profileTab.addresses')}</AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
            </Pressable>
            <Pressable style={styles.signout} onPress={() => signOut()}>
              <AppText style={styles.signoutTxt}>{t('profileTab.signOut')}</AppText>
            </Pressable>
            <DeleteAccount />
          </>
        ) : (
          <Pressable style={styles.cta} onPress={() => router.push('/auth/email')}>
            <AppText style={styles.ctaTxt}>{t('profileTab.signIn')}</AppText>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },
  title: { fontFamily: font.displayBold, fontSize: type.display, color: colors.ink, paddingTop: space.sm },

  idCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.ink,
    borderRadius: radius.card,
    padding: space.lg,
  },
  avatar: { width: 52, height: 52, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: font.bold, fontSize: 22, color: colors.surface },
  idName: { fontFamily: font.displayBold, fontSize: type.h3, color: colors.onDark },
  idSub: { fontFamily: font.te, fontSize: type.small, color: colors.onDarkMuted, marginTop: 2 },
  typeChip: { alignSelf: 'flex-start', marginTop: 5, backgroundColor: 'rgba(255,255,255,0.10)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  typeChipTxt: { fontFamily: font.teBold, fontSize: 10, color: colors.gold, letterSpacing: 0.3 },

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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
  },
  linkIcon: { width: 34, height: 34, borderRadius: radius.chip, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  linkTxt: { flex: 1, fontFamily: font.teBold, fontSize: type.body, color: colors.ink },
  seg: { flexDirection: 'row', gap: space.xs, marginTop: space.xs },
  segBtn: { flex: 1, height: 40, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.success, borderColor: colors.success },
  segTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
  segTxtOn: { color: colors.surface },
  editLink: { marginTop: space.sm },
  editTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.accent },
  cta: {
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  signout: {
    height: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signoutTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.danger },
  delete: { height: tap.min, alignItems: 'center', justifyContent: 'center' },
  deleteTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.inkMuted },
});
