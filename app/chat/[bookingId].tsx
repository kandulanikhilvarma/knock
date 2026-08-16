import { useEffect, useRef, useState } from 'react';
import {
  View, TextInput, Pressable, FlatList, ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import AppText from '../../components/AppText';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap, pressed } from '../../theme/tokens';
import { getMessages, sendMessage, subscribeMessages, type Message } from '../../lib/chat';
import { useSession } from '../../lib/session';
import { Loading, ErrorState } from '../../components/StateView';

// HH:MM, 24h — plain and unambiguous across scripts.
function clock(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ChatThread() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { t } = useTranslation();
  const { session } = useSession();
  const uid = session?.user?.id;
  const listRef = useRef<FlatList<Message>>(null);

  const q = useQuery({ queryKey: ['messages', bookingId], queryFn: () => getMessages(bookingId!), enabled: !!bookingId });
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (q.data) setMsgs(q.data);
  }, [q.data]);

  useEffect(() => {
    if (!bookingId) return;
    return subscribeMessages(bookingId, (m) => {
      setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    });
  }, [bookingId]);

  const sendBody = async (body: string) => {
    if (!body.trim()) return;
    await sendMessage(bookingId!, body.trim());
  };

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    await sendBody(body);
  };

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState message={(q.error as Error)?.message} />;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: t('chat.title') }} />
      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[styles.list, msgs.length === 0 && styles.listEmpty]}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item, index }) => {
          const mine = item.sender_id === uid;
          const prev = msgs[index - 1];
          const next = msgs[index + 1];
          // Group consecutive messages from the same sender: tight gap within a
          // run, a real break when the speaker changes; time only on the last of
          // a run, so a burst of lines doesn't repeat the clock.
          const firstOfRun = !prev || prev.sender_id !== item.sender_id;
          const lastOfRun = !next || next.sender_id !== item.sender_id;
          return (
            <View
              style={[
                styles.row,
                mine ? styles.rowMine : styles.rowTheirs,
                { marginTop: firstOfRun ? space.md : 2 },
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  mine ? styles.mine : styles.theirs,
                  // Flatten the corner on the tail side within a run for a
                  // stacked, threaded feel.
                  mine
                    ? { borderBottomRightRadius: lastOfRun ? radius.card : 6 }
                    : { borderBottomLeftRadius: lastOfRun ? radius.card : 6 },
                ]}
              >
                <AppText style={[styles.msgTxt, mine && styles.msgTxtMine]}>{item.body}</AppText>
              </View>
              {lastOfRun && <AppText style={styles.time}>{clock(item.created_at)}</AppText>}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={26} color={colors.primary} />
            </View>
            <AppText style={styles.empty}>{t('chat.empty')}</AppText>
          </View>
        }
      />
      {/* Canned replies, localized (§6 parity). Tier-2 users type slowly on a
          phone keyboard; the four lines that get sent most are one tap. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quick}
        keyboardShouldPersistTaps="always"
      >
        {['onWay', 'reached', 'howLong', 'callMe'].map((k) => (
          <Pressable
            key={k}
            style={({ pressed: p }) => [styles.chip, p && pressed]}
            onPress={() => sendBody(t(`chat.quick_${k}`))}
          >
            <AppText style={styles.chipTxt}>{t(`chat.quick_${k}`)}</AppText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={colors.inkMuted}
          multiline
        />
        <Pressable style={[styles.send, !draft.trim() && styles.sendOff]} disabled={!draft.trim()} onPress={send}>
          <Ionicons name="arrow-up" size={20} color={colors.onDark} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  list: { padding: space.lg, paddingBottom: space.md, flexGrow: 1 },
  listEmpty: { justifyContent: 'center' },

  row: { maxWidth: '82%', gap: 3 },
  rowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },

  bubble: { paddingVertical: 9, paddingHorizontal: space.md, borderRadius: radius.card },
  mine: { backgroundColor: colors.primary },
  theirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  msgTxt: { fontFamily: font.regular, fontSize: type.body, lineHeight: 21, color: colors.ink },
  msgTxtMine: { color: colors.onDark },
  time: { fontFamily: font.regular, fontSize: type.chip, color: colors.inkMuted, paddingHorizontal: 4 },

  emptyWrap: { alignItems: 'center', gap: space.md },
  emptyIcon: {
    width: 56, height: 56, borderRadius: radius.pill,
    backgroundColor: colors.tintSuccess, alignItems: 'center', justifyContent: 'center',
  },
  empty: { fontFamily: font.regular, fontSize: type.small, color: colors.inkMuted, textAlign: 'center' },

  quick: { paddingHorizontal: space.lg, paddingBottom: space.sm, gap: space.sm },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipTxt: { fontFamily: font.medium, fontSize: type.small, color: colors.ink2 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: tap.min,
    maxHeight: 120,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    fontFamily: font.regular,
    fontSize: type.body,
    color: colors.ink,
  },
  send: { width: tap.min, height: tap.min, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendOff: { opacity: 0.4 },
});
