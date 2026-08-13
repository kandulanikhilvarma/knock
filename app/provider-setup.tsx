import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import AppText from '../components/AppText';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors, space, radius, font, type, tap } from './../theme/tokens';
import { getCategories, categoryName } from '../lib/queries';
import { getMyProviderProfile, saveProviderProfile } from '../lib/provider';
import { useSession } from '../lib/session';
import { Loading } from '../components/StateView';

export default function ProviderSetup() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { session, loading } = useSession();

  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const mine = useQuery({ queryKey: ['my-provider'], queryFn: getMyProviderProfile, enabled: !!session });

  const [services, setServices] = useState<string[]>([]);
  const [upiId, setUpiId] = useState('');
  const [city, setCity] = useState('Vijayawada');
  const [charge, setCharge] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const p = mine.data;
    if (p) {
      setServices(p.services ?? []);
      setUpiId(p.upi_id ?? '');
      setCity(p.city ?? 'Vijayawada');
      setCharge(p.visiting_charge != null ? String(p.visiting_charge) : '');
      setBio(p.bio ?? '');
    }
  }, [mine.data]);

  const save = useMutation({
    mutationFn: () =>
      saveProviderProfile({
        services,
        upiId: upiId.trim(),
        city: city.trim(),
        visitingCharge: charge ? parseInt(charge, 10) : null,
        bio: bio.trim(),
      }),
    onSuccess: () => router.back(),
  });

  if (loading || cats.isLoading) return <Loading />;

  const toggle = (slug: string) =>
    setServices((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  const valid = services.length > 0 && upiId.includes('@');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: t('providerSetup.title') }} />

      <View style={styles.banner}>
        <View style={styles.coin}>
          <AppText style={styles.coinTxt}>₹0</AppText>
        </View>
        <AppText style={styles.bannerTxt}>{t('providerSetup.lead')}</AppText>
      </View>

      <AppText style={styles.label}>{t('providerSetup.services')}</AppText>
      <View style={styles.chips}>
        {(cats.data ?? []).map((c) => {
          const on = services.includes(c.slug);
          return (
            <Pressable key={c.id} style={[styles.chip, on && styles.chipOn]} onPress={() => toggle(c.slug)}>
              <AppText style={[styles.chipTxt, on && styles.chipTxtOn]}>{categoryName(c, i18n.language)}</AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText style={styles.label}>{t('providerSetup.upi')}</AppText>
      <TextInput style={styles.input} value={upiId} onChangeText={setUpiId} placeholder="name@bank" placeholderTextColor={colors.inkMuted} autoCapitalize="none" />

      <AppText style={styles.label}>{t('providerSetup.city')}</AppText>
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholderTextColor={colors.inkMuted} />

      <AppText style={styles.label}>{t('providerSetup.charge')}</AppText>
      <TextInput style={styles.input} value={charge} onChangeText={setCharge} keyboardType="number-pad" placeholder="₹" placeholderTextColor={colors.inkMuted} />

      <AppText style={styles.label}>{t('providerSetup.bio')}</AppText>
      <TextInput style={[styles.input, styles.multi]} value={bio} onChangeText={setBio} multiline placeholderTextColor={colors.inkMuted} />

      <Pressable style={[styles.cta, (!valid || save.isPending) && styles.ctaOff]} disabled={!valid || save.isPending} onPress={() => save.mutate()}>
        <AppText style={styles.ctaTxt}>{save.isPending ? t('providerSetup.saving') : t('providerSetup.save')}</AppText>
      </Pressable>
      {save.isError && <AppText style={styles.err}>{(save.error as Error).message}</AppText>}
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
  cta: { height: tap.min, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: space.lg },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  err: { fontFamily: font.te, fontSize: type.small, color: colors.danger },
});
