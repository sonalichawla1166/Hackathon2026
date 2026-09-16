import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { useTheme, withAlpha } from '@/theme';

/**
 * The page ground shared by every surface inside the app.
 *
 * Same recipe as the sign-in screen: a graded wash plus two soft brand haloes
 * and a couple of loose strokes, so a screen full of cards sits on something
 * rather than a flat fill. Deliberately quieter than the sign-in artwork —
 * this sits behind live data, not a single card.
 *
 * Absolutely positioned and non-interactive, so it never takes part in layout.
 * Drop it in as the first child of a shell whose content is transparent.
 */
export function PageWash() {
  const { colors, gradients, mode } = useTheme();

  const halo = withAlpha(colors.brand, mode === 'dark' ? 0.13 : 0.2);
  const haloAlt = withAlpha(mode === 'dark' ? colors.primary : colors.brandSoft, mode === 'dark' ? 0.2 : 0.22);
  const line = withAlpha(colors.textHeading, mode === 'dark' ? 0.07 : 0.1);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient colors={gradients.canvas} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />

      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 800 1200" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgGradient id="wash-a" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={halo} />
            <Stop offset="1" stopColor={halo} stopOpacity={0} />
          </SvgGradient>
          <SvgGradient id="wash-b" x1="1" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={haloAlt} />
            <Stop offset="1" stopColor={haloAlt} stopOpacity={0} />
          </SvgGradient>
        </Defs>

        <Circle cx={640} cy={140} r={300} fill="url(#wash-a)" />
        <Circle cx={90} cy={980} r={340} fill="url(#wash-b)" />

        {/* Two power-line sweeps, echoing the sign-in artwork at a whisper. */}
        <Path d="M-40 430 C 220 520, 420 330, 840 450" stroke={line} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d="M-40 790 C 260 700, 460 900, 840 800" stroke={line} strokeWidth={2} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}
