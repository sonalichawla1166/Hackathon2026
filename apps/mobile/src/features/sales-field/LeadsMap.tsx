import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SalesLead } from '@/api/types';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { MapCanvas } from '@/components/map/MapCanvas';
import type { LatLng, MapMarker } from '@/components/map/types';
import { outcomeColor } from './outcomeColors';

/** Default canvas height; a desktop column passes something taller. */
const VIEWPORT_HEIGHT = 230;

/**
 * The territory map: real OpenStreetMap tiles with a satellite layer, one pin
 * per lead and the rep's own position at the centre.
 *
 * Panning, zooming, the layer switcher and attribution all come from Leaflet
 * itself, which is why the hand-rolled zoom toolbar this used to carry is gone
 * — it would now be a second set of zoom buttons beside the map's own. What
 * stays app-side is the part Leaflet has no opinion about: tapping a pin opens
 * the lead callout docked under the map.
 */
export function LeadsMap({
  leads,
  onOpenLead,
  center,
  radiusKm,
  height = VIEWPORT_HEIGHT,
}: {
  leads: SalesLead[];
  onOpenLead: (id: string) => void;
  /** Where the rep is standing — the map opens here. */
  center: LatLng;
  /** Draws the search radius the leads were pulled from. */
  radiusKm?: number;
  height?: number;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = leads.find((l) => l.id === activeId) ?? null;

  const markers = useMemo<MapMarker[]>(
    () => [
      {
        id: '__rep',
        lat: center.lat,
        lng: center.lng,
        color: colors.cta,
        kind: 'me',
        label: 'You are here',
        selectable: false,
      },
      ...leads.map<MapMarker>((l) => ({
        id: l.id,
        lat: l.lat,
        lng: l.lng,
        color: l.knockedToday ? outcomeColor(l.lastOutcome, colors) : colors.accent,
        kind: 'pin',
        label: `${l.address}${l.unit ? `, ${l.unit}` : ''}`,
      })),
    ],
    [leads, center.lat, center.lng, colors]
  );

  return (
    <View style={styles.wrap}>
      <MapCanvas
        center={center}
        zoom={14}
        height={height}
        markers={markers}
        selectedId={activeId}
        onSelectMarker={setActiveId}
        radiusKm={radiusKm}
        label="Map of nearby leads"
      />

      {active && (
        <View style={styles.callout}>
          <View style={{ flex: 1 }}>
            <View style={styles.calloutTop}>
              <Text style={styles.calloutAddress} numberOfLines={1}>
                {active.address}
                {active.unit ? `, ${active.unit}` : ''}
              </Text>
              <Text style={styles.calloutDistance}>{active.distanceLabel}</Text>
            </View>
            <Text style={styles.calloutCustomer} numberOfLines={1}>
              {active.customerName} · {active.accountStatus}
            </Text>
            {active.lastOutcome && (
              <View style={{ marginTop: 6 }}>
                <Badge
                  label={active.knockedToday ? `Today: ${active.lastOutcome}` : `Last: ${active.lastOutcome}`}
                  bg={outcomeColor(active.lastOutcome, colors)}
                />
              </View>
            )}
          </View>
          <View style={{ gap: 8, alignItems: 'flex-end' }}>
            <Pressable onPress={() => setActiveId(null)} hitSlop={8}>
              <Text style={styles.calloutClose}>✕</Text>
            </Pressable>
            <Pressable onPress={() => onOpenLead(active.id)}>
              <Text style={styles.calloutView}>View lead ›</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 8 },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 2,
    borderColor: t.colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 12,
  },
  calloutTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  calloutAddress: { flex: 1, fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },
  calloutDistance: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.accent },
  calloutCustomer: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, marginTop: 3 },
  calloutClose: { fontFamily: fontFamily.bodyBold, fontSize: 14, color: t.colors.textMuted },
  calloutView: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.accent },
}));
