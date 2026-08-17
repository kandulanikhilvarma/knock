import { useState } from 'react';
import { View, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import { Loading, ErrorState, Empty } from '../components/StateView';
import { colors, space, radius, font, type, tap, shadow, pressed } from '../theme/tokens';
import { getSavedAddresses, addSavedAddress, deleteSavedAddress, makeDefaultAddress } from '../lib/addresses';
import { useMyLocation } from '../lib/useMyLocation';
import { useSession } from '../lib/session';

export default function Addresses() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const me = useMyLocation();
  const { session } = useSession();
  const uid = session?.user?.id;

  const q = useQuery({ queryKey: ['addresses'], queryFn: getSavedAddresses });
  const [label, setLabel] = useState('');
  const [line, setLine] = useState('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['addresses'] });

  // Save with the current device location if we have a precise fix, so a booking
  // from this address lands the pro at the right pin.
  const add = useMutation({
    mutationFn: () =>
      addSavedAddress({
        label,
        line,
        lat: me.precise ? me.coords.lat : null,
        lng: me.precise ? me.coords.lng : null,
      }),
    onSuccess: () => {
      setLabel('');
      setLine('');
      invalidate();
    },
  });
  const del = useMutation({ mutationFn: deleteSavedAddress, onSuccess: invalidate });
  const setDef = useMutation({
    mutationFn: (id: string) => makeDefaultAddress(id, uid!),
    onSuccess: invalidate,
  });

  const valid = label.trim().length > 0 && line.trim().length > 2;

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: t('addresses.title') }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Add form */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder={t('addresses.labelPlaceholder')}
            placeholderTextColor={colors.inkMuted}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={line}
            onChangeText={setLine}
            placeholder={t('addresses.linePlaceholder')}
            placeholderTextColor={colors.inkMuted}
            multiline
          />
          <Pressable
            style={({ pressed: p }) => [styles.cta, p && pressed, (!valid || add.isPending) && styles.ctaOff]}
            disabled={!valid || add.isPending}
            onPress={() => add.mutate()}
          >
            <AppText style={styles.ctaTxt}>{add.isPending ? '…' : t('addresses.add')}</AppText>
          </Pressable>
          {add.isError && <AppText style={styles.err}>{(add.error as Error).message}</AppText>}
        </View>

        {q.isLoading && <Loading />}
        {q.isError && <ErrorState message={(q.error as Error)?.message} />}
        {q.data?.length === 0 && <Empty icon="location-outline" title={t('addresses.empty')} />}

        {q.data?.map((a) => (
          <View key={a.id} style={styles.row}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <View style={styles.labelRow}>
                <AppText style={styles.rowLabel}>{a.label}</AppText>
                {a.is_default && (
                  <View style={styles.badge}>
                    <AppText style={styles.badgeTxt}>{t('addresses.default')}</AppText>
                  </View>
                )}
              </View>
              <AppText style={styles.rowLine} numberOfLines={2}>
                {a.line}
              </AppText>
              {!a.is_default && (
                <Pressable disabled={setDef.isPending} onPress={() => setDef.mutate(a.id)}>
                  <AppText style={styles.makeDefault}>{t('addresses.makeDefault')}</AppText>
                </Pressable>
              )}
            </View>
            <Pressable hitSlop={10} disabled={del.isPending} onPress={() => del.mutate(a.id)}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    gap: space.sm,
    ...shadow.soft,
  },
  input: {
    minHeight: tap.min,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontFamily: font.regular,
    fontSize: type.body,
    color: colors.ink,
  },
  multiline: { minHeight: 64, textAlignVertical: 'top' },
  cta: {
    height: tap.min,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    ...shadow.soft,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowLabel: { fontFamily: font.displayBold, fontSize: type.h3, color: colors.ink },
  badge: {
    backgroundColor: colors.tintSuccess,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeTxt: { fontFamily: font.semibold, fontSize: type.chip, color: colors.successInk },
  rowLine: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted, marginTop: 1 },
  makeDefault: { fontFamily: font.semibold, fontSize: type.small, color: colors.primary, marginTop: space.xs },
});
