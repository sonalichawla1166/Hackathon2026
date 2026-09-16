import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';

// The official CG Infinity mark (assets/images/cg-infinity-logo.png). It is a
// single-colour amber glyph on transparency, so it sits correctly on both the
// cream and the night surfaces without a light/dark variant.
const MARK = require('../../../assets/images/cg-infinity-logo.png');

interface LogoProps {
  size?: number;
  /** Show the "CG Infinity" wordmark beside the glyph. */
  withWordmark?: boolean;
  /** Secondary line under the wordmark, e.g. the product name. */
  tagline?: string;
}

export function CgInfinityLogo({ size = 40, withWordmark = true, tagline }: LogoProps) {
  const { colors } = useTheme();

  const mark = <Image source={MARK} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel="CG Infinity" />;

  if (!withWordmark) return mark;

  return (
    <View style={styles.row}>
      {mark}
      <View style={styles.text}>
        <Text style={[styles.wordmark, { color: colors.textHeading, fontSize: size * 0.46 }]}>CG Infinity</Text>
        {tagline ? <Text style={[styles.tagline, { color: colors.textMuted, fontSize: size * 0.25 }]}>{tagline}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { justifyContent: 'center' },
  wordmark: { fontFamily: fontFamily.heading, letterSpacing: -0.3 },
  tagline: { fontFamily: fontFamily.bodyMedium, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 },
});
