import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { radius, useTheme, withAlpha } from '@/theme';
import { MoonIcon, SunIcon } from '@/components/icons/BrandIcons';

const TRACK_WIDTH = 64;
const TRACK_HEIGHT = 32;
const KNOB = 26;
const INSET = (TRACK_HEIGHT - KNOB) / 2;

interface ThemeToggleProps {
  style?: StyleProp<ViewStyle>;
  /** Use on the plum `surfaceInverse` panels — app headers, the ops sidebar,
   *  the portal nav — where the normal muted track would disappear. */
  onInverse?: boolean;
  /** Shrink to fit next to a small header button. */
  compact?: boolean;
}

/**
 * Light/dark switch. The knob slides between a sun and a moon, and pinning
 * either end also pins the preference (it stops following the OS setting).
 */
export function ThemeToggle({ style, onInverse = false, compact = false }: ThemeToggleProps) {
  const { mode, colors, toggle, shadow } = useTheme();
  const isDark = mode === 'dark';
  const scale = compact ? 0.82 : 1;

  const slide = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: isDark ? 1 : 0, useNativeDriver: true, speed: 16, bounciness: 6 }).start();
  }, [isDark, slide]);

  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [INSET, TRACK_WIDTH - KNOB - INSET],
  });

  const track = onInverse
    ? { backgroundColor: colors.inverseFillWeak, borderColor: colors.borderInverse }
    : { backgroundColor: colors.surfaceMutedAlt, borderColor: colors.borderMuted };
  const idleIcon = onInverse ? colors.textInverseMuted : colors.textMuted;

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={[styles.track, track, compact && { transform: [{ scale }] }, style]}
      hitSlop={8}
    >
      <View style={styles.icons} pointerEvents="none">
        <SunIcon size={15} color={isDark ? idleIcon : colors.onBrand} />
        <MoonIcon size={15} color={isDark ? colors.onBrand : idleIcon} />
      </View>
      <Animated.View
        pointerEvents="none"
        style={[styles.knob, { backgroundColor: colors.brand, transform: [{ translateX }] }, shadow.glow(withAlpha(colors.brand, 0.9))]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  icons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    zIndex: 2,
  },
  knob: {
    position: 'absolute',
    width: KNOB,
    height: KNOB,
    borderRadius: radius.pill,
    zIndex: 1,
  },
});
