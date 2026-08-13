import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import AppText from '../../components/AppText';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, font, type, tap } from '../../theme/tokens';
import { getMessages, sendMessage, subscribeMessages, type Message } from '../../lib/chat';
import { useSession } from '../../lib/session';
import { Loading, ErrorState } from '../../components/StateView';

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

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    await sendMessage(bookingId!, body);
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
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.sender_id === uid;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <AppText style={[styles.msgTxt, mine && styles.msgTxtMine]}>{item.body}</AppText>
            </View>
          );
        }}
        ListEmptyComponent={<AppText style={styles.empty}>{t('chat.empty')}</AppText>}
      />
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
          <Ionicons name="arrow-up" size={20} color={colors.surface} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: space.lg, gap: space.sm, flexGrow: 1 },
  empty: { fontFamily: font.te, fontSize: type.small, color: colors.inkMuted, textAlign: 'center', marginTop: space.xxl },
  bubble: { maxWidth: '80%', paddingVertical: space.sm, paddingHorizontal: space.md, borderRadius: radius.card },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.ink },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  msgTxt: { fontFamily: font.te, fontSize: type.body, color: colors.ink },
  msgTxtMine: { color: colors.onDark },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    padding: space.md,
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
    fontFamily: font.te,
    fontSize: type.body,
    color: colors.ink,
  },
  send: { width: tap.min, height: tap.min, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendOff: { opacity: 0.4 },
});
