import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius } from '@/theme';
import { fontFamily } from '@/theme/typography';

// Renders as a translucent tint of `bg` with `bg` itself as the text color
// — reads as a modern, softer pill against a dark surface instead of the
// old solid-fill block.
export function Badge({ label, bg }: { label: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(bg, 0.16), borderColor: withAlpha(bg, 0.4) }]}>
      <Text style={[styles.text, { color: bg }]}>{label}</Text>
    </View>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: fontFamily.bodyBold, fontSize: 11 },
});
