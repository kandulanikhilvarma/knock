import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import { uploadVoiceIntro } from '../lib/audio';
import { colors, space, radius, font, type, tap } from '../theme/tokens';

// Record a short voice intro, upload on stop, hand the public URL up. Empty value
// = not recorded yet. Recording + mic-permission handled here.
export default function VoiceRecorder({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const { t } = useTranslation();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = async () => {
    setErr(null);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setErr(t('voice.denied'));
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      await recorder.stop();
      if (recorder.uri) onChange(await uploadVoiceIntro(recorder.uri));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (value) {
    return (
      <View style={styles.done}>
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        <AppText style={styles.doneTxt}>{t('voice.recorded')}</AppText>
        <Pressable hitSlop={8} onPress={() => onChange(null)}>
          <AppText style={styles.reTxt}>{t('voice.remove')}</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: space.xs }}>
      <Pressable
        style={[styles.btn, state.isRecording && styles.btnRec]}
        disabled={busy}
        onPress={state.isRecording ? stop : start}
      >
        <Ionicons name={state.isRecording ? 'stop' : 'mic'} size={18} color={colors.onDark} />
        <AppText style={styles.btnTxt}>
          {busy ? t('voice.saving') : state.isRecording ? t('voice.stop') : t('voice.record')}
        </AppText>
      </Pressable>
      {err && <AppText style={styles.err}>{err}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
    height: tap.min, borderRadius: radius.pill, backgroundColor: colors.accent,
  },
  btnRec: { backgroundColor: colors.danger },
  btnTxt: { fontFamily: font.semibold, fontSize: type.body, color: colors.onDark },
  done: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    padding: space.md, borderRadius: radius.card, backgroundColor: colors.tintSuccess,
  },
  doneTxt: { flex: 1, fontFamily: font.semibold, fontSize: type.small, color: colors.successInk },
  reTxt: { fontFamily: font.semibold, fontSize: type.small, color: colors.danger },
  err: { fontFamily: font.regular, fontSize: type.small, color: colors.danger },
});
