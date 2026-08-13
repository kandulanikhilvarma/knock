import { useEffect, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, ActivityIndicator, TextInput, Linking, StyleSheet,
} from 'react-native';
import AppText from '../../components/AppText';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap, shadow } from '../../theme/tokens';
import {
  getBooking, subscribeBooking, swapProvider, getJobToken, verifyArrival, markDone, markPaid,
  submitReview, getBookingReview, type Booking, type BookingStatus,
} from '../../lib/bookings';
import { getProvider, getCategories, categoryName } from '../../lib/queries';
import { categoryTint } from '../../lib/categoryTint';
import { useSession } from '../../lib/session';
import ProviderCard from '../../components/ProviderCard';
import CategoryArt from '../../components/CategoryArt';
import { Loading, ErrorState } from '../../components/StateView';

const SEARCHING: BookingStatus[] = ['requested', 'finding_pro'];
const REVIEW_TAGS = ['on_time', 'fair_price', 'clean_work'];

// The customer-facing journey. `failed` has no place on the line — it shows the
// browse fallback instead.
const STEPS = ['requested', 'matched', 'atdoor', 'done', 'paid'] as const;
function stepIndex(b: Booking): number {
  if (b.paid_at) return 4;
  switch (b.status) {
    case 'requested':
    case 'finding_pro':
      return 0;
    case 'assigned':
      return 1;
    case 'in_progress':
      return 2;
    case 'done':
      return 3;
    default:
      return 0;
  }
}

export default function BookingStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
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
  const canChat = !!booking.assigned_provider_id && ['assigned', 'in_progress', 'done'].includes(booking.status);
  const showSteps = !isProvider && booking.status !== 'failed';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: t('booking.statusTitle') }} />
      <BookingHeader booking={booking} />
      {showSteps && <Steps current={stepIndex(booking)} />}
      {isProvider ? <ProviderPanel booking={booking} /> : <CustomerPanel booking={booking} />}
      {canChat && (
        <Pressable
          style={styles.chatBtn}
          onPress={() => router.push({ pathname: '/chat/[bookingId]', params: { bookingId: booking.id } })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.ink} />
          <AppText style={styles.chatTxt}>{t('chat.open')}</AppText>
        </Pressable>
      )}
    </ScrollView>
  );
}

function BookingHeader({ booking }: { booking: Booking }) {
  const { t, i18n } = useTranslation();
  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const cat = (cats.data ?? []).find((c) => c.slug === booking.category_slug);
  const label = cat ? categoryName(cat, i18n.language) : booking.category_slug;
  const paid = !!booking.paid_at;
  const stateKey = paid ? 'paid' : booking.status;
  const proof = paid || ['verified', 'in_progress', 'done'].includes(booking.status);
  return (
    <View style={styles.header}>
      <CategoryArt slug={booking.category_slug} size={40} bg={categoryTint(booking.category_slug)} />
      <View style={{ flex: 1 }}>
        <AppText style={styles.headerCat} numberOfLines={1}>{label}</AppText>
        <View style={[styles.headerPill, proof && styles.headerPillProof]}>
          <AppText style={[styles.headerPillTxt, proof && styles.headerPillTxtProof]}>
            {t(`booking.state.${stateKey}`, stateKey)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function Steps({ current }: { current: number }) {
  const { t } = useTranslation();
  return (
    <View style={styles.steps}>
      {STEPS.map((s, i) => {
        const state = i < current ? 'past' : i === current ? 'now' : 'future';
        return (
          <View key={s} style={styles.step}>
            <View style={styles.stepTop}>
              <View style={[styles.line, i === 0 && styles.lineHidden, i <= current && styles.lineOn]} />
              <View style={[styles.dot, state === 'past' && styles.dotPast, state === 'now' && styles.dotNow]}>
                {state === 'past' ? (
                  <Ionicons name="checkmark" size={11} color={colors.surface} />
                ) : (
                  <View style={[styles.dotInner, state === 'now' && styles.dotInnerNow]} />
                )}
              </View>
              <View style={[styles.line, i === STEPS.length - 1 && styles.lineHidden, i < current && styles.lineOn]} />
            </View>
            <AppText style={[styles.stepTxt, state !== 'future' && styles.stepTxtOn]} numberOfLines={1}>
              {t(`booking.step_${s}`)}
            </AppText>
          </View>
        );
      })}
    </View>
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
        <AppText style={styles.addrLbl}>{t('booking.jobAddress')}</AppText>
        <AppText style={styles.addrTxt}>{booking.address ?? '—'}</AppText>
        {booking.description ? <AppText style={styles.addrDesc}>{booking.description}</AppText> : null}
      </View>

      {booking.status === 'assigned' && (
        <View style={styles.codeCard}>
          <AppText style={styles.codeTitle}>{t('booking.showCodeTitle')}</AppText>
          <AppText style={styles.codeSub}>{t('booking.showCodeSub')}</AppText>
          {tok.data?.token ? (
            <View style={styles.qrBox}>
              <QRCode value={tok.data.token} size={150} />
            </View>
          ) : (
            <ActivityIndicator color={colors.accent} />
          )}
          <AppText style={styles.pinLbl}>{t('booking.pinLabel')}</AppText>
          <AppText style={styles.pin}>{tok.data?.pin ?? '····'}</AppText>
        </View>
      )}

      {booking.status === 'in_progress' && (
        <View style={{ gap: space.md }}>
          <Proof text={t('booking.verifiedAtDoor')} />
          <Pressable style={styles.cta} disabled={done.isPending} onPress={() => done.mutate()}>
            <AppText style={styles.ctaTxt}>{done.isPending ? '…' : t('booking.markDone')}</AppText>
          </Pressable>
        </View>
      )}

      {booking.status === 'done' && !booking.paid_at && (
        <View style={styles.payCard}>
          <AppText style={styles.codeTitle}>{t('booking.receivePayTitle')}</AppText>
          <Pressable style={styles.cta} disabled={paid.isPending} onPress={() => paid.mutate()}>
            <AppText style={styles.ctaTxt}>{t('booking.markReceived')}</AppText>
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
          <AppText style={styles.findTitle}>{t('booking.findingPro')}</AppText>
          <AppText style={styles.findSub}>{t('booking.findingSub')}</AppText>
        </View>
      )}

      {status === 'assigned' && booking.assigned_provider_id && (
        <>
          <AssignedPro providerId={booking.assigned_provider_id} />
          {!booking.swap_used && (
            <Pressable style={styles.swap} disabled={swap.isPending} onPress={() => swap.mutate()}>
              <AppText style={styles.swapTxt}>{swap.isPending ? t('booking.swapping') : t('booking.swap')}</AppText>
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
          <AppText style={styles.fbTitle}>{t('booking.noProviders')}</AppText>
          <AppText style={styles.fbSub}>{t('booking.noProvidersSub')}</AppText>
          <Pressable
            style={styles.cta}
            onPress={() => router.replace({ pathname: '/category/[slug]', params: { slug: booking.category_slug } })}
          >
            <AppText style={styles.ctaTxt}>{t('booking.browseCta')}</AppText>
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
        <AppText style={styles.matchedTxt}>{t('booking.matched')}</AppText>
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
      <AppText style={styles.codeTitle}>{t('booking.verifyTitle')}</AppText>
      <AppText style={styles.codeSub}>{t('booking.verifySub')}</AppText>
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
        <AppText style={styles.ctaTxt}>{t('booking.verifyBtn')}</AppText>
      </Pressable>
      {wrong && <AppText style={styles.err}>{t('booking.verifyWrong')}</AppText>}
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
      <AppText style={styles.codeTitle}>{t('booking.payTitle')}</AppText>
      <AppText style={styles.codeSub}>{t('booking.paySub')}</AppText>
      {link && (
        <View style={styles.qrBox}>
          <QRCode value={link} size={150} />
        </View>
      )}
      {upi ? <AppText style={styles.upiTxt}>{upi}</AppText> : null}
      {amount ? <AppText style={styles.amount}>₹{amount}</AppText> : null}

      {link && (
        <Pressable style={styles.cta} onPress={() => Linking.openURL(link)}>
          <AppText style={styles.ctaTxt}>{t('booking.payInApp')}</AppText>
        </Pressable>
      )}
      <Pressable style={styles.ghostCta} disabled={pay.isPending} onPress={() => pay.mutate('upi')}>
        <AppText style={styles.ghostTxt}>{t('booking.markPaidUpi')}</AppText>
      </Pressable>
      <Pressable style={styles.ghostCta} disabled={pay.isPending} onPress={() => pay.mutate('cash')}>
        <AppText style={styles.ghostTxt}>{t('booking.markPaidCash')}</AppText>
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
      <AppText style={styles.codeTitle}>{t('booking.reviewTitle')}</AppText>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)}>
            <AppText style={[styles.star, n <= rating && styles.starOn]}>★</AppText>
          </Pressable>
        ))}
      </View>
      <View style={styles.tags}>
        {REVIEW_TAGS.map((tag) => (
          <Pressable key={tag} style={[styles.tag, tags.includes(tag) && styles.tagOn]} onPress={() => toggle(tag)}>
            <AppText style={[styles.tagTxt, tags.includes(tag) && styles.tagTxtOn]}>{t(`booking.tag_${tag}`)}</AppText>
          </Pressable>
        ))}
      </View>
      <Pressable style={[styles.cta, m.isPending && styles.ctaOff]} disabled={m.isPending} onPress={() => m.mutate()}>
        <AppText style={styles.ctaTxt}>{t('booking.reviewSubmit')}</AppText>
      </Pressable>
      {m.isError && <AppText style={styles.err}>{(m.error as Error).message}</AppText>}
    </View>
  );
}

function Proof({ text, sub }: { text: string; sub?: string }) {
  return (
    <View style={styles.proof}>
      <AppText style={styles.proofTxt}>✓ {text}</AppText>
      {sub ? <AppText style={styles.proofSub}>{sub}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: space.sm,
    ...shadow.soft,
  },
  headerThumb: { width: 52, height: 52, borderRadius: radius.chip },
  headerCat: { fontFamily: font.displayBold, fontSize: type.h2, color: colors.ink },
  headerPill: { alignSelf: 'flex-start', marginTop: 5, backgroundColor: colors.line2, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  headerPillProof: { backgroundColor: 'rgba(18,161,80,0.12)' },
  headerPillTxt: { fontFamily: font.teBold, fontSize: 11, color: colors.inkMuted, letterSpacing: 0.2 },
  headerPillTxtProof: { color: colors.successInk },

  steps: { flexDirection: 'row', paddingVertical: space.sm },
  step: { flex: 1, alignItems: 'center', gap: 6 },
  stepTop: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  line: { flex: 1, height: 2, backgroundColor: colors.line },
  lineOn: { backgroundColor: colors.success },
  lineHidden: { backgroundColor: 'transparent' },
  dot: { width: 22, height: 22, borderRadius: radius.pill, backgroundColor: colors.line2, alignItems: 'center', justifyContent: 'center' },
  dotPast: { backgroundColor: colors.success },
  dotNow: { backgroundColor: colors.ink },
  dotInner: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.inkMuted },
  dotInnerNow: { backgroundColor: colors.gold },
  stepTxt: { fontFamily: font.te, fontSize: 9, color: colors.inkMuted, textAlign: 'center' },
  stepTxtOn: { color: colors.ink, fontFamily: font.teBold },

  finding: { alignItems: 'center', paddingVertical: space.xxl, gap: space.xs },
  liveDot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.accent },
  findTitle: { fontFamily: font.displayBold, fontSize: type.h1, color: colors.ink, textAlign: 'center' },
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
  amount: { fontFamily: font.displayBold, fontSize: type.hero, color: colors.ink },

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

  cta: { height: tap.min, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  ghostCta: { height: tap.min, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  ghostTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.ink },
  chatBtn: { flexDirection: 'row', gap: space.sm, height: tap.min, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  chatTxt: { fontFamily: font.teBold, fontSize: type.body, color: colors.ink },
  err: { fontFamily: font.te, fontSize: type.small, color: colors.danger, textAlign: 'center' },
});
