import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOutageMap } from '@/api/hooks';
import { colors, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function OutageMapWidget() {
  const { data, isPending, isError, error, refetch } = useOutageMap();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Live outage map</Text>
      {isPending && <LoadingState label="Loading outage map…" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}
      {data && (
        <>
          <View style={styles.map}>
            {data.pins.map((p, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  width: p.d,
                  height: p.d,
                  borderRadius: p.d / 2,
                  backgroundColor: p.danger ? colors.danger : colors.accent,
                  borderWidth: 2,
                  borderColor: colors.primary,
                }}
              />
            ))}
          </View>
          <Text style={styles.caption}>{data.portalCaption}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 18 },
  title: { fontFamily: fontFamily.heading, fontSize: 14, color: colors.textHeading },
  map: {
    height: 130,
    marginTop: 12,
    borderRadius: radius.chip,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  caption: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 17, color: colors.textMuted, marginTop: 10 },
});
