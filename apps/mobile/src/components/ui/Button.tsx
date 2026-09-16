import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, useTheme } from '@/theme';
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

// `cta` and `primary` render as a gradient fill with a soft coloured glow
// behind them; every variant scales down slightly on press for tactile
// feedback. `cta` is CG Infinity amber in both themes, so its label uses the
// palette's `onCta` ink rather than white — amber-on-white fails contrast.
export function Button({ children, variant = 'cta', size = 'md', block = false, disabled = false, onPress, style }: ButtonProps) {
  const { colors, gradients, shadow } = useTheme();
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
          accessibilityRole="button"
          style={[styles.base, sizeStyle, styles.outline, { borderColor: colors.borderMuted, width: block ? '100%' : undefined }]}
        >
          <Text style={[styles.label, { fontSize: s.fontSize, color: colors.textHeading }]} numberOfLines={1}>
            {children}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  const isCta = variant === 'cta';
  const grad = isCta ? gradients.cta : gradients.control;
  const glowColor = isCta ? colors.cta : colors.primary;
  const labelColor = isCta ? colors.onCta : colors.textInverse;

  return (
    <Animated.View style={[wrapStyle, !disabled && shadow.glow(glowColor)]}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
        style={{ width: block ? '100%' : undefined }}
      >
        <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, sizeStyle]}>
          <Text style={[styles.label, { fontSize: s.fontSize, color: labelColor }]} numberOfLines={1}>
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
    backgroundColor: 'transparent',
  },
  label: { fontFamily: fontFamily.bodyBold, letterSpacing: 0.2 },
});
