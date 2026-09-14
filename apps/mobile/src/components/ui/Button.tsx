import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';

export type ButtonVariant = 'primary' | 'cta' | 'outlineDark';
export type ButtonSize = 'sm' | 'md';

const PALETTE: Record<ButtonVariant, { bg: string; hover: string; fg: string; border: string }> = {
  cta: { bg: colors.cta, hover: colors.ctaHover, fg: '#fff', border: colors.cta },
  primary: { bg: colors.primary, hover: '#0A1B24', fg: '#fff', border: colors.primary },
  outlineDark: { bg: 'transparent', hover: 'rgba(15,40,53,.08)', fg: colors.primary, border: colors.primary },
};

const SIZES: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; minHeight: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 15, fontSize: 13, minHeight: 36 },
  md: { paddingVertical: 11, paddingHorizontal: 24, fontSize: 15, minHeight: 44 },
};

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Button({ children, variant = 'cta', size = 'md', block = false, disabled = false, onPress, style }: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const p = PALETTE[variant];
  const s = SIZES[size];
  const bg = disabled ? p.bg : pressed ? p.hover : p.bg;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor: pressed && !disabled ? p.hover : p.border,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          minHeight: s.minHeight,
          opacity: disabled ? 0.5 : 1,
          alignSelf: block ? 'stretch' : 'flex-start',
          width: block ? '100%' : undefined,
        },
        style,
      ]}
    >
      <View pointerEvents="none">
        <Text style={{ fontFamily: fontFamily.bodyBold, fontSize: s.fontSize, color: p.fg }} numberOfLines={1}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 5,
  },
});
