import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, G, Line, Path, Rect, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { useTheme, withAlpha } from '@/theme';

/**
 * Decorative artwork behind the sign-in card.
 *
 * Hand-drawn line art in the spirit of the reference design, but the subject
 * is OneGridAI's own domain: a transmission pylon, a rooftop solar array, a
 * wind turbine and a meter panel, wired together by a power line that carries
 * a few "signal" pulses. Drawn as vectors rather than a bitmap so it stays
 * crisp at every screen size and re-tints itself for light and dark mode.
 *
 * Purely decorative: it is never focusable and ignores touches.
 */
export function AuthBackdrop() {
  const { colors, gradients, mode } = useTheme();

  const strokeStrong = withAlpha(colors.textHeading, mode === 'dark' ? 0.2 : 0.3);
  const strokeSoft = withAlpha(colors.textHeading, mode === 'dark' ? 0.12 : 0.18);
  const accent = colors.brand;
  const accentSoft = withAlpha(colors.brand, mode === 'dark' ? 0.22 : 0.35);
  const blobA = withAlpha(colors.brand, mode === 'dark' ? 0.16 : 0.26);
  const blobB = withAlpha(mode === 'dark' ? colors.primary : colors.brandSoft, mode === 'dark' ? 0.24 : 0.3);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={gradients.canvas} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1200 820" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgGradient id="haloA" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={blobA} />
            <Stop offset="1" stopColor={blobA} stopOpacity={0} />
          </SvgGradient>
          <SvgGradient id="haloB" x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={blobB} />
            <Stop offset="1" stopColor={blobB} stopOpacity={0} />
          </SvgGradient>
        </Defs>

        {/* Soft colour haloes — the only filled shapes, so the art reads as
            light line-work rather than a busy illustration. */}
        <Circle cx={160} cy={130} r={260} fill="url(#haloA)" />
        <Circle cx={1060} cy={690} r={300} fill="url(#haloB)" />

        {/* Ground line the whole scene stands on. */}
        <Line x1={0} y1={690} x2={1200} y2={690} stroke={strokeSoft} strokeWidth={2} />

        {/* ── Transmission pylon, left ────────────────────────────── */}
        <G stroke={strokeStrong} strokeWidth={2.4} fill="none" strokeLinecap="round">
          <Path d="M120 690 L168 420 M248 690 L200 420 M168 420 L200 420" />
          <Path d="M150 560 L218 560 M136 620 L232 620 M158 490 L210 490" />
          <Path d="M168 420 L200 420 M184 420 L184 392" />
          <Path d="M120 452 L248 452" />
          <Path d="M120 452 L120 468 M248 452 L248 468 M184 392 L184 380" />
          <Path d="M144 500 L184 560 M224 500 L184 560 M144 560 L184 620 M224 560 L184 620" />
        </G>

        {/* ── Power line sweeping to the right, with signal pulses ── */}
        <Path d="M120 452 C 380 540, 520 360, 760 452" stroke={accentSoft} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Path d="M248 452 C 470 546, 600 372, 820 452" stroke={strokeSoft} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Circle cx={420} cy={487} r={6} fill={accent} opacity={0.55} />
        <Circle cx={588} cy={419} r={4.5} fill={accent} opacity={0.4} />

        {/* ── Rooftop solar array, right ──────────────────────────── */}
        <G stroke={strokeStrong} strokeWidth={2.4} fill="none" strokeLinejoin="round">
          <Path d="M812 690 L884 520 L1088 520 L1016 690 Z" />
          <Path d="M860 580 L1064 580 M836 636 L1040 636" />
          <Path d="M932 520 L884 690 M980 520 L932 690" />
          <Path d="M950 520 L950 470 M950 470 L1010 430" />
        </G>
        {/* Sun glint on the array. */}
        <Circle cx={1010} cy={430} r={26} stroke={accent} strokeWidth={2.4} fill="none" opacity={0.7} />
        <G stroke={accent} strokeWidth={2.2} strokeLinecap="round" opacity={0.5}>
          <Path d="M1010 388 L1010 374 M1010 486 L1010 472 M1052 430 L1066 430 M954 430 L968 430" />
          <Path d="M1042 398 L1052 388 M968 472 L978 462 M1042 462 L1052 472 M968 388 L978 398" />
        </G>

        {/* ── Wind turbine, mid-right background ──────────────────── */}
        <G stroke={strokeSoft} strokeWidth={2.2} fill="none" strokeLinecap="round">
          <Path d="M690 690 L690 470" />
          <Path d="M690 470 L690 388 M690 470 L762 512 M690 470 L618 512" />
        </G>
        <Circle cx={690} cy={470} r={7} stroke={strokeStrong} strokeWidth={2.2} fill="none" />

        {/* ── Smart-meter panel, foreground left ──────────────────── */}
        <G stroke={strokeStrong} strokeWidth={2.4} fill="none" strokeLinejoin="round">
          <Rect x={332} y={556} width={150} height={134} rx={12} />
          <Path d="M356 596 L458 596 M356 628 L420 628" />
        </G>
        <Circle cx={446} cy={660} r={11} stroke={accent} strokeWidth={2.4} fill="none" />

        {/* ── Doodles: the loose squiggles and dot grid from the
             reference layout, kept sparse so they stay background. ── */}
        <Path
          d="M78 236 C 112 202, 148 268, 184 234 C 218 202, 252 266, 288 232"
          stroke={strokeSoft}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M918 196 C 950 162, 986 228, 1022 194 C 1056 162, 1090 226, 1126 192"
          stroke={strokeSoft}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
        <G fill={accentSoft}>
          {DOT_GRID.map(([cx, cy]) => (
            <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4} />
          ))}
        </G>
        <Path d="M520 250 C 560 210, 600 300, 648 250" stroke={accentSoft} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Path d="M648 250 L634 240 M648 250 L636 264" stroke={accentSoft} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

/** Four columns of five dots, echoing the reference design's dotted blocks. */
const DOT_GRID: ReadonlyArray<readonly [number, number]> = Array.from({ length: 20 }, (_, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return [332 + col * 28, 300 + row * 28] as const;
});
