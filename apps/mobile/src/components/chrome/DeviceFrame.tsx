import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { colors } from '@/theme';

/**
 * On native, this is the real app, so children render edge to edge.
 * On a wide web viewport (reviewing the concept in a browser, like the
 * original design canvas) it wraps the content in a phone-shaped bezel so
 * the four surfaces can be compared side by side, the way the source
 * `OneGridAI Platform.dc.html` prototype does.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const showBezel = Platform.OS === 'web' && width >= 720;

  if (!showBezel) {
    return <View style={styles.fill}>{children}</View>;
  }

  return (
    <View style={styles.bezelOuter}>
      <View style={styles.notch} />
      <View style={styles.screen}>{children}</View>
    </View>
  );
}

export function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const showChrome = Platform.OS === 'web' && width >= 900;

  if (!showChrome) {
    return <View style={styles.fill}>{children}</View>;
  }

  return (
    <View style={styles.browserOuter}>
      <View style={styles.browserBar}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, { backgroundColor: '#E6564C' }]} />
          <View style={[styles.dot, { backgroundColor: '#F5BD4F' }]} />
          <View style={[styles.dot, { backgroundColor: '#61C454' }]} />
        </View>
        <View style={styles.urlBar}>
          <View style={styles.urlText}>{null}</View>
        </View>
      </View>
      <View style={styles.browserScreen}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%' },
  bezelOuter: {
    width: 402,
    height: 874,
    borderRadius: 54,
    backgroundColor: '#0F2835',
    padding: 12,
    alignItems: 'center',
  },
  notch: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    width: 120,
    height: 26,
    borderRadius: 16,
    backgroundColor: '#0F2835',
    zIndex: 2,
  },
  screen: {
    flex: 1,
    width: '100%',
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: colors.surfaceCard,
  },
  browserOuter: {
    width: '100%',
    maxWidth: 1280,
    height: 780,
    borderRadius: 10,
    backgroundColor: '#DADDE0',
    padding: 6,
    overflow: 'hidden',
  },
  browserBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 8 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  urlBar: { flex: 1, backgroundColor: '#fff', borderRadius: 5, height: 26, justifyContent: 'center' },
  urlText: { paddingHorizontal: 10 },
  browserScreen: { flex: 1, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.surfaceCard },
});
