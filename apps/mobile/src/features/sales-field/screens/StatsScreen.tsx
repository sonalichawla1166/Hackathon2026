import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useUiStore } from '@/state/store';
import { useSalesStats } from '@/api/hooks';
import { colors, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { useSalesLocation } from '../useDeviceLocation';
import { outcomeColor } from '../outcomeColors';

export function StatsScreen() {
  const { coords } = useSalesLocation();
  const radiusKm = useUiStore((s) => s.salesRadiusKm);
  const selectLead = useUiStore((s) => s.selectLead);
  const { data, isPending, isError, error, refetch } = useSalesStats(coords.lat, coords.lng, radiusKm);

  if (isPending) return <LoadingState label="Tallying today…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

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

      <Text style={styles.sectionTitle}>Knocked today</Text>
      {data.knockedToday.length === 0 && <Text style={styles.empty}>No doors knocked yet today.</Text>}
      <View style={{ gap: 8 }}>
        {data.knockedToday.map((k) => (
          <Pressable key={k.id} style={styles.row} onPress={() => selectLead(k.id)}>
            <Text style={styles.rowAddress} numberOfLines={1}>{k.address}</Text>
            {k.outcome && <Badge label={k.outcome} bg={outcomeColor(k.outcome)} />}
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

const styles = StyleSheet.create({
  wrap: { padding: 17, gap: 13 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiCard: { flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  kpiValue: { fontFamily: fontFamily.heading, fontSize: 22, color: colors.textHeading },
  kpiLabel: { fontFamily: fontFamily.body, fontSize: 10.5, color: colors.textMuted, marginTop: 3, textAlign: 'center' },
  sectionTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: colors.textHeading, marginTop: 6 },
  sectionSub: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.textMuted, marginTop: -4, lineHeight: 16 },
  empty: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceCard,
    borderWidth: 2,
    borderColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 12,
  },
  rowAddress: { flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: 13, color: colors.textHeading },
  rowDistance: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.accent },
  routeNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  routeNumText: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: '#fff' },
});
