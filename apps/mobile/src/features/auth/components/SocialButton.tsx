import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';

interface SocialButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
}

/**
 * Neutral outlined pill for third-party sign-in. Deliberately plain so the
 * provider's own mark is the only colour in it.
 */
export function SocialButton({ label, icon, onPress, disabled = false, busy = false }: SocialButtonProps) {
  const { colors, shadow } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      style={({ pressed }) => [
        styles.button,
        shadow.card,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: pressed ? colors.borderFocus : colors.borderMuted,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.icon}>{busy ? <ActivityIndicator size="small" color={colors.brand} /> : icon}</View>
      <Text style={[styles.label, { color: colors.textHeading }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    minHeight: 50,
    paddingHorizontal: 18,
  },
  icon: { width: 20, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fontFamily.bodyBold, fontSize: 14.5, letterSpacing: 0.1 },
});
