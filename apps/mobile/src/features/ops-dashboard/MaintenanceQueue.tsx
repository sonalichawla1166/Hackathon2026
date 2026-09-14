import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useUiStore } from '@/state/store';
import { useDispatchAsset, useOpsAssets } from '@/api/hooks';
import { colors, shadow } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function MaintenanceQueue({ compact }: { compact: boolean }) {
  const selectedAssetId = useUiStore((s) => s.selectedAssetId);
  const selectAsset = useUiStore((s) => s.selectAsset);
  const { data, isPending, isError, error, refetch } = useOpsAssets();
  const dispatchAsset = useDispatchAsset();

  if (isPending) return <LoadingState label="Loading maintenance queue…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const { kpis, columns, assets } = data;
  const selectedId = selectedAssetId ?? assets[0]?.id;
  const sel = assets.find((a) => a.id === selectedId) ?? assets[0];

  return (
    <View>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={styles.title}>Predictive maintenance queue</Text>
          <Text style={styles.subtitle}>
            Ranked by failure probability over the next 30 days. 6 of 1,842 assets above the 0.60 threshold.
          </Text>
        </View>
        <View style={[styles.kpiRow, compact && styles.kpiRowCompact]}>
          {kpis.map((k) => (
            <View key={k.k}>
              <Text style={styles.kpiLabel}>{k.k}</Text>
              <Text style={styles.kpiValue}>{k.v}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.layout, compact && styles.layoutCompact]}>
        <View style={[styles.tableCard, !compact && { flex: 1 }]}>
          <View style={styles.tableHeadRow}>
            {columns.map((c, i) => (
              <Text key={c} style={[styles.tableHeadCell, colWidth(i)]} numberOfLines={1}>
                {c}
              </Text>
            ))}
          </View>
          {assets.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => selectAsset(a.id)}
              style={[styles.row, { backgroundColor: a.id === sel.id ? colors.surfaceMuted : colors.surfaceCard }]}
            >
              <View style={colWidth(0)}>
                <Text style={styles.assetId} numberOfLines={1}>{a.id}</Text>
                <Text style={styles.assetType} numberOfLines={2}>{a.type}</Text>
              </View>
              <Text style={[styles.cellText, colWidth(1)]}>{a.loc}</Text>
              <Text style={[styles.cellText, colWidth(2)]}>{a.age}</Text>
              <View style={[styles.riskCell, colWidth(3)]}>
                <View style={styles.riskTrack}>
                  <View style={[styles.riskFill, { width: `${a.riskPct}%`, backgroundColor: a.riskColorValue }]} />
                </View>
                <Text style={styles.riskLabel}>{a.riskLabel}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.detailCard, !compact && { width: 350 }]}>
          <Text style={styles.eyebrow}>Selected asset</Text>
          <Text style={styles.selId}>{sel.id}</Text>
          <Text style={styles.selMeta}>
            {sel.type} · {sel.loc} · installed {sel.installed}
          </Text>

          <View style={styles.riskBox}>
            <Text style={styles.riskBoxLabel}>Failure probability, 30 days</Text>
            <Text style={styles.riskBoxValue}>{sel.riskLabel}</Text>
            <Text style={styles.riskBoxSub}>{sel.customers.toLocaleString('en-US')} customers downstream</Text>
          </View>

          <Text style={styles.driversTitle}>What drives the score</Text>
          <View style={{ gap: 9 }}>
            {sel.drivers.map((d) => (
              <View key={d.k}>
                <View style={styles.driverRow}>
                  <Text style={styles.driverLabel}>{d.k}</Text>
                  <Text style={styles.driverValue}>{d.v}</Text>
                </View>
                <View style={styles.driverTrack}>
                  <View style={[styles.driverFill, { width: d.w as `${number}%` }]} />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actionBox}>
            <Text style={styles.actionTitle}>Recommended action</Text>
            <Text style={styles.actionBody}>{sel.action}</Text>
          </View>

          <View style={styles.btnRow}>
            <Button
              variant="cta"
              size="sm"
              style={{ flex: 1 }}
              disabled={dispatchAsset.isPending}
              onPress={() => dispatchAsset.mutate(sel.id)}
            >
              {sel.dispatchLabel}
            </Button>
            <Button variant="outlineDark" size="sm" style={{ flex: 1 }}>
              Snooze 7 days
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

function colWidth(i: number) {
  // Approximates the 1.5fr / 1fr / .7fr / .9fr grid from the prototype.
  const flexes = [1.5, 1, 0.7, 0.9];
  return { flex: flexes[i] };
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18 },
  headerCompact: { alignItems: 'flex-start' },
  title: { fontFamily: fontFamily.heading, fontSize: 24, color: colors.textHeading },
  subtitle: { fontFamily: fontFamily.body, fontSize: 13, color: colors.textMuted, marginTop: 7, lineHeight: 19 },
  kpiRow: { flexDirection: 'row', gap: 22 },
  kpiRowCompact: { flexWrap: 'wrap', gap: 18 },
  kpiLabel: { fontFamily: fontFamily.body, fontSize: 11, color: colors.textMuted },
  kpiValue: { fontFamily: fontFamily.heading, fontSize: 21, color: colors.textHeading, marginTop: 3 },

  layout: { flexDirection: 'row', gap: 24, marginTop: 22, alignItems: 'flex-start' },
  layoutCompact: { flexDirection: 'column' },

  tableCard: { backgroundColor: colors.surfaceCard, borderRadius: 5.4, overflow: 'hidden', ...shadow.card },
  tableHeadRow: { flexDirection: 'row', gap: 12, paddingVertical: 13, paddingHorizontal: 18, backgroundColor: colors.primary },
  tableHeadCell: { fontFamily: fontFamily.bodyBlack, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.73)' },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: colors.surfaceMuted, alignItems: 'center' },
  assetId: { fontFamily: fontFamily.heading, fontSize: 13.5, color: colors.textHeading },
  assetType: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  cellText: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted },
  riskCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  riskFill: { height: '100%' },
  riskLabel: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.textHeading, width: 34, textAlign: 'right' },

  detailCard: { backgroundColor: colors.surfaceCard, borderRadius: 5.4, padding: 22, ...shadow.card },
  eyebrow: { fontFamily: fontFamily.bodyBlack, fontSize: 9.5, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.accent },
  selId: { fontFamily: fontFamily.heading, fontSize: 21, color: colors.textHeading, marginTop: 9, marginBottom: 3 },
  selMeta: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },

  riskBox: { backgroundColor: colors.primary, borderRadius: 5.4, padding: 16, marginTop: 16 },
  riskBoxLabel: { fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(255,255,255,0.73)' },
  riskBoxValue: { fontFamily: fontFamily.heading, fontSize: 34, color: '#fff', marginTop: 4 },
  riskBoxSub: { fontFamily: fontFamily.body, fontSize: 11.5, color: 'rgba(255,255,255,0.73)', marginTop: 6, lineHeight: 16 },

  driversTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: colors.textHeading, marginTop: 18, marginBottom: 10 },
  driverRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  driverLabel: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted },
  driverValue: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.textHeading },
  driverTrack: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceMuted, marginTop: 5, overflow: 'hidden' },
  driverFill: { height: '100%', backgroundColor: colors.accent },

  actionBox: { backgroundColor: colors.surfaceMuted, borderRadius: 5.4, padding: 15, marginTop: 18 },
  actionTitle: { fontFamily: fontFamily.heading, fontSize: 12.5, color: colors.textHeading },
  actionBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted, marginTop: 5, lineHeight: 18 },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
});
