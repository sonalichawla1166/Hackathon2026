import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, shadow, spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  inverse?: boolean;
  muted?: boolean;
  bordered?: boolean;
  borderColor?: string;
  padding?: number;
}

export function Card({ children, style, inverse, muted, bordered, borderColor, padding = spacing.md }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { padding },
        inverse
          ? { backgroundColor: colors.surfaceInverse }
          : muted
            ? { backgroundColor: colors.surfaceMuted }
            : { backgroundColor: colors.surfaceCard, ...shadow.card },
        bordered && { borderWidth: 1.5, borderColor: borderColor ?? colors.borderHairline },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
  },
});
