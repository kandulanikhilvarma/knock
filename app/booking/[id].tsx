import { useEffect, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, ActivityIndicator, TextInput, Linking, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import {
  getBooking, subscribeBooking, swapProvider, getJobToken, verifyArrival, markDone, markPaid,
  submitReview, getBookingReview, type Booking, type BookingStatus,
} from '../../lib/bookings';
import { getProvider } from '../../lib/queries';
import { useSession } from '../../lib/session';
import ProviderCard from '../../components/ProviderCard';
import { Loading, ErrorState } from '../../components/StateView';

const SEARCHING: BookingStatus[] = ['requested', 'finding_pro'];
const REVIEW_TAGS = ['on_time', 'fair_price', 'clean_work'];

export default function BookingStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { session } = useSession();
  const uid = session?.user?.id;

  const q = useQuery({ queryKey: ['booking', id], queryFn: () => getBooking(id!), enabled: !!id });
  const [live, setLive] = useState<Booking | null>(null);
  useEffect(() => {
    if (!id) return;
    return subscribeBooking(id, setLive);
  }, [id]);

  const booking = live ?? q.data ?? null;

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState message={(q.error as Error)?.message} />;
  if (!booking) return <ErrorState message={t('booking.notFound')} />;

  const isProvider = !!uid && uid === booking.assigned_provider_id;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: t('booking.statusTitle') }} />
      {isProvider ? <ProviderPanel booking={booking} /> : <CustomerPanel booking={booking} />}
    </ScrollView>
  );
}

/* ---------------- provider side ---------------- */

function ProviderPanel({ booking }: { booking: Booking }) {
  const { t } = useTranslation();
  const tok = useQuery({ queryKey: ['token', booking.id], queryFn: () => getJobToken(booking.id) });

  const done = useMutation({ mutationFn: () => markDone(booking.id) });
  const paid = useMutation({ mutationFn: () => markPaid(booking.id, 'upi') });

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.addr}>
        <Text style={styles.addrLbl}>{t('booking.jobAddress')}</Text>
        <Text style={styles.addrTxt}>{booking.address ?? '—'}</Text>
        {booking.description ? <Text style={styles.addrDesc}>{booking.description}</Text> : null}
      </View>

      {booking.status === 'assigned' && (
        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>{t('booking.showCodeTitle')}</Text>
          <Text style={styles.codeSub}>{t('booking.showCodeSub')}</Text>
          {tok.data?.token ? (
            <View style={styles.qrBox}>
              <QRCode value={tok.data.token} size={150} />
            </View>
          ) : (
            <ActivityIndicator color={colors.accent} />
          )}
          <Text style={styles.pinLbl}>{t('booking.pinLabel')}</Text>
          <Text style={styles.pin}>{tok.data?.pin ?? '····'}</Text>
        </View>
      )}

      {booking.status === 'in_progress' && (
        <View style={{ gap: space.md }}>
          <Proof text={t('booking.verifiedAtDoor')} />
          <Pressable style={styles.cta} disabled={done.isPending} onPress={() => done.mutate()}>
            <Text style={styles.ctaTxt}>{done.isPending ? '…' : t('booking.markDone')}</Text>
          </Pressable>
        </View>
      )}

      {booking.status === 'done' && !booking.paid_at && (
        <View style={styles.payCard}>
          <Text style={styles.codeTitle}>{t('booking.receivePayTitle')}</Text>
          <Pressable style={styles.cta} disabled={paid.isPending} onPress={() => paid.mutate()}>
            <Text style={styles.ctaTxt}>{t('booking.markReceived')}</Text>
          </Pressable>
        </View>
      )}

      {booking.paid_at && <Proof text={t('booking.providerPaid')} />}
    </View>
  );
}

/* ---------------- customer side ---------------- */

function CustomerPanel({ booking }: { booking: Booking }) {
  const { t } = useTranslation();
  const router = useRouter();
  const status = booking.status;
  const swap = useMutation({ mutationFn: () => swapProvider(booking.id) });

  return (
    <View style={{ gap: space.md }}>
      {SEARCHING.includes(status) && (
        <View style={styles.finding}>
          <View style={styles.liveDot} />
          <ActivityIndicator color={colors.accent} style={{ marginVertical: space.md }} />
          <Text style={styles.findTitle}>{t('booking.findingPro')}</Text>
          <Text style={styles.findSub}>{t('booking.findingSub')}</Text>
        </View>
      )}

      {status === 'assigned' && booking.assigned_provider_id && (
        <>
          <AssignedPro providerId={booking.assigned_provider_id} />
          {!booking.swap_used && (
            <Pressable style={styles.swap} disabled={swap.isPending} onPress={() => swap.mutate()}>
              <Text style={styles.swapTxt}>{swap.isPending ? t('booking.swapping') : t('booking.swap')}</Text>
            </Pressable>
          )}
          <VerifyPanel bookingId={booking.id} />
        </>
      )}

      {status === 'in_progress' && <Proof text={t('booking.verifiedAtDoor')} sub={t('booking.workInProgress')} />}

      {status === 'done' && booking.assigned_provider_id && (
        booking.paid_at
          ? <ReviewPanel booking={booking} />
          : <PaymentPanel booking={booking} />
      )}

      {status === 'failed' && (
        <View style={styles.fallback}>
          <Text style={styles.fbTitle}>{t('booking.noProviders')}</Text>
          <Text style={styles.fbSub}>{t('booking.noProvidersSub')}</Text>
          <Pressable
            style={styles.cta}
            onPress={() => router.replace({ pathname: '/category/[slug]', params: { slug: booking.category_slug } })}
          >
            <Text style={styles.ctaTxt}>{t('booking.browseCta')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function AssignedPro({ providerId }: { providerId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const p = useQuery({ queryKey: ['provider', providerId], queryFn: () => getProvider(providerId) });
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.matched}>
        <Text style={styles.matchedTxt}>{t('booking.matched')}</Text>
      </View>
      {p.isLoading && <Loading />}
      {p.data && (
        <ProviderCard
          provider={p.data}
          onPress={() => router.push({ pathname: '/provider/[id]', params: { id: providerId } })}
        />
      )}
    </View>
  );
}

function VerifyPanel({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const m = useMutation({ mutationFn: () => verifyArrival(bookingId, pin.trim()) });
  const wrong = m.data && !m.data.verified;

  return (
    <View style={styles.verify}>
      <Text style={styles.codeTitle}>{t('booking.verifyTitle')}</Text>
      <Text style={styles.codeSub}>{t('booking.verifySub')}</Text>
      <TextInput
        style={styles.pinInput}
        value={pin}
        onChangeText={setPin}
        placeholder={t('booking.verifyPlaceholder')}
        placeholderTextColor={colors.inkMuted}
        keyboardType="number-pad"
        maxLength={4}
      />
      <Pressable
        style={[styles.cta, (pin.length < 4 || m.isPending) && styles.ctaOff]}
        disabled={pin.length < 4 || m.isPending}
        onPress={() => m.mutate()}
      >
        <Text style={styles.ctaTxt}>{t('booking.verifyBtn')}</Text>
      </Pressable>
      {wrong && <Text style={styles.err}>{t('booking.verifyWrong')}</Text>}
    </View>
  );
}

function PaymentPanel({ booking }: { booking: Booking }) {
  const { t } = useTranslation();
  const p = useQuery({ queryKey: ['provider', booking.assigned_provider_id], queryFn: () => getProvider(booking.assigned_provider_id!) });
  const pay = useMutation({ mutationFn: (method: 'upi' | 'cash') => markPaid(booking.id, method) });

  const upi = p.data?.upi_id;
  const name = p.data?.profiles?.full_name ?? 'Provider';
  const amount = booking.price_agreed ?? p.data?.visiting_charge ?? undefined;
  const link = upi
    ? `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}${amount ? `&am=${amount}` : ''}&cu=INR`
    : null;

  return (
    <View style={styles.payCard}>
      <Text style={styles.codeTitle}>{t('booking.payTitle')}</Text>
      <Text style={styles.codeSub}>{t('booking.paySub')}</Text>
      {link && (
        <View style={styles.qrBox}>
          <QRCode value={link} size={150} />
        </View>
      )}
      {upi ? <Text style={styles.upiTxt}>{upi}</Text> : null}
      {amount ? <Text style={styles.amount}>₹{amount}</Text> : null}

      {link && (
        <Pressable style={styles.cta} onPress={() => Linking.openURL(link)}>
          <Text style={styles.ctaTxt}>{t('booking.payInApp')}</Text>
        </Pressable>
      )}
      <Pressable style={styles.ghostCta} disabled={pay.isPending} onPress={() => pay.mutate('upi')}>
        <Text style={styles.ghostTxt}>{t('booking.markPaidUpi')}</Text>
      </Pressable>
      <Pressable style={styles.ghostCta} disabled={pay.isPending} onPress={() => pay.mutate('cash')}>
        <Text style={styles.ghostTxt}>{t('booking.markPaidCash')}</Text>
      </Pressable>
    </View>
  );
}

function ReviewPanel({ booking }: { booking: Booking }) {
  const { t } = useTranslation();
  const existing = useQuery({ queryKey: ['review', booking.id], queryFn: () => getBookingReview(booking.id) });
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const m = useMutation({ mutationFn: () => submitReview(booking.id, rating, tags, ''), onSuccess: () => existing.refetch() });

  if (existing.isLoading) return <Loading />;
  if (existing.data || m.isSuccess) return <Proof text={t('booking.reviewThanks')} />;

  const toggle = (tag: string) => setTags((s) => (s.includes(tag) ? s.filter((x) => x !== tag) : [...s, tag]));

  return (
    <View style={styles.review}>
      <Proof text={t('booking.paidDone')} />
      <Text style={styles.codeTitle}>{t('booking.reviewTitle')}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)}>
            <Text style={[styles.star, n <= rating && styles.starOn]}>★</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.tags}>
        {REVIEW_TAGS.map((tag) => (
          <Pressable key={tag} style={[styles.tag, tags.includes(tag) && styles.tagOn]} onPress={() => toggle(tag)}>
            <Text style={[styles.tagTxt, tags.includes(tag) && styles.tagTxtOn]}>{t(`booking.tag_${tag}`)}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={[styles.cta, m.isPending && styles.ctaOff]} disabled={m.isPending} onPress={() => m.mutate()}>
        <Text style={styles.ctaTxt}>{t('booking.reviewSubmit')}</Text>
      </Pressable>
      {m.isError && <Text style={styles.err}>{(m.error as Error).message}</Text>}
    </View>
  );
}

function Proof({ text, sub }: { text: string; sub?: string }) {
  return (
    <View style={styles.proof}>
      <Text style={styles.proofTxt}>✓ {text}</Text>
      {sub ? <Text style={styles.proofSub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },

  finding: { alignItems: 'center', paddingVertical: space.xxl, gap: space.xs },
  liveDot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.accent },
  findTitle: { fontFamily: font.teBold, fontSize: type.h2, color: colors.ink, textAlign: 'center' },
  findSub: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },

  matched: { backgroundColor: colors.success, borderRadius: radius.chip, paddingVertical: space.sm, paddingHorizontal: space.md, alignSelf: 'flex-start' },
  matchedTxt: { fontFamily: font.teBold, fontSize: type.small, color: colors.surface },

  swap: { height: tap.min, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  swapTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.ink },

  addr: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: space.lg, gap: 4 },
  addrLbl: { fontFamily: font.te, fontSize: type.chip, color: colors.inkMuted },
  addrTxt: { fontFamily: font.teBold, fontSize: type.h3, color: colors.ink },
  addrDesc: { fontFamily: font.te, fontSize: type.small, color: colors.ink2 },

  codeCard: { backgroundColor: colors.ink, borderRadius: radius.card, padding: space.lg, alignItems: 'center', gap: space.sm },
  codeTitle: { fontFamily: font.teBold, fontSize: type.h3, color: colors.onDark, textAlign: 'center' },
  codeSub: { fontFamily: font.te, fontSize: type.small, color: colors.onDarkMuted, textAlign: 'center' },
  qrBox: { backgroundColor: colors.surface, padding: space.md, borderRadius: radius.chip, marginVertical: space.sm },
  pinLbl: { fontFamily: font.te, fontSize: type.chip, color: colors.onDarkMuted },
  pin: { fontFamily: font.mono, fontSize: 34, letterSpacing: 8, color: colors.gold, fontWeight: '700' },

  verify: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: space.lg, gap: space.sm },
  pinInput: {
    height: tap.min, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg,
    textAlign: 'center', fontFamily: font.mono, fontSize: 24, letterSpacing: 8, color: colors.ink,
  },

  payCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: space.lg, alignItems: 'center', gap: space.sm },
  upiTxt: { fontFamily: font.mono, fontSize: type.body, color: colors.ink },
  amount: { fontFamily: font.mono, fontSize: type.h1, color: colors.ink, fontWeight: '700' },

  review: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: space.lg, gap: space.md },
  stars: { flexDirection: 'row', gap: space.xs, justifyContent: 'center' },
  star: { fontSize: 36, color: colors.line },
  starOn: { color: colors.gold },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  tag: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, paddingVertical: space.xs, paddingHorizontal: space.md },
  tagOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  tagTxt: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted },
  tagTxtOn: { color: colors.onDark },

  proof: { backgroundColor: 'rgba(18,161,80,0.10)', borderRadius: radius.card, borderWidth: 1, borderColor: colors.success, padding: space.lg, gap: 4 },
  proofTxt: { fontFamily: font.teBold, fontSize: type.h3, color: colors.successInk },
  proofSub: { fontFamily: font.te, fontSize: type.small, color: colors.ink2 },

  fallback: { gap: space.sm, paddingVertical: space.lg },
  fbTitle: { fontFamily: font.teBold, fontSize: type.h2, color: colors.ink },
  fbSub: { fontFamily: font.te, fontSize: type.body, color: colors.inkMuted },

  cta: { height: tap.min, borderRadius: radius.card, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.surface },
  ghostCta: { height: tap.min, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  ghostTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.ink },
  err: { fontFamily: font.te, fontSize: type.small, color: colors.danger, textAlign: 'center' },
});
