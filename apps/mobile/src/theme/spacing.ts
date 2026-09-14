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

// Dark surfaces barely show a plain black drop shadow, so `card`/`lifted`
// lean on Android's `elevation` (which still lightens/darkens correctly on
// dark backgrounds) plus a faint black shadow for iOS/web. `glow` used to be
// a bright neon halo; the dormant/pastel pass turns it into a soft, barely-
// there tinted shadow instead — present but quiet, not a punchy glow.
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 3,
  },
  lifted: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  }),
} as const;
