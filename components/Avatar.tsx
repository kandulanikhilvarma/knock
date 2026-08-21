import { View, Text, Image, StyleSheet } from 'react-native';
import AppText from './AppText';
import { colors, font } from '../theme/tokens';

function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

// Until a provider uploads a face, the initials tile is what customers see. A
// single flat colour turns a list of pros into a wall of identical circles, so
// each person gets a stable pastel from their name — a roster reads as people.
const TILES = [
  { bg: colors.pastelPeach, ink: '#7A4318' },
  { bg: colors.pastelBlue, ink: '#26505E' },
  { bg: colors.pastelSage, ink: '#3B5426' },
  { bg: colors.pastelPink, ink: '#7C3B34' },
] as const;

function tileFor(name: string | null) {
  const s = name?.trim() || '?';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TILES[h % TILES.length];
}

export default function Avatar({
  name,
  photoUrl,
  size = 56,
}: {
  name: string | null;
  photoUrl?: string | null;
  size?: number;
}) {
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]} />;
  }
  const tile = tileFor(name);
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tile.bg },
      ]}
    >
      <AppText style={[styles.txt, { fontSize: size * 0.38, color: tile.ink }]}>
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: colors.line },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  txt: { fontFamily: font.displayBold },
});
