import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useUiStore } from '@/state/store';
import { useSalesStats } from '@/api/hooks';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { useSalesLocation } from '../useDeviceLocation';
import { outcomeColor } from '../outcomeColors';
import { stageColor } from '../stageColors';

export function StatsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { coords } = useSalesLocation();
  const radiusKm = useUiStore((s) => s.salesRadiusKm);
  const selectLead = useUiStore((s) => s.selectLead);
  const setSalesScreen = useUiStore((s) => s.setSalesScreen);
  const { data, isPending, isError, error, refetch } = useSalesStats(coords.lat, coords.lng, radiusKm);

  if (isPending) return <LoadingState label="Tallying today…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const funnelMax = Math.max(1, ...data.stageFunnel.map((f) => f.count));

  return (
    <View style={styles.wrap}>
      <View style={styles.kpiRow}>
        {data.today.map((k) => (
          <View key={k.k} style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{k.v}</Text>
            <Text style={styles.kpiLabel}>{k.k}</Text>
          </View>
        ))}
      </View>

      <View style={styles.funnelHeaderRow}>
        <Text style={styles.sectionTitle}>Pipeline funnel</Text>
        <Pressable onPress={() => setSalesScreen('pipeline')}>
          <Text style={styles.funnelLink}>Open board ›</Text>
        </Pressable>
      </View>
      <View style={styles.funnelCard}>
        {data.stageFunnel.map((f) => (
          <View key={f.stage} style={styles.funnelRow}>
            <Text style={styles.funnelLabel} numberOfLines={1}>{f.stage}</Text>
            <View style={styles.funnelTrack}>
              <View style={[styles.funnelFill, { width: `${(f.count / funnelMax) * 100}%`, backgroundColor: stageColor(f.stage, colors) }]} />
            </View>
            <Text style={styles.funnelCount}>{f.count}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Knocked today</Text>
      {data.knockedToday.length === 0 && <Text style={styles.empty}>No doors knocked yet today.</Text>}
      <View style={{ gap: 8 }}>
        {data.knockedToday.map((k) => (
          <Pressable key={k.id} style={styles.row} onPress={() => selectLead(k.id)}>
            <Text style={styles.rowAddress} numberOfLines={1}>{k.address}</Text>
            {k.outcome && <Badge label={k.outcome} bg={outcomeColor(k.outcome, colors)} />}
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Suggested walking order</Text>
      <Text style={styles.sectionSub}>
        Remaining leads in range, ordered to minimise backtracking from where you are now.
      </Text>
      <View style={{ gap: 8 }}>
        {data.suggestedRoute.map((r, i) => (
          <Pressable key={r.id} style={styles.row} onPress={() => selectLead(r.id)}>
            <View style={styles.routeNum}>
              <Text style={styles.routeNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.rowAddress} numberOfLines={1}>{r.address}</Text>
            <Text style={styles.rowDistance}>{r.distanceLabel}</Text>
          </Pressable>
        ))}
        {data.suggestedRoute.length === 0 && <Text style={styles.empty}>All leads in range have been knocked today.</Text>}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { padding: 17, gap: 13 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiCard: { flex: 1, backgroundColor: t.colors.surfaceMuted, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  kpiValue: { fontFamily: fontFamily.heading, fontSize: 22, color: t.colors.textHeading },
  kpiLabel: { fontFamily: fontFamily.body, fontSize: 10.5, color: t.colors.textMuted, marginTop: 3, textAlign: 'center' },
  sectionTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading, marginTop: 6 },
  funnelHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  funnelLink: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.accent },
  funnelCard: { backgroundColor: t.colors.surfaceCard, borderRadius: radius.md, padding: 14, gap: 10 },
  funnelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  funnelLabel: { width: 88, fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted },
  funnelTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: t.colors.surfaceMutedAlt, overflow: 'hidden' },
  funnelFill: { height: '100%', borderRadius: 4 },
  funnelCount: { width: 20, textAlign: 'right', fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: t.colors.textHeading },
  sectionSub: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, marginTop: -4, lineHeight: 16 },
  empty: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 2,
    borderColor: t.colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 12,
  },
  rowAddress: { flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: 13, color: t.colors.textHeading },
  rowDistance: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.accent },
  routeNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center' },
  routeNumText: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: t.colors.textInverse },
}));
