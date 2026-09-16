import React from 'react';
import { View, Text } from 'react-native';
import { useOutageMap } from '@/api/hooks';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function OutageMapWidget() {
  const styles = useStyles();
  const { colors } = useTheme();
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

const useStyles = makeStyles((t) => ({
  card: { backgroundColor: t.colors.surfaceMuted, borderRadius: radius.md, padding: 18 },
  title: { fontFamily: fontFamily.heading, fontSize: 14, color: t.colors.textHeading },
  map: {
    height: 130,
    marginTop: 12,
    borderRadius: radius.chip,
    backgroundColor: t.colors.primary,
    overflow: 'hidden',
  },
  caption: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 17, color: t.colors.textMuted, marginTop: 10 },
}));
