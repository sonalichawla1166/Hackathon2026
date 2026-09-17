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

  // The real events, not the abstract pins — and no "you are here", since
  // nobody is signed in on the public portal.
  const markers: MapMarker[] =
    data?.events.map((e) => ({
      id: e.id,
      lat: e.lat,
      lng: e.lng,
      color: e.severity === 'major' ? colors.danger : e.severity === 'minor' ? colors.cta : colors.accent,
      kind: 'dot' as const,
      size: 14 + Math.round(Math.sqrt(e.customers) * 0.6),
      label: `${e.area} — ${e.customers.toLocaleString('en-US')} customers`,
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
