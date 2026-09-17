import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { OutageEvent, OutageSeverity } from '@/api/types';
import { useOutageMap } from '@/api/hooks';
import { makeStyles, radius, useTheme, withAlpha, type Theme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { MapCanvas } from '@/components/map/MapCanvas';
import type { MapMarker } from '@/components/map/types';

/** Severity reads off the theme, never a literal — same rule as the stage colours. */
function severityColor(severity: OutageSeverity, colors: Theme['colors']): string {
  switch (severity) {
    case 'major':
      return colors.danger;
    case 'minor':
      return colors.cta;
    case 'planned':
      return colors.accent;
    case 'restoring':
      return colors.brandInk;
  }
}

/**
 * Outages: every active event plotted on the real map, with the list beside it.
 *
 * Selecting a row lights its pin and vice versa — the map and the list are two
 * views of one selection, so neither is decoration.
 */
export function OutagesSection({ compact }: { compact: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isPending, isError, error, refetch } = useOutageMap();

  const markers = useMemo<MapMarker[]>(() => {
    const events = data?.events ?? [];
    if (events.length > 0) {
      return events.map((e) => ({
        id: e.id,
        lat: e.lat,
        lng: e.lng,
        // Bigger dot for more customers, on a gentle curve so one large event
        // does not bury the rest.
        size: 14 + Math.round(Math.sqrt(e.customers) * 0.6),
        color: severityColor(e.severity, colors),
        kind: 'dot',
        label: `${e.area} — ${e.customers.toLocaleString('en-US')} customers`,
      }));
    }
    // An API build without events still sends the pins, and those always have
    // coordinates. Plot them rather than showing an empty map.
    return (data?.pins ?? []).map((p, i) => ({
      id: `pin-${i}`,
      lat: p.lat,
      lng: p.lng,
      size: p.d,
      color: p.danger ? colors.danger : colors.accent,
      kind: 'dot' as const,
      label: p.danger ? 'Confirmed outage' : 'Reported fault',
      selectable: false,
    }));
  }, [data?.events, data?.pins, colors]);

  if (isPending) return <LoadingState label="Loading active outages…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const totals = data.events.reduce(
    (acc, e) => ({
      customers: acc.customers + e.customers,
      crews: acc.crews + e.crews,
      restoring: acc.restoring + (e.severity === 'restoring' ? 1 : 0),
    }),
    { customers: 0, crews: 0, restoring: 0 }
  );

  const kpis = [
    { k: 'Active events', v: String(data.events.length) },
    { k: 'Customers affected', v: totals.customers.toLocaleString('en-US') },
    { k: 'Crews assigned', v: String(totals.crews) },
    { k: 'Power restoring', v: String(totals.restoring) },
  ];

  const summary = (
    <View style={[styles.kpiRow, compact && styles.kpiRowCompact]}>
      {kpis.map((k) => (
        <View key={k.k} style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{k.v}</Text>
          <Text style={styles.kpiLabel}>{k.k}</Text>
        </View>
      ))}
    </View>
  );

  const map = (
    <View style={styles.mapCard}>
      <MapCanvas
        center={data.center}
        zoom={13}
        height={compact ? 240 : 460}
        markers={markers}
        selectedId={selectedId}
        onSelectMarker={setSelectedId}
        label="Map of active outages"
      />
    </View>
  );

  const list = (
    <View style={styles.list}>
      <Text style={styles.listTitle}>Active events</Text>
      {data.events.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No event detail from this API build</Text>
          <Text style={styles.emptyBody}>
            The map is showing reported positions, but the per-event breakdown needs a newer API. Restart the
            backend in apps/backend and reload.
          </Text>
        </View>
      )}
      {data.events.map((e) => (
        <EventRow
          key={e.id}
          event={e}
          selected={e.id === selectedId}
          onPress={() => setSelectedId((cur) => (cur === e.id ? null : e.id))}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {summary}
      {compact ? (
        <>
          {map}
          {list}
        </>
      ) : (
        <View style={styles.columns}>
          <View style={styles.mapCol}>{map}</View>
          <View style={styles.listCol}>{list}</View>
        </View>
      )}
      <Text style={styles.note}>{data.portalCaption}</Text>
    </View>
  );
}

function EventRow({ event, selected, onPress }: { event: OutageEvent; selected: boolean; onPress: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tone = severityColor(event.severity, colors);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.row, selected && { borderColor: tone, backgroundColor: withAlpha(tone, 0.08) }]}
    >
      <View style={[styles.rowBar, { backgroundColor: tone }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.rowTop}>
          <Text style={styles.rowArea} numberOfLines={1}>{event.area}</Text>
          <View style={[styles.statusPill, { backgroundColor: withAlpha(tone, 0.16) }]}>
            <Text style={[styles.statusText, { color: tone }]}>{event.status}</Text>
          </View>
        </View>
        <Text style={styles.rowCause} numberOfLines={1}>{event.cause}</Text>
        <View style={styles.rowFacts}>
          <Text style={styles.rowFact}>{event.customers.toLocaleString('en-US')} customers</Text>
          <Text style={styles.rowFact}>{event.crews === 1 ? '1 crew' : `${event.crews} crews`}</Text>
          <Text style={styles.rowEta}>{event.eta}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 18 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  mapCol: { flex: 1.35, minWidth: 0 },
  listCol: { flex: 1, minWidth: 0 },

  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiRowCompact: { flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: 130, backgroundColor: t.colors.surfaceMuted, borderRadius: radius.md, padding: 14 },
  kpiValue: { fontFamily: fontFamily.heading, fontSize: 24, color: t.colors.textHeading },
  kpiLabel: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted, marginTop: 3 },

  mapCard: {
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    borderRadius: radius.md,
    overflow: 'hidden',
  },

  list: { gap: 8 },
  listTitle: { fontFamily: fontFamily.heading, fontSize: 14, color: t.colors.textHeading, marginBottom: 2 },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 2,
    borderColor: t.colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 12,
  },
  // A severity stripe, so the list is readable without matching pin colours.
  rowBar: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowArea: { flex: 1, fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading },
  statusPill: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  statusText: { fontFamily: fontFamily.bodyBold, fontSize: 10.5 },
  rowCause: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, marginTop: 4 },
  rowFacts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 7 },
  rowFact: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted },
  rowEta: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: t.colors.accent },

  note: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, lineHeight: 17 },

  // Same shape the maintenance queue uses when its table has no rows yet.
  emptyCard: {
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    borderRadius: radius.md,
    padding: 18,
    gap: 6,
  },
  emptyTitle: { fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },
  emptyBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, lineHeight: 18 },
}));
