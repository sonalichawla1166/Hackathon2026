// Ported from _ds tokens/spacing.css (1rem = 18px in the web prototype).
export const spacing = {
  none: 0,
  xs: 4,
  sm: 9,
  md: 18,
  lg: 27,
  xl: 54,
  xxl: 90,
} as const;

// Rounder than the original system by design — part of the modern-redesign
// direction (softer, more contemporary shapes than the source prototype's
// tight 5px corners).
export const radius = {
  sm: 10,
  md: 16,
  pill: 999,
  chip: 12,
} as const;
