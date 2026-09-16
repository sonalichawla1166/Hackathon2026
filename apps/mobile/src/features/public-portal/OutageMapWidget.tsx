import React from 'react';
import { View, Text } from 'react-native';
import { useOutageMap } from '@/api/hooks';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { MapCanvas } from '@/components/map/MapCanvas';
import type { MapMarker } from '@/components/map/types';

export function OutageMapWidget() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { data, isPending, isError, error, refetch } = useOutageMap();

  // No "you are here" on the public portal — nobody is signed in.
  const markers: MapMarker[] =
    data?.pins.map((p, i) => ({
      id: `pin-${i}`,
      lat: p.lat,
      lng: p.lng,
      color: p.danger ? colors.danger : colors.accent,
      kind: 'dot' as const,
      size: p.d,
      label: p.danger ? 'Confirmed outage' : 'Reported fault',
      selectable: false,
    })) ?? [];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Live outage map</Text>
      {isPending && <LoadingState label="Loading outage map…" inline />}
      {isError && <ErrorState error={error} onRetry={refetch} />}
      {data && (
        <>
          <View style={styles.map}>
            <MapCanvas
              center={data.center}
              zoom={13}
              height={200}
              markers={markers}
              label="Live map of active outages"
            />
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
  map: { marginTop: 12, borderRadius: radius.chip, overflow: 'hidden' },
  caption: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 17, color: t.colors.textMuted, marginTop: 10 },
}));
