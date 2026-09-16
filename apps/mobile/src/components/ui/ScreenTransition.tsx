import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { motion } from '@/theme';

// Wrap a screen's root view and give it a `key` that changes with the active
// tab/view (e.g. `key={screen}`) so switching screens re-triggers a small
// fade + rise instead of an instant cut — used across every surface's shell.
export function ScreenTransition({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.entrance.duration, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: motion.entrance.duration, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  // `flexGrow` lets a screen that wants the full height (the loading state)
  // actually get it; normal content still lays out from the top.
  return <Animated.View style={[{ flexGrow: 1, opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}
