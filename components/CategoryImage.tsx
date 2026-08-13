import { useState } from 'react';
import { View, Image, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';
import { categoryPhoto } from '../lib/categoryArt';

// A category photo that never shows a broken image: if the remote photo fails,
// it falls back to a branded ink tile with the category glyph. `dim` darkens it
// for coming-soon tiles so the "Soon" ribbon and label stay legible.
export default function CategoryImage({
  slug,
  icon,
  width = 640,
  dim,
  style,
}: {
  slug: string;
  icon?: string | null;
  width?: number;
  dim?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);
  const uri = categoryPhoto(slug, width);

  return (
    <View style={[styles.wrap, style]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Ionicons name={(icon ?? 'construct') as any} size={30} color={colors.gold} />
        </View>
      )}
      {/* legibility scrim — heavier at the bottom where labels sit */}
      <View style={[StyleSheet.absoluteFill, styles.scrim, dim && styles.scrimDim]} />
      <View style={styles.scrimBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.ink2 },
  fallback: { backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  scrim: { backgroundColor: 'rgba(11,13,18,0.18)' },
  scrimDim: { backgroundColor: 'rgba(11,13,18,0.55)' },
  scrimBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'rgba(11,13,18,0.42)',
  },
});
