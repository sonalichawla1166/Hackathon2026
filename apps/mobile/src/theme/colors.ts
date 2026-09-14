// Ported from _ds/brinks-home-bhx-design-system/tokens/colors.css
export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  warmGray: '#DCD8D1',
  darkGray: '#373B3D',
  darkBlue: '#0F2835',
  lightBlue: '#1E5B71',
  ctaGreen: '#17824A',
  ctaGreenHover: '#09A854',
  red: '#E61E2E',
  blue1: '#253541',
  blue4: '#4D6F84',
  gray200: '#ECEEEF',
  hairline: '#7E8183',
} as const;

export const colors = {
  primary: palette.darkBlue,
  secondary: palette.darkGray,
  accent: palette.lightBlue,
  cta: palette.ctaGreen,
  ctaHover: palette.ctaGreenHover,
  danger: palette.red,

  page: palette.warmGray,
  surfaceCard: palette.white,
  surfaceInverse: palette.darkBlue,
  surfaceAccent: palette.lightBlue,
  surfaceFooter: palette.blue1,
  surfaceMuted: palette.warmGray,
  surfaceMutedAlt: palette.gray200,

  textBody: palette.darkBlue,
  textHeading: palette.darkBlue,
  textMuted: palette.darkGray,
  textInverse: palette.white,
  textInverseMuted: 'rgba(255,255,255,0.73)',
  textInverseMutedAlt: 'rgba(255,255,255,0.9)',

  borderDefault: palette.lightBlue,
  borderInverse: 'rgba(255,255,255,0.35)',
  borderHairline: palette.hairline,
  borderMuted: palette.warmGray,
} as const;
