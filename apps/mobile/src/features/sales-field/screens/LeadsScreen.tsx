import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useUiStore } from '@/state/store';
import { useSalesLeads } from '@/api/hooks';
import { makeStyles, radius, useTheme, useIsDesktop } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { useSalesLocation } from '../useDeviceLocation';
import { LeadsMap } from '../LeadsMap';
import { outcomeColor } from '../outcomeColors';
import { stageColor } from '../stageColors';

export function LeadsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const desktop = useIsDesktop();
  const { coords, usingDeviceLocation, status, useDeviceLocation, useTerritoryBase } = useSalesLocation();
  const radiusKm = useUiStore((s) => s.salesRadiusKm);
  const setRadiusKm = useUiStore((s) => s.setSalesRadiusKm);
  const selectLead = useUiStore((s) => s.selectLead);

  const { data, isPending, isError, error, refetch, isFetching } = useSalesLeads(coords.lat, coords.lng, radiusKm);

  if (isPending) return <LoadingState label="Finding leads near you…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const location = (
    <View style={styles.locationRow}>
      <Text style={styles.locationNote}>
        {usingDeviceLocation
          ? 'Using your current location'
          : status === 'requesting'
            ? 'Finding your location…'
            : status === 'denied'
              ? 'Location permission denied — using your territory base'
              : status === 'unavailable'
                ? "Couldn't get your location — using your territory base"
                : 'Using your assigned territory base'}
      </Text>
      <Pressable onPress={usingDeviceLocation ? useTerritoryBase : useDeviceLocation}>
        <Text style={styles.locationAction}>{usingDeviceLocation ? 'Use territory base' : 'Use my location'}</Text>
      </Pressable>
    </View>
  );

  const kpis = (
    <View style={styles.kpiRow}>
      {data.kpis.map((k) => (
        <View key={k.k} style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{k.v}</Text>
          <Text style={styles.kpiLabel}>{k.k}</Text>
        </View>
      ))}
    </View>
  );

  const radiusControl = (
    <View style={desktop ? styles.radiusCard : undefined}>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>Radius</Text>
        <Text style={styles.sliderValue}>{radiusKm} km</Text>
      </View>
      <RangeSlider value={radiusKm} minimumValue={1} maximumValue={20} step={1} onValueChange={setRadiusKm} />
    </View>
  );

  // The canvas is schematic, so extra height just gives the pins room to
  // separate — worth it in a desktop column.
  const map = <LeadsMap leads={data.leads} onOpenLead={selectLead} height={desktop ? 420 : undefined} />;

  const list = (
    <View style={styles.listBlock}>
      <Text style={styles.sectionTitle}>{data.leads.length} addresses, nearest first</Text>
      <View style={{ gap: 8 }}>
        {data.leads.map((l) => (
          <Pressable key={l.id} style={styles.row} onPress={() => selectLead(l.id)}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.address} numberOfLines={1}>
                  {l.address}
                  {l.unit ? `, ${l.unit}` : ''}
                </Text>
                <Text style={styles.distance}>{l.distanceLabel}</Text>
              </View>
              <Text style={styles.customer} numberOfLines={1}>
                {l.customerName} · {l.accountStatus}
              </Text>
              <Text style={styles.segment} numberOfLines={2}>
                {l.segment}
              </Text>
              <View style={styles.badgeRow}>
                <Badge label={l.stage} bg={stageColor(l.stage, colors)} />
                {l.lastOutcome && (
                  <Badge
                    label={l.knockedToday ? `Today: ${l.lastOutcome}` : `Last: ${l.lastOutcome}`}
                    bg={outcomeColor(l.lastOutcome, colors)}
                  />
                )}
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // Desktop puts the map and its radius control on the left and the ranked
  // addresses on the right, so changing the radius visibly rewrites the list
  // beside it instead of somewhere below the fold.
  if (desktop) {
    return (
      <View style={[styles.wrap, styles.wrapDesktop, isFetching && { opacity: 0.7 }]}>
        {location}
        {kpis}
        <View style={styles.columns}>
          <View style={[styles.column, styles.columnWide]}>
            {radiusControl}
            {map}
          </View>
          <View style={styles.column}>{list}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, isFetching && { opacity: 0.7 }]}>
      {location}
      {kpis}
      {radiusControl}
      {map}
      {list}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { padding: 17, gap: 13 },
  wrapDesktop: { padding: 0, gap: 18 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  column: { flex: 1, minWidth: 0, gap: 14 },
  columnWide: { flex: 1.2 },
  listBlock: { gap: 10 },
  // On desktop the slider sits in the map column, so it needs a card of its
  // own to read as a control rather than a stray label.
  radiusCard: { backgroundColor: t.colors.surfaceMuted, borderRadius: radius.md, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  locationNote: { flex: 1, fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted },
  locationAction: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: t.colors.accent },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiCard: { flex: 1, backgroundColor: t.colors.surfaceMuted, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  kpiValue: { fontFamily: fontFamily.heading, fontSize: 20, color: t.colors.textHeading },
  kpiLabel: { fontFamily: fontFamily.body, fontSize: 10, color: t.colors.textMuted, marginTop: 3, textAlign: 'center' },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabel: { fontFamily: fontFamily.bodyMedium, fontSize: 12.5, color: t.colors.textMuted },
  sliderValue: { fontFamily: fontFamily.heading, fontSize: 14, color: t.colors.textHeading },
  sectionTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 2,
    borderColor: t.colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 13,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  address: { flex: 1, fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },
  distance: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.accent },
  customer: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, marginTop: 3 },
  segment: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, marginTop: 4, lineHeight: 16 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chevron: { fontFamily: fontFamily.bodyBold, fontSize: 20, color: t.colors.accent },
}));
