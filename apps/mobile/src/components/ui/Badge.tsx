import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontFamily } from '@/theme/typography';

export function Badge({ label, bg }: { label: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 3.2, paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start' },
  text: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: '#fff' },
});
