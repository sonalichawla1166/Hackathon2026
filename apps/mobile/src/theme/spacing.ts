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

export const radius = {
  sm: 5,
  md: 5.4, // .3rem
  pill: 999,
  chip: 3.2, // .18rem
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 2,
  },
  lifted: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 4,
  },
} as const;
