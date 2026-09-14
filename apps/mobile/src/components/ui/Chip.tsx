import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '@/theme';
import { fontFamily } from '@/theme/typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  selectedBg?: string;
  selectedBorder?: string;
  pillShape?: boolean;
}

export function Chip({ label, selected = false, onPress, selectedBg = colors.primary, selectedBorder = colors.primary, pillShape = true }: ChipProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, selected && shadow.glow(selectedBorder)]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.chip,
          { borderRadius: pillShape ? radius.pill : radius.chip },
          selected
            ? { backgroundColor: selectedBg, borderColor: selectedBorder }
            : { backgroundColor: colors.surfaceMutedAlt, borderColor: colors.borderMuted },
        ]}
      >
        <Text style={[styles.text, { color: selected ? '#fff' : colors.textBody }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  text: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12.5,
  },
});
