import { View, Text, Image, StyleSheet } from 'react-native';
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
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.txt, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: colors.line },
  fallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  txt: { color: colors.surface, fontFamily: font.bold },
});
