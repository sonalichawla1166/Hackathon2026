import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';

export function Citation({ label, onInverse = false }: { label: string; onInverse?: boolean }) {
  const color = onInverse ? 'rgba(255,255,255,0.73)' : colors.accent;
  const border = onInverse ? 'rgba(255,255,255,0.35)' : colors.accent;
  return (
    <View style={[styles.chip, { borderColor: border }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

export function CitationRow({ items, onInverse = false }: { items: string[]; onInverse?: boolean }) {
  if (!items.length) return null;
  return (
    <View style={styles.row}>
      {items.map((c) => (
        <Citation key={c} label={c} onInverse={onInverse} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 3.2, paddingHorizontal: 7, paddingVertical: 3 },
  text: { fontFamily: fontFamily.body, fontSize: 10.5, lineHeight: 14 },
});
