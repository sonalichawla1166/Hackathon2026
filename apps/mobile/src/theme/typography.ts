// Ported from _ds tokens/typography.css and tokens/fonts.css.
// Root font-size in the web prototype is 18px (1rem = 18px); sizes below are
// converted from rem to px so React Native's unitless numbers line up exactly.
export const fontFamily = {
  heading: 'WorkSans_700Bold',
  headingMedium: 'WorkSans_600SemiBold',
  body: 'Roboto-Regular',
  bodyMedium: 'Roboto-Medium',
  bodyBold: 'Roboto-Bold',
  bodyBlack: 'Roboto-Black',
  mono: 'ui-monospace, Menlo, monospace',
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
} as const;

export const type = {
  h1: { fontSize: 42, lineHeight: 46 },
  h2: { fontSize: 27, lineHeight: 31 },
  h3: { fontSize: 22, lineHeight: 26 },
  h4: { fontSize: 19, lineHeight: 23 },
  h5: { fontSize: 17, lineHeight: 21 },
  eyebrow: { fontSize: 9.5, lineHeight: 11, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  body: { fontSize: 13.5, lineHeight: 20 },
  bodySmall: { fontSize: 12, lineHeight: 17 },
  caption: { fontSize: 10.5, lineHeight: 13 },
};
