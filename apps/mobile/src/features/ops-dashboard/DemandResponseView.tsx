import React, { useState } from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { useUiStore } from '@/state/store';
import { useDrCohort, useQueueDrEvent } from '@/api/hooks';
import { DR_FILTERS } from '@/data/content';
import { makeStyles, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

const monoFamily = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });

const CHART_HEIGHT = 156;
const Y_AXIS_WIDTH = 26;
/** Gridline positions as a fraction of the peak. */
const GRID = [0, 0.25, 0.5, 0.75, 1] as const;

/** The curve starts at noon and runs one bar an hour. */
function hourLabel(i: number): string {
  const h24 = (12 + i) % 24;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}${h24 >= 12 ? 'pm' : 'am'}`;
}

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

  // Which hour the readout describes. Hovering or tapping a bar takes over;
  // otherwise it rests on the peak, so the chart always states its own story.
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  if (isPending) return <LoadingState label="Building cohort…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  // `base + cut` is the hour's forecast load on the model's own 0-100 index,
  // where the day's peak is exactly 100 — so a share of the peak is what these
  // numbers already are, not a unit invented for the label.
  const totals = data.curve.map((c) => c.base + c.cut);
  const peak = Math.max(1, ...totals);
  const peakHour = totals.indexOf(Math.max(...totals));
  const readoutHour = hoveredHour ?? peakHour;
  const readout = data.curve[readoutHour];
  const share = (v: number) => Math.round((v / peak) * 100);

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
            <View style={styles.chartHead}>
              <Text style={styles.sectionTitle}>Expected load shape</Text>
              {/* Amber on a white card clears only 1.8:1, so the values are
                  spelled out here rather than left to the fill alone. */}
              <View style={styles.readoutRow}>
                <Text style={styles.readoutHour}>{hourLabel(readoutHour)}</Text>
                <View style={styles.readoutItem}>
                  <View style={[styles.legendSwatch, { backgroundColor: colors.accent }]} />
                  <Text style={styles.readoutLabel}>Load</Text>
                  <Text style={styles.readoutValue}>{share(readout.base + readout.cut)}%</Text>
                </View>
                <View style={styles.readoutItem}>
                  <View style={[styles.legendSwatch, { backgroundColor: colors.cta }]} />
                  <Text style={styles.readoutLabel}>Curtailed</Text>
                  <Text style={styles.readoutValue}>{readout.cut > 0 ? `${share(readout.cut)}%` : '—'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.plotRow}>
              <View style={styles.yAxis}>
                {GRID.map((f) => (
                  <Text key={f} style={[styles.yLabel, { bottom: CHART_HEIGHT * f - 6 }]}>
                    {Math.round(f * 100)}
                  </Text>
                ))}
              </View>

              <View style={styles.plot}>
                {GRID.map((f) => (
                  <View key={f} style={[styles.gridline, { bottom: CHART_HEIGHT * f }]} />
                ))}

                <View style={styles.chart}>
                  {data.curve.map((c, i) => {
                    const inWindow = c.cut > 0;
                    const isRead = i === readoutHour;
                    return (
                      <Pressable
                        key={i}
                        style={[styles.chartCol, inWindow && styles.chartColWindow, isRead && styles.chartColRead]}
                        onHoverIn={() => setHoveredHour(i)}
                        onHoverOut={() => setHoveredHour(null)}
                        onPress={() => setHoveredHour((h) => (h === i ? null : i))}
                        accessibilityRole="button"
                        accessibilityLabel={`${hourLabel(i)}: ${share(c.base + c.cut)}% of peak load, ${share(c.cut)}% curtailed`}
                      >
                        {/* Curtailment rides on top — the slice being shaved
                            off the peak, rather than a plinth under it. */}
                        <View style={styles.colStack}>
                          {c.cut > 0 && (
                            <View
                              style={[
                                styles.chartSeg,
                                styles.chartSegTop,
                                { height: (c.cut / peak) * CHART_HEIGHT, backgroundColor: colors.cta },
                              ]}
                            />
                          )}
                          <View
                            style={[
                              styles.chartSeg,
                              c.cut === 0 && styles.chartSegTop,
                              { height: (c.base / peak) * CHART_HEIGHT, backgroundColor: colors.accent },
                            ]}
                          />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.axisRow}>
              <View style={{ width: Y_AXIS_WIDTH }} />
              <View style={styles.axisTicks}>
                {data.curve.map((c, i) => (
                  <Text key={i} style={styles.chartAxisLabel} numberOfLines={1}>
                    {i % 3 === 0 || i === data.curve.length - 1 ? hourLabel(i) : ''}
                  </Text>
                ))}
              </View>
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
            <Text style={styles.chartCaption}>
              Share of the day&apos;s peak load. Shaded hours are the selected event window — hover a bar for its
              numbers.
            </Text>
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

  chartHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  readoutRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  readoutHour: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading, minWidth: 40 },
  readoutItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readoutLabel: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted },
  readoutValue: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: t.colors.textHeading },

  plotRow: { flexDirection: 'row', marginTop: 16 },
  yAxis: { width: Y_AXIS_WIDTH, height: CHART_HEIGHT },
  yLabel: { position: 'absolute', right: 7, fontFamily: fontFamily.body, fontSize: 9.5, color: t.colors.textMuted },
  plot: { flex: 1, height: CHART_HEIGHT },
  // Recessive: the grid is a reading aid, never a mark.
  gridline: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: t.colors.borderHairline },

  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: CHART_HEIGHT },
  chartCol: { flex: 1, height: '100%', justifyContent: 'flex-end', borderRadius: 4 },
  // The event window reads as a band behind its own hours.
  chartColWindow: { backgroundColor: t.colors.surfaceMuted },
  chartColRead: { backgroundColor: t.colors.borderHairline },
  // A 2px surface gap keeps the two stacked fills from bleeding together.
  colStack: { justifyContent: 'flex-end', gap: 2 },
  chartSeg: { width: '100%' },
  chartSegTop: { borderTopLeftRadius: 4, borderTopRightRadius: 4 },

  axisRow: { flexDirection: 'row', marginTop: 7 },
  axisTicks: { flex: 1, flexDirection: 'row', gap: 4 },
  chartAxisLabel: { flex: 1, textAlign: 'center', fontFamily: fontFamily.body, fontSize: 10, color: t.colors.textMuted },
  chartCaption: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted, marginTop: 9, lineHeight: 16 },
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
