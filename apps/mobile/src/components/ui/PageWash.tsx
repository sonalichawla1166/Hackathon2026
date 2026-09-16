import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

/**
 * The soft page wash from the sign-in screen, reused behind an app shell so
 * cards sit on a graded ground instead of a flat fill.
 *
 * Absolutely positioned and non-interactive, so it adds depth without taking
 * part in layout — drop it in as the first child of a shell whose content
 * sits on a transparent background.
 */
export function PageWash() {
  const { gradients } = useTheme();
  return (
    <LinearGradient
      colors={gradients.canvas}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}
