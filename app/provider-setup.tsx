import { useEffect, useState } from 'react';
import { errorMessage } from '../lib/errors';
import { View, Image, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import AppText from '../components/AppText';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, radius, font, type, tap, shadow } from './../theme/tokens';
import { getCategories, categoryName } from '../lib/queries';
import { getMyProviderProfile, saveProviderProfile } from '../lib/provider';
import { isValidUpi } from '../lib/validate';
import { pickImages, uploadGalleryPhotos, pickAvatar, uploadAvatar } from '../lib/photos';
import { useSession } from '../lib/session';
import { Loading } from '../components/StateView';
import VoiceRecorder from '../components/VoiceRecorder';

export default function ProviderSetup() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session, loading } = useSession();

  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const mine = useQuery({ queryKey: ['my-provider'], queryFn: getMyProviderProfile, enabled: !!session });
  const qc = useQueryClient();

  const [services, setServices] = useState<string[]>([]);
  const [upiId, setUpiId] = useState('');
  const [city, setCity] = useState('Vijayawada');
  const [charge, setCharge] = useState('');
  const [bio, setBio] = useState('');
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const p = mine.data;
    if (p) {
      setServices(p.services ?? []);
      setUpiId(p.upi_id ?? '');
      setCity(p.city ?? 'Vijayawada');
      setCharge(p.visiting_charge != null ? String(p.visiting_charge) : '');
      setBio(p.bio ?? '');
      setWorkPhotos(p.work_photos ?? []);
      setVoiceUrl(p.voice_intro_url ?? null);
      setPhotoUrl(p.photo_url ?? null);
    }
  }, [mine.data]);

  const pickFace = useMutation({
    mutationFn: async () => {
      const picked = await pickAvatar();
      return picked ? uploadAvatar(picked) : null;
    },
    onSuccess: (url) => url && setPhotoUrl(url),
  });

  // Pick → upload to the public gallery bucket → append the returned URLs.
  const pick = useMutation({
    mutationFn: async () => {
      const picked = await pickImages(6);
      return picked.length ? uploadGalleryPhotos(picked) : [];
    },
    onSuccess: (urls) => urls.length && setWorkPhotos((prev) => [...prev, ...urls].slice(0, 12)),
  });

  const save = useMutation({
    mutationFn: () =>
      saveProviderProfile({
        services,
        upiId: upiId.trim(),
        city: city.trim(),
        visitingCharge: charge ? parseInt(charge, 10) : null,
        bio: bio.trim(),
        photoUrl,
        workPhotos,
        voiceIntroUrl: voiceUrl,
      }),
    onSuccess: () => {
      // Profile (a mounted tab) and the provider lists would keep the old row.
      for (const key of ['my-provider', 'provider', 'providers', 'all-providers']) {
        qc.invalidateQueries({ queryKey: [key] });
      }
      router.back();
    },
  });

  if (loading || cats.isLoading) return <Loading />;

  const toggle = (slug: string) =>
    setServices((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  // The face is mandatory: customers open the door to this person. No photo, no listing.
  const valid = services.length > 0 && isValidUpi(upiId) && !!photoUrl;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: t('providerSetup.title') }} />

      <View style={styles.banner}>
        <View style={styles.coin}>
          <AppText style={styles.coinTxt}>₹0</AppText>
        </View>
        <AppText style={styles.bannerTxt}>{t('providerSetup.lead')}</AppText>
      </View>

      {/* The face comes first — it's what a customer judges before opening a door. */}
      <View style={styles.faceCard}>
        <Pressable
          style={styles.faceWrap}
          disabled={pickFace.isPending}
          onPress={() => pickFace.mutate()}
          accessibilityRole="button"
          accessibilityLabel={t('providerSetup.photoCta')}
        >
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.face} />
          ) : (
            <View style={[styles.face, styles.faceEmpty]}>
              <Ionicons name="person-outline" size={30} color={colors.primary} />
            </View>
          )}
          <View style={styles.faceBadge}>
            <Ionicons name={photoUrl ? 'checkmark' : 'camera'} size={13} color={colors.onDark} />
          </View>
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText style={styles.faceTitle}>
            {t('providerSetup.photoTitle')} <AppText style={styles.req}>*</AppText>
          </AppText>
          <AppText style={styles.faceSub}>
            {pickFace.isPending ? t('providerSetup.uploading') : t('providerSetup.photoSub')}
          </AppText>
        </View>
      </View>
      {pickFace.isError && <AppText style={styles.err}>{errorMessage(pickFace.error, t)}</AppText>}

      <AppText style={styles.label}>{t('providerSetup.services')}</AppText>
      <View style={styles.chips}>
        {(cats.data ?? []).map((c) => {
          const on = services.includes(c.slug);
          return (
            <Pressable
              key={c.id}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => toggle(c.slug)}
              accessibilityRole="checkbox"
              aria-checked={on}
            >
              <AppText style={[styles.chipTxt, on && styles.chipTxtOn]}>{categoryName(c, i18n.language)}</AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText style={styles.label}>{t('providerSetup.upi')}</AppText>
      <TextInput style={styles.input} accessibilityLabel={t('providerSetup.upi')} value={upiId} onChangeText={setUpiId} maxLength={320} placeholder="name@bank" placeholderTextColor={colors.inkMuted} autoCapitalize="none" />

      <AppText style={styles.label}>{t('providerSetup.city')}</AppText>
      <TextInput style={styles.input} accessibilityLabel={t('providerSetup.city')} value={city} onChangeText={setCity} maxLength={60} placeholderTextColor={colors.inkMuted} />

      <AppText style={styles.label}>{t('providerSetup.charge')}</AppText>
      <TextInput style={styles.input} accessibilityLabel={t('providerSetup.charge')} value={charge} onChangeText={setCharge} keyboardType="number-pad" placeholder="₹" placeholderTextColor={colors.inkMuted} />

      <AppText style={styles.label}>{t('providerSetup.bio')}</AppText>
      <TextInput style={[styles.input, styles.multi]} accessibilityLabel={t('providerSetup.bio')} value={bio} onChangeText={setBio} maxLength={1000} multiline placeholderTextColor={colors.inkMuted} />

      <AppText style={styles.label}>{t('providerSetup.gallery')}</AppText>
      <View style={styles.photoRow}>
        {workPhotos.map((u, i) => (
          <View key={u} style={styles.thumbWrap}>
            <Image source={{ uri: u }} style={styles.thumb} />
            <Pressable style={styles.thumbX} hitSlop={14} accessibilityRole="button" accessibilityLabel={t('a11y.removePhoto')} onPress={() => setWorkPhotos((prev) => prev.filter((_, j) => j !== i))}>
              <Ionicons name="close" size={12} color={colors.onDark} />
            </Pressable>
          </View>
        ))}
        {workPhotos.length < 12 && (
          <Pressable style={styles.addPhoto} disabled={pick.isPending} onPress={() => pick.mutate()}>
            <Ionicons name="camera-outline" size={22} color={colors.primary} />
            <AppText style={styles.addPhotoTxt}>{pick.isPending ? '…' : t('providerSetup.addPhoto')}</AppText>
          </Pressable>
        )}
      </View>
      {pick.isError && <AppText style={styles.err}>{errorMessage(pick.error, t)}</AppText>}

      <AppText style={styles.label}>{t('providerSetup.voiceIntro')}</AppText>
      <VoiceRecorder value={voiceUrl} onChange={setVoiceUrl} />

      <Pressable style={[styles.cta, (!valid || save.isPending) && styles.ctaOff]} disabled={!valid || save.isPending} onPress={() => save.mutate()}>
        <AppText style={styles.ctaTxt}>{save.isPending ? t('providerSetup.saving') : t('providerSetup.save')}</AppText>
      </Pressable>
      {save.isError && <AppText style={styles.err}>{errorMessage(save.error, t)}</AppText>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.sm },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    backgroundColor: colors.ink, borderRadius: radius.card, padding: space.lg, marginBottom: space.sm,
  },
  coin: {
    width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.ink,
    borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  coinTxt: { fontFamily: font.bold, fontSize: 14, color: colors.gold },
  bannerTxt: { flex: 1, fontFamily: font.te, fontSize: type.small, color: colors.onDark, lineHeight: 19 },
  label: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, marginTop: space.sm },

  faceCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.lg,
    backgroundColor: colors.surface, borderRadius: radius.card, padding: space.lg,
    ...shadow.soft,
  },
  faceWrap: { position: 'relative' },
  face: { width: 76, height: 76, borderRadius: radius.pill, backgroundColor: colors.line2 },
  faceEmpty: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.tintSuccess, borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed',
  },
  faceBadge: {
    position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  faceTitle: { fontFamily: font.displayBold, fontSize: type.h3, color: colors.ink },
  req: { color: colors.danger },
  faceSub: { fontFamily: font.te, fontSize: type.small, lineHeight: 18, color: colors.inkMuted, marginTop: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, paddingVertical: space.xs, paddingHorizontal: space.md, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipTxt: { fontFamily: font.te, fontSize: type.small, color: colors.ink },
  chipTxtOn: { color: colors.onDark },
  input: {
    minHeight: tap.min, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface,
    paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.te, fontSize: type.body, color: colors.ink,
  },
  multi: { minHeight: 80, textAlignVertical: 'top' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: 2 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 72, height: 72, borderRadius: radius.chip, backgroundColor: colors.line2 },
  thumbX: {
    position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center',
  },
  addPhoto: {
    width: 72, height: 72, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.line,
    borderStyle: 'dashed', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  addPhotoTxt: { fontFamily: font.medium, fontSize: type.chip, color: colors.primary },
  cta: { height: tap.min, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: space.lg },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  err: { fontFamily: font.te, fontSize: type.small, color: colors.danger },
});
