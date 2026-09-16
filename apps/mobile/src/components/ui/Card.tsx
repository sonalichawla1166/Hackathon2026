import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { radius, spacing, useTheme } from '@/theme';

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
  const { colors, shadow } = useTheme();

  const fill: ViewStyle = inverse
    ? { backgroundColor: colors.surfaceInverse }
    : muted
      ? { backgroundColor: colors.surfaceMuted }
      : { backgroundColor: colors.surfaceCard, ...shadow.card };

  return (
    <View
      style={[
        // A hairline edge so a card still reads as a card on the page wash,
        // the way the sign-in card does. `bordered` overrides it.
        { borderRadius: radius.md, padding, borderWidth: 1, borderColor: colors.borderHairline },
        fill,
        bordered && { borderWidth: 1.5, borderColor: borderColor ?? colors.borderHairline },
        style,
      ]}
    >
      {children}
    </View>
  );
}
