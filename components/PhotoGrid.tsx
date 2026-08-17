import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { signedPhotoUrl } from '../lib/photos';
import { colors, radius, space } from '../theme/tokens';

// Private photos need a signed URL each; sign them all, show a scroll row.
export default function PhotoGrid({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    Promise.all(paths.map(signedPhotoUrl)).then((u) => {
      if (alive) setUrls(u.filter((x): x is string => !!x));
    });
    return () => {
      alive = false;
    };
  }, [paths.join(',')]);

  if (paths.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {urls.map((u) => (
        <Image key={u} source={{ uri: u }} style={styles.thumb} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.sm, paddingVertical: space.xs },
  thumb: { width: 96, height: 96, borderRadius: radius.chip, backgroundColor: colors.line2 },
});
