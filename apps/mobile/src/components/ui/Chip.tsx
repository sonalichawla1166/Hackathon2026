import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  selectedBg?: string;
  selectedBorder?: string;
  pillShape?: boolean;
}

export function Chip({ label, selected = false, onPress, selectedBg = colors.primary, selectedBorder = colors.primary, pillShape = false }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderRadius: pillShape ? radius.sm : radius.chip },
        selected
          ? { backgroundColor: selectedBg, borderColor: selectedBorder }
          : { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceMuted },
      ]}
    >
      <Text style={[styles.text, { color: selected ? '#fff' : colors.textHeading }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  text: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12.5,
  },
});
