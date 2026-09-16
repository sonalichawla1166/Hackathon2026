import React from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { useUiStore } from '@/state/store';
import { useDrCohort, useQueueDrEvent } from '@/api/hooks';
import { DR_FILTERS } from '@/data/content';
import { makeStyles, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

const monoFamily = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });

export function DemandResponseView({ compact }: { compact: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const drWindow = useUiStore((s) => s.drWindow);
  const setDrWindow = useUiStore((s) => s.setDrWindow);
  const drPicks = useUiStore((s) => s.drPicks);
  const toggleDrPick = useUiStore((s) => s.toggleDrPick);
  const drQueuedLocal = useUiStore((s) => s.drQueuedLocal);
  const setDrQueuedLocal = useUiStore((s) => s.setDrQueuedLocal);

  const { data, isPending, isError, error, refetch } = useDrCohort(drWindow, drPicks);
  const queueEvent = useQueueDrEvent();

  if (isPending) return <LoadingState label="Building cohort…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View>
      <Text style={styles.title}>Demand response targeting</Text>
      <Text style={styles.subtitle}>
        Build an event cohort from interval features instead of a blanket mailing. Cohort size and expected
        curtailment update as you filter.
      </Text>

      <View style={[styles.layout, compact && styles.layoutCompact]}>
        <View style={[styles.mainCard, !compact && { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Event window</Text>
          <View style={styles.chipRow}>
            {data.windows.map((label, i) => {
              const on = drWindow === i;
              return (
                <Pressable
                  key={label}
                  onPress={() => setDrWindow(i)}
                  style={[
                    styles.windowChip,
                    { borderColor: on ? colors.primary : colors.surfaceMuted, backgroundColor: on ? colors.primary : colors.surfaceCard },
                  ]}
                >
                  <Text style={[styles.windowChipText, { color: on ? colors.textInverse : colors.textHeading }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Cohort filters</Text>
          <View style={styles.chipRow}>
            {DR_FILTERS.map((f, i) => {
              const on = drPicks.includes(i);
              return (
                <Pressable
                  key={f.label}
                  onPress={() => toggleDrPick(i)}
                  style={[
                    styles.filterChip,
                    { borderColor: on ? colors.accent : colors.surfaceMuted, backgroundColor: on ? colors.accent : colors.surfaceCard },
                  ]}
                >
                  <Text style={[styles.filterChipText, { color: on ? colors.onAccent : colors.textHeading }]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider}>
            <Text style={styles.sectionTitle}>Expected load shape</Text>
            <View style={styles.chart}>
              {data.curve.map((c, i) => (
                <View key={i} style={styles.chartCol}>
                  <View
                    style={[
                      styles.chartSeg,
                      { height: c.cut, backgroundColor: colors.cta, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
                    ]}
                  />
                  <View style={[styles.chartSeg, { height: c.base, backgroundColor: colors.accent }]} />
                </View>
              ))}
            </View>
            <View style={styles.chartAxis}>
              <Text style={styles.chartAxisLabel}>12pm</Text>
              <Text style={styles.chartAxisLabel}>11pm</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: colors.accent }]} />
                <Text style={styles.legendLabel}>Forecast load</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: colors.cta }]} />
                <Text style={styles.legendLabel}>Curtailed by cohort</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.rightCol, !compact && { width: 340 }]}>
          <View style={styles.cohortCard}>
            <Text style={styles.cohortLabel}>Cohort size</Text>
            <Text style={styles.cohortValue}>{data.drCount}</Text>
            <View style={{ marginTop: 18, gap: 10 }}>
              {data.stats.map((s) => (
                <View key={s.k} style={styles.statRow}>
                  <Text style={styles.statLabel}>{s.k}</Text>
                  <Text style={styles.statValue}>{s.v}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.payloadCard}>
            <Text style={styles.sectionTitle}>Notification payload</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{data.payload}</Text>
            </View>
            <View style={{ marginTop: 14 }}>
              <Button
                variant="cta"
                size="md"
                block
                disabled={queueEvent.isPending}
                onPress={() =>
                  queueEvent.mutate({ window: drWindow, picks: drPicks }, { onSuccess: () => setDrQueuedLocal(true) })
                }
              >
                {drQueuedLocal ? 'Event queued' : 'Queue event'}
              </Button>
            </View>
            <Text style={styles.payloadNote}>
              Nothing is sent in the demo. The payload is displayed, as agreed in the real-versus-mocked table.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  title: { fontFamily: fontFamily.heading, fontSize: 24, color: t.colors.textHeading },
  subtitle: { fontFamily: fontFamily.body, fontSize: 13, color: t.colors.textMuted, marginTop: 7, lineHeight: 19, maxWidth: 640 },

  layout: { flexDirection: 'row', gap: 24, marginTop: 22, alignItems: 'flex-start' },
  layoutCompact: { flexDirection: 'column' },

  mainCard: { backgroundColor: t.colors.surfaceCard, borderRadius: 5.4, padding: 24, ...t.shadow.card },
  sectionTitle: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textHeading },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },

  windowChip: { borderWidth: 2, borderRadius: 5, paddingVertical: 10, paddingHorizontal: 14 },
  windowChipText: { fontFamily: fontFamily.bodyBold, fontSize: 12.5 },
  filterChip: { borderWidth: 2, borderRadius: 3.2, paddingVertical: 9, paddingHorizontal: 13 },
  filterChipText: { fontFamily: fontFamily.body, fontSize: 12.5 },

  divider: { borderTopWidth: 2, borderTopColor: t.colors.surfaceMuted, marginTop: 26, paddingTop: 20 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 120, marginTop: 16 },
  chartCol: { flex: 1, flexDirection: 'column-reverse', height: '100%', gap: 2 },
  chartSeg: { width: '100%' },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  chartAxisLabel: { fontFamily: fontFamily.body, fontSize: 10.5, color: t.colors.textMuted },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendLabel: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted },

  rightCol: { gap: 16 },
  cohortCard: { backgroundColor: t.colors.primary, borderRadius: 5.4, padding: 22 },
  cohortLabel: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textInverseMuted },
  cohortValue: { fontFamily: fontFamily.heading, fontSize: 40, color: t.colors.textInverse, marginTop: 5 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: t.colors.borderInverseSoft, paddingTop: 9 },
  statLabel: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textInverseMuted },
  statValue: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: t.colors.textInverse },

  payloadCard: { backgroundColor: t.colors.surfaceCard, borderRadius: 5.4, padding: 20, ...t.shadow.card },
  codeBlock: { backgroundColor: t.colors.surfaceCode, borderRadius: 3.2, padding: 12, marginTop: 11 },
  codeText: { fontFamily: monoFamily, fontSize: 12, lineHeight: 19, color: t.colors.textMuted },
  payloadNote: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.accent, marginTop: 10, lineHeight: 16 },
}));
