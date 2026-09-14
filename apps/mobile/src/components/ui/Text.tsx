import React from 'react';
import { Text as RNText, TextProps, StyleSheet, Platform } from 'react-native';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';

const monoFamily = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });

interface Props extends TextProps {
  color?: string;
}

export function Eyebrow({ style, color = colors.accent, ...rest }: Props) {
  return <RNText {...rest} style={[styles.eyebrow, { color }, style]} />;
}

export function H1({ style, color = colors.textHeading, ...rest }: Props) {
  return <RNText {...rest} style={[styles.h1, { color }, style]} />;
}

export function H2({ style, color = colors.textHeading, ...rest }: Props) {
  return <RNText {...rest} style={[styles.h2, { color }, style]} />;
}

export function H3({ style, color = colors.textHeading, ...rest }: Props) {
  return <RNText {...rest} style={[styles.h3, { color }, style]} />;
}

export function H4({ style, color = colors.textHeading, ...rest }: Props) {
  return <RNText {...rest} style={[styles.h4, { color }, style]} />;
}

export function BodyText({ style, color = colors.textMuted, ...rest }: Props) {
  return <RNText {...rest} style={[styles.body, { color }, style]} />;
}

export function BodyStrong({ style, color = colors.textHeading, ...rest }: Props) {
  return <RNText {...rest} style={[styles.bodyStrong, { color }, style]} />;
}

export function Caption({ style, color = colors.textMuted, ...rest }: Props) {
  return <RNText {...rest} style={[styles.caption, { color }, style]} />;
}

export function MonoText({ style, color = colors.textHeading, ...rest }: Props) {
  return <RNText {...rest} style={[styles.mono, { color }, style]} />;
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  h1: { fontFamily: fontFamily.heading, fontSize: 34, lineHeight: 38 },
  h2: { fontFamily: fontFamily.heading, fontSize: 24, lineHeight: 28 },
  h3: { fontFamily: fontFamily.heading, fontSize: 19, lineHeight: 23 },
  h4: { fontFamily: fontFamily.heading, fontSize: 15, lineHeight: 19 },
  body: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 19 },
  bodyStrong: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, lineHeight: 18 },
  caption: { fontFamily: fontFamily.body, fontSize: 11, lineHeight: 15 },
  mono: { fontFamily: monoFamily, fontWeight: '700', fontSize: 12, lineHeight: 16 },
});
