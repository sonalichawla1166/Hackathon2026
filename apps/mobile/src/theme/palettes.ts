// OneGridAI colour system — two full palettes behind one shape.
//
// `dark` keeps the existing "Pulse" night scale (dusty plum / powder blue /
// sage on near-black). `light` is the new cream-and-amber scheme built on
// CG Infinity's brand amber (#FCB518, sampled from the corporate mark).
//
// Both palettes expose the *same* keys, so every screen can read
// `theme.colors.x` and get something sensible in either mode. Never import a
// palette directly from a screen — go through `useTheme()` so a mode switch
// re-renders.

export type ThemeMode = 'light' | 'dark';

const brand = {
  /** CG Infinity corporate amber, sampled from the official logo mark. */
  amber500: '#FCB518',
  amber400: '#FFD06B',
  amber600: '#E09A00',
  /** Ink that stays readable on top of amber in both modes. */
  onAmber: '#241B05',
} as const;

const night = {
  night900: '#141320',
  night800: '#1B1A28',
  night700: '#242332',
  night600: '#2D2B3D',
  night500: '#3A3750',
} as const;

const cream = {
  cream50: '#FFFFFF',
  cream100: '#FAF6EC',
  cream200: '#F3ECDD',
  cream300: '#E8DFCB',
  cream400: '#D8CCB2',
} as const;

// The plum `surfaceInverse` panels are identical in both modes, so everything
// that sits on them shares one set of values.
const INVERSE = {
  textMuted: 'rgba(255,255,255,0.73)',
  textMutedAlt: 'rgba(255,255,255,0.9)',
  fillWeak: 'rgba(255,255,255,0.12)',
  fillMedium: 'rgba(255,255,255,0.18)',
  fillStrong: 'rgba(255,255,255,0.3)',
  border: 'rgba(255,255,255,0.35)',
  borderSoft: 'rgba(255,255,255,0.18)',
} as const;

const ink = {
  ink900: '#1E1A12',
  ink700: '#4E483C',
  ink500: '#8C8371',
  light100: '#EEEAF5',
  light300: '#C7C2D6',
  light400: '#938DA6',
} as const;

export interface ThemeColors {
  brand: string;
  brandSoft: string;
  brandStrong: string;
  onBrand: string;
  /** Amber tuned for text and hairlines — plain amber fails contrast as type. */
  brandInk: string;

  primary: string;
  secondary: string;
  accent: string;
  cta: string;
  ctaHover: string;
  onCta: string;
  /** Ink that stays readable on an `accent` fill. */
  onAccent: string;
  success: string;
  danger: string;
  /** Alert tint for type sitting on the plum `surfaceInverse` panels, which
   *  stay plum in both modes — plain `danger` disappears against them. */
  dangerSoft: string;
  warning: string;

  page: string;
  surfaceCard: string;
  surfaceInverse: string;
  surfaceAccent: string;
  surfaceFooter: string;
  surfaceMuted: string;
  surfaceMutedAlt: string;
  /** Canvas behind the schematic outage maps — stays slate in both modes so
   *  the white "you are here" dot and the coloured pins keep working. */
  surfaceMapCanvas: string;
  /** Inset behind monospaced payload/code blocks. */
  surfaceCode: string;
  /** Fill for text inputs — lighter than `surfaceMutedAlt` so a field reads as
   *  an opening in the card rather than another tile on it. */
  surfaceField: string;
  /** Translucent fill for glass panels laid over the background art. */
  surfaceScrim: string;

  textBody: string;
  textHeading: string;
  textMuted: string;
  // ── On the plum `surfaceInverse` panels ──────────────────────────────
  // These panels are plum in BOTH modes, so the whole family is shared: use
  // them instead of literal white/rgba so one edit re-tints every panel.
  textInverse: string;
  textInverseMuted: string;
  textInverseMutedAlt: string;
  /** Solid white for dots, pins and glyphs on an inverse panel (not type). */
  inverseSolid: string;
  inverseFillWeak: string;
  inverseFillMedium: string;
  inverseFillStrong: string;

  borderDefault: string;
  borderInverse: string;
  borderInverseSoft: string;
  borderHairline: string;
  borderMuted: string;
  borderFocus: string;
}

export interface ThemeGradients {
  /** The app chrome: headers, the ops sidebar, the portal hero, the active
   *  tab pill and `Button variant="primary"`. Runs from the plum base into a
   *  deep CG Infinity amber, so the brand reads across every surface while
   *  staying dark enough for the white type already on those panels. */
  brand: readonly [string, string, ...string[]];
  cta: readonly [string, string];
  /** Small gradient controls (`Button variant="primary"`). The 3-stop `brand`
   *  ramp turns muddy when squeezed into a button. */
  control: readonly [string, string];
  dusk: readonly [string, string];
  /** Soft wash used behind the login artwork. */
  canvas: readonly [string, string, string];
}

export interface ThemeShadow {
  card: object;
  lifted: object;
  glow: (color: string) => object;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  gradients: ThemeGradients;
  shadow: ThemeShadow;
}

const darkColors: ThemeColors = {
  brand: brand.amber500,
  brandSoft: brand.amber400,
  brandStrong: brand.amber600,
  onBrand: brand.onAmber,
  brandInk: brand.amber400,

  primary: '#6E6390',
  secondary: night.night600,
  accent: '#9FC6D6',
  cta: brand.amber500,
  ctaHover: brand.amber600,
  onCta: brand.onAmber,
  onAccent: '#16202A',
  success: '#6FA07B',
  danger: '#D98D95',
  dangerSoft: '#EDB0B6',
  warning: '#D9B98A',

  page: night.night800,
  surfaceCard: night.night700,
  surfaceInverse: '#6E6390',
  surfaceAccent: '#9C8FC7',
  surfaceFooter: night.night600,
  surfaceMuted: night.night800,
  surfaceMutedAlt: night.night600,
  surfaceMapCanvas: '#253541',
  surfaceCode: night.night900,
  surfaceField: night.night600,
  surfaceScrim: 'rgba(36,35,50,0.82)',

  textBody: ink.light300,
  textHeading: ink.light100,
  textMuted: ink.light400,
  textInverse: '#FFFFFF',
  textInverseMuted: INVERSE.textMuted,
  textInverseMutedAlt: INVERSE.textMutedAlt,
  inverseSolid: '#FFFFFF',
  inverseFillWeak: INVERSE.fillWeak,
  inverseFillMedium: INVERSE.fillMedium,
  inverseFillStrong: INVERSE.fillStrong,

  borderDefault: '#9FC6D6',
  borderInverse: INVERSE.border,
  borderInverseSoft: INVERSE.borderSoft,
  borderHairline: night.night500,
  borderMuted: night.night500,
  borderFocus: brand.amber500,
};

const lightColors: ThemeColors = {
  brand: brand.amber500,
  brandSoft: brand.amber400,
  brandStrong: brand.amber600,
  onBrand: brand.onAmber,
  brandInk: '#8A6200',

  primary: '#6E6390',
  secondary: cream.cream200,
  accent: '#3F7A91',
  cta: brand.amber500,
  ctaHover: brand.amber600,
  onCta: brand.onAmber,
  onAccent: '#FFFFFF',
  success: '#4E8C63',
  danger: '#C2515C',
  dangerSoft: '#EDB0B6',
  warning: '#C08324',

  page: cream.cream100,
  surfaceCard: cream.cream50,
  surfaceInverse: '#6E6390',
  surfaceAccent: '#8A7CB8',
  surfaceFooter: cream.cream200,
  surfaceMuted: cream.cream200,
  surfaceMutedAlt: cream.cream200,
  surfaceMapCanvas: '#2F4356',
  surfaceCode: '#F1EDE3',
  surfaceField: '#FCFAF5',
  surfaceScrim: 'rgba(255,255,255,0.86)',

  textBody: ink.ink700,
  textHeading: ink.ink900,
  textMuted: ink.ink500,
  textInverse: '#FFFFFF',
  textInverseMuted: INVERSE.textMuted,
  textInverseMutedAlt: INVERSE.textMutedAlt,
  inverseSolid: '#FFFFFF',
  inverseFillWeak: INVERSE.fillWeak,
  inverseFillMedium: INVERSE.fillMedium,
  inverseFillStrong: INVERSE.fillStrong,

  borderDefault: '#3F7A91',
  borderInverse: INVERSE.border,
  borderInverseSoft: INVERSE.borderSoft,
  borderHairline: cream.cream300,
  borderMuted: cream.cream300,
  borderFocus: brand.amber600,
};

const darkGradients: ThemeGradients = {
  brand: ['#6E6390', '#6E6390', '#8A5A00'],
  cta: [brand.amber500, brand.amber400],
  control: ['#6E6390', '#9C8FC7'],
  dusk: [night.night900, '#3A3350'],
  canvas: [night.night900, '#221F33', '#1B1A28'],
};

const lightGradients: ThemeGradients = {
  brand: ['#6E6390', '#6E6390', '#8A5A00'],
  cta: [brand.amber400, brand.amber500],
  control: ['#6E6390', '#8A7CB8'],
  dusk: [cream.cream100, cream.cream200],
  canvas: ['#FFFDF6', cream.cream100, cream.cream200],
};

// Dark surfaces swallow a plain black drop shadow, so the dark scale leans on
// Android elevation plus a deep black shadow. On cream the same values look
// like soot, so the light scale uses a warm brown shadow at low opacity.
const darkShadow: ThemeShadow = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 3 },
  lifted: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.38, shadowRadius: 20, elevation: 6 },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  }),
};

const lightShadow: ThemeShadow = {
  card: { shadowColor: '#6B5A3A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 2 },
  lifted: { shadowColor: '#6B5A3A', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.16, shadowRadius: 28, elevation: 6 },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  }),
};

export const darkTheme: Theme = { mode: 'dark', colors: darkColors, gradients: darkGradients, shadow: darkShadow };
export const lightTheme: Theme = { mode: 'light', colors: lightColors, gradients: lightGradients, shadow: lightShadow };

export const themes: Record<ThemeMode, Theme> = { dark: darkTheme, light: lightTheme };

/** Mix a hex colour with an alpha channel. Returns the input untouched if it
 *  is not a 6-digit hex (already rgba, a named colour, …). */
export function withAlpha(hex: string, alpha: number): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return hex;
  const int = parseInt(match[1], 16);
  return `rgba(${(int >> 16) & 255},${(int >> 8) & 255},${int & 255},${alpha})`;
}
