import React, { useRef } from 'react';
import { Animated, Pressable, Text, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadow } from '@/theme';
import { fontFamily } from '@/theme/typography';

export type ButtonVariant = 'primary' | 'cta' | 'outlineDark';
export type ButtonSize = 'sm' | 'md';

const SIZES: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; minHeight: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, minHeight: 38 },
  md: { paddingVertical: 12, paddingHorizontal: 26, fontSize: 15, minHeight: 46 },
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

// cta and primary render as a gradient fill with a soft colored glow behind
// them — the "vivid accent on near-black" signature of the redesign — and
// every variant scales down slightly on press for tactile feedback.
export function Button({ children, variant = 'cta', size = 'md', block = false, disabled = false, onPress, style }: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const s = SIZES[size];

  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

  const sizeStyle = {
    paddingVertical: s.paddingVertical,
    paddingHorizontal: s.paddingHorizontal,
    minHeight: s.minHeight,
  };

  const wrapStyle: StyleProp<ViewStyle> = [
    { opacity: disabled ? 0.45 : 1, alignSelf: block ? 'stretch' : 'flex-start', transform: [{ scale }] },
    style,
  ];

  if (variant === 'outlineDark') {
    return (
      <Animated.View style={wrapStyle}>
        <Pressable
          disabled={disabled}
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={[styles.base, sizeStyle, styles.outline, { width: block ? '100%' : undefined }]}
        >
          <Text style={[styles.label, { fontSize: s.fontSize, color: colors.textHeading }]} numberOfLines={1}>
            {children}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  const grad = variant === 'cta' ? gradients.cta : gradients.brand;
  const glowColor = variant === 'cta' ? colors.cta : colors.primary;

  return (
    <Animated.View style={[wrapStyle, !disabled && shadow.glow(glowColor)]}>
      <Pressable disabled={disabled} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={{ width: block ? '100%' : undefined }}>
        <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, sizeStyle]}>
          <Text style={[styles.label, { fontSize: s.fontSize, color: '#fff' }]} numberOfLines={1}>
            {children}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.borderMuted,
    backgroundColor: 'transparent',
  },
  label: { fontFamily: fontFamily.bodyBold, letterSpacing: 0.2 },
});
