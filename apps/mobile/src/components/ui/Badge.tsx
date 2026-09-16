import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';

// Renders as a translucent tint of `bg` with `bg` itself as the text color
// — reads as a modern, softer pill on either a dark or a cream surface
// instead of a solid-fill block.
export function Badge({ label, bg }: { label: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(bg, 0.16), borderColor: withAlpha(bg, 0.4) }]}>
      <Text style={[styles.text, { color: bg }]}>{label}</Text>
    </View>
  );
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
