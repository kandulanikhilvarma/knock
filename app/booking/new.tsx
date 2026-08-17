import { useState } from 'react';
import { View, Image, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { getCategories, categoryName } from '../../lib/queries';
import { createBooking } from '../../lib/bookings';
import { getSavedAddresses } from '../../lib/addresses';
import { pickImages, uploadPhotos, type PickedPhoto } from '../../lib/photos';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../lib/session';
import CategoryArt from '../../components/CategoryArt';
import { categoryTint } from '../../lib/categoryTint';
import { Loading } from '../../components/StateView';

// §4: AC/appliance splits into these at booking time — the pro needs to know
// which machine before they arrive. Prepended to the description.
const APPLIANCES = ['ac', 'fridge', 'washing', 'tv', 'geyser', 'ro'] as const;

export default function NewBookingScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session, loading } = useSession();

  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const category = (cats.data ?? []).find((c) => c.slug === slug);
  const title = category ? categoryName(category, i18n.language) : '';

  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [appliance, setAppliance] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);

  const isAppliance = slug === 'ac_appliance';
  const saved = useQuery({ queryKey: ['addresses'], queryFn: getSavedAddresses, enabled: !!session });
  const pick = useMutation({
    mutationFn: () => pickImages(5),
    onSuccess: (p) => p.length && setPhotos((prev) => [...prev, ...p].slice(0, 5)),
  });

  const m = useMutation({
    mutationFn: async () => {
      const desc = appliance ? `${t(`booking.appl_${appliance}`)}: ${description.trim()}` : description.trim();
      const id = await createBooking({
        categoryId: category?.id ?? null,
        categorySlug: slug ?? '',
        description: desc,
        address: address.trim(),
      });
      // Upload after the booking exists so photos live under this booking's folder.
      if (photos.length) {
        const paths = await uploadPhotos(id, photos);
        await supabase.from('bookings').update({ photos: paths }).eq('id', id);
      }
      return id;
    },
    onSuccess: (id) => router.replace({ pathname: '/booking/[id]', params: { id } }),
  });

  if (loading || cats.isLoading) return <Loading />;

  if (!session) {
    return (
      <View style={styles.gate}>
        <Stack.Screen options={{ title }} />
        <View style={styles.gateIcon}>
          <Ionicons name="lock-closed-outline" size={26} color={colors.inkMuted} />
        </View>
        <AppText style={styles.gateTitle}>{t('booking.signInFirst')}</AppText>
        <AppText style={styles.gateSub}>{t('bookingsTab.signInSub')}</AppText>
        <Pressable style={styles.gateCta} onPress={() => router.push('/auth/email')}>
          <AppText style={styles.ctaTxt}>{t('booking.signInCta')}</AppText>
        </Pressable>
      </View>
    );
  }

  const valid = address.trim().length > 3;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: t('booking.newTitle') }} />

      {slug ? (
        <View style={styles.hero}>
          <CategoryArt slug={slug} size={44} bg={categoryTint(slug)} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.heroLbl}>{t('booking.newTitle')}</AppText>
            <AppText style={styles.heroTitle}>{title}</AppText>
          </View>
        </View>
      ) : (
        <AppText style={styles.cat}>{title}</AppText>
      )}

      {isAppliance && (
        <>
          <AppText style={styles.label}>{t('booking.applianceLabel')}</AppText>
          <View style={styles.chips}>
            {APPLIANCES.map((a) => {
              const on = appliance === a;
              return (
                <Pressable
                  key={a}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => setAppliance(on ? null : a)}
                >
                  <AppText style={[styles.chipTxt, on && styles.chipTxtOn]}>{t(`booking.appl_${a}`)}</AppText>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <AppText style={styles.label}>{t('booking.descLabel')}</AppText>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder={t('booking.descPlaceholder')}
        placeholderTextColor={colors.inkMuted}
        multiline
      />

      <View style={styles.photoRow}>
        {photos.map((p, i) => (
          <View key={p.uri} style={styles.thumbWrap}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <Pressable style={styles.thumbX} hitSlop={6} onPress={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}>
              <Ionicons name="close" size={12} color={colors.onDark} />
            </Pressable>
          </View>
        ))}
        {photos.length < 5 && (
          <Pressable style={styles.addPhoto} disabled={pick.isPending} onPress={() => pick.mutate()}>
            <Ionicons name="camera-outline" size={22} color={colors.primary} />
            <AppText style={styles.addPhotoTxt}>{pick.isPending ? '…' : t('booking.addPhotos')}</AppText>
          </Pressable>
        )}
      </View>
      {pick.isError && <AppText style={styles.err}>{(pick.error as Error).message}</AppText>}

      <AppText style={styles.label}>{t('booking.addressLabel')}</AppText>
      {(saved.data?.length ?? 0) > 0 && (
        <View style={styles.chips}>
          {saved.data!.map((a) => (
            <Pressable key={a.id} style={styles.savedChip} onPress={() => setAddress(a.line)}>
              <Ionicons name="location" size={13} color={colors.primary} />
              <AppText style={styles.savedChipTxt}>{a.label}</AppText>
            </Pressable>
          ))}
        </View>
      )}
      <TextInput
        style={[styles.input, styles.multiline]}
        value={address}
        onChangeText={setAddress}
        placeholder={t('booking.addressPlaceholder')}
        placeholderTextColor={colors.inkMuted}
        multiline
      />

      <View style={styles.coinRow}>
        <View style={styles.coin}>
          <AppText style={styles.coinTxt}>₹0</AppText>
        </View>
        <AppText style={styles.coinNote}>{t('booking.zeroNote')}</AppText>
      </View>

      <Pressable
        style={[styles.cta, (!valid || m.isPending) && styles.ctaOff]}
        disabled={!valid || m.isPending}
        onPress={() => m.mutate()}
      >
        <AppText style={styles.ctaTxt}>{m.isPending ? t('booking.submitting') : t('booking.submit')}</AppText>
      </Pressable>
      {m.isError && <AppText style={styles.err}>{(m.error as Error).message}</AppText>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.sm },
  gate: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  gateIcon: { width: 56, height: 56, borderRadius: radius.pill, backgroundColor: colors.line2, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  gateTitle: { fontFamily: font.teBold, fontSize: type.h3, color: colors.ink, textAlign: 'center' },
  gateSub: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },
  gateCta: { marginTop: space.md, height: tap.min, paddingHorizontal: space.xl, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    backgroundColor: colors.ink, borderRadius: radius.card, padding: space.lg, marginBottom: space.sm,
  },
  heroLbl: { fontFamily: font.te, fontSize: type.chip, color: colors.onDarkMuted, letterSpacing: 0.3 },
  heroTitle: { fontFamily: font.displayBold, fontSize: type.h1, color: colors.onDark, marginTop: 2 },
  cat: { fontFamily: font.displayBold, fontSize: type.h1, color: colors.ink, marginBottom: space.sm },
  label: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, marginTop: space.sm },
  input: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: space.md,
    fontFamily: font.te,
    fontSize: type.body,
    color: colors.ink,
  },
  multiline: { minHeight: 84, textAlignVertical: 'top' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: 2 },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.ink },
  chipTxtOn: { color: colors.onDark },
  savedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.tintSuccess,
  },
  savedChipTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.successInk },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.ink,
    borderRadius: radius.card,
    padding: space.md,
    marginTop: space.md,
  },
  coin: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinTxt: { fontFamily: font.bold, fontSize: 13, color: colors.gold },
  coinNote: { flex: 1, fontFamily: font.te, fontSize: type.small, color: colors.onDarkMuted, lineHeight: 18 },
  cta: {
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.lg,
  },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.surface },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger, marginTop: space.sm },
});
