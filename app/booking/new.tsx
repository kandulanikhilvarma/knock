import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { getCategories, categoryName } from '../../lib/queries';
import { createBooking } from '../../lib/bookings';
import { useSession } from '../../lib/session';
import CategoryImage from '../../components/CategoryImage';
import { Loading } from '../../components/StateView';

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

  const m = useMutation({
    mutationFn: () =>
      createBooking({
        categoryId: category?.id ?? null,
        categorySlug: slug ?? '',
        description: description.trim(),
        address: address.trim(),
      }),
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
        <Text style={styles.gateTitle}>{t('booking.signInFirst')}</Text>
        <Text style={styles.gateSub}>{t('bookingsTab.signInSub')}</Text>
        <Pressable style={styles.gateCta} onPress={() => router.push('/auth/email')}>
          <Text style={styles.ctaTxt}>{t('booking.signInCta')}</Text>
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
          <CategoryImage slug={slug} icon={category?.icon} width={800} style={styles.heroImg} />
          <Text style={styles.heroTitle}>{title}</Text>
        </View>
      ) : (
        <Text style={styles.cat}>{title}</Text>
      )}

      <Text style={styles.label}>{t('booking.descLabel')}</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder={t('booking.descPlaceholder')}
        placeholderTextColor={colors.inkMuted}
        multiline
      />

      <Text style={styles.label}>{t('booking.addressLabel')}</Text>
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
          <Text style={styles.coinTxt}>₹0</Text>
        </View>
        <Text style={styles.coinNote}>{t('booking.zeroNote')}</Text>
      </View>

      <Pressable
        style={[styles.cta, (!valid || m.isPending) && styles.ctaOff]}
        disabled={!valid || m.isPending}
        onPress={() => m.mutate()}
      >
        <Text style={styles.ctaTxt}>{m.isPending ? t('booking.submitting') : t('booking.submit')}</Text>
      </Pressable>
      {m.isError && <Text style={styles.err}>{(m.error as Error).message}</Text>}
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
  gateCta: { marginTop: space.md, height: tap.min, paddingHorizontal: space.xl, borderRadius: radius.card, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 150, borderRadius: radius.card, overflow: 'hidden', justifyContent: 'flex-end', padding: space.lg, marginBottom: space.sm },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroTitle: { fontFamily: font.teBold, fontSize: type.h1, color: colors.surface },
  cat: { fontFamily: font.teBold, fontSize: type.h2, color: colors.ink, marginBottom: space.sm },
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
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.lg,
  },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.surface },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger, marginTop: space.sm },
});
