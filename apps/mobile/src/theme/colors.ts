// "OneGridAI Pulse" — dormant/pastel revision. Same dark base as before,
// but desaturated: vivid indigo/cyan/emerald neon accents replaced with
// dustier, muted pastel hues (plum, powder blue, sage, terracotta-rose,
// sand) and the glow effects toned down to soft shadows rather than a
// bright halo — a calmer, quieter mood than the earlier "bold" pass.
export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  // Night scale — page/card/panel surfaces get *lighter* as they elevate.
  night900: '#141320',
  night800: '#1B1A28', // page background
  night700: '#242332', // card surface
  night600: '#2D2B3D', // muted panel / input / inset
  night500: '#3A3750', // hairlines, subtle borders

  // Dusty pastel accents
  plum500: '#6E6390',
  plum400: '#9C8FC7', // lighter, decorative gradient stop
  dustyBlue400: '#9FC6D6',
  sage500: '#6FA07B',
  sage600: '#547B60',
  sageLight400: '#93BFA0', // lighter, decorative gradient stop
  dustyRose400: '#D98D95',
  sand400: '#D9B98A',

  ink100: '#EEEAF5',
  ink300: '#C7C2D6',
  ink400: '#938DA6',
} as const;

export const colors = {
  primary: palette.plum500,
  secondary: palette.night600,
  accent: palette.dustyBlue400,
  cta: palette.sage500,
  ctaHover: palette.sage600,
  danger: palette.dustyRose400,
  warning: palette.sand400,

  page: palette.night800,
  surfaceCard: palette.night700,
  surfaceInverse: palette.plum500,
  surfaceAccent: palette.plum400,
  surfaceFooter: palette.night600,
  surfaceMuted: palette.night800,
  surfaceMutedAlt: palette.night600,

  textBody: palette.ink300,
  textHeading: palette.ink100,
  textMuted: palette.ink400,
  textInverse: palette.white,
  textInverseMuted: 'rgba(255,255,255,0.7)',
  textInverseMutedAlt: 'rgba(255,255,255,0.88)',

  borderDefault: palette.dustyBlue400,
  borderInverse: 'rgba(255,255,255,0.3)',
  borderHairline: palette.night500,
  borderMuted: palette.night500,
} as const;

// Gradient stop pairs for LinearGradient — softened to muted pastel duos
// (dusty plum → powder blue, deep sage → soft mint) instead of the earlier
// vivid indigo/cyan and bright emerald.
export const gradients = {
  brand: [palette.plum500, palette.dustyBlue400] as const,
  cta: [palette.sage600, palette.sageLight400] as const,
  dusk: [palette.night900, '#3A3350'] as const,
} as const;
