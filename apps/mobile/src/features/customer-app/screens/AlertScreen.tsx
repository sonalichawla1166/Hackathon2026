import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUiStore } from '@/state/store';
import { useAckAnomaly, useAnomalies, useDismissAnomaly } from '@/api/hooks';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function AlertScreen() {
  const setScreen = useUiStore((s) => s.setScreen);
  const { data, isPending, isError, error, refetch } = useAnomalies();
  const ack = useAckAnomaly();
  const dismiss = useDismissAnomaly();

  if (isPending) return <LoadingState label="Loading meter data…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View style={styles.wrap}>
      <View style={styles.headline}>
        <Text style={styles.eyebrow}>Anomaly detected</Text>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.body}>{data.detail}</Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>15-minute interval data, last 14 nights</Text>
        <View style={styles.chart}>
          {data.intervals.map((i, idx) => (
            <View key={idx} style={[styles.bar, { height: i.hPx, backgroundColor: i.flagged ? colors.danger : colors.accent }]} />
          ))}
        </View>
        <View style={styles.chartEnds}>
          <Text style={styles.chartEndLabel}>Sept 14</Text>
          <Text style={styles.chartEndLabel}>Sept 27</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.legendLabel}>Normal baseline</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendLabel}>Flagged</Text>
          </View>
        </View>
      </View>

      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>If it runs to month end</Text>
        <Text style={styles.impactBody}>{data.impact}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Button variant="cta" size="md" block onPress={() => ack.mutate()} disabled={ack.isPending}>
          {data.ctaLabel}
        </Button>
        <Button
          variant="outlineDark"
          size="md"
          block
          disabled={dismiss.isPending}
          onPress={() => dismiss.mutate(undefined, { onSuccess: () => setScreen('home') })}
        >
          This is expected, mute it
        </Button>
      </View>

      {data.ack && data.ackNote && <Text style={styles.ackNote}>{data.ackNote}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 17, gap: 15 },
  headline: { backgroundColor: colors.primary, borderRadius: 5.4, padding: 16 },
  eyebrow: { fontFamily: fontFamily.bodyBlack, fontSize: 9, letterSpacing: 1.35, textTransform: 'uppercase', color: colors.danger },
  title: { fontFamily: fontFamily.heading, fontSize: 18, color: '#fff', marginTop: 8, lineHeight: 24 },
  body: { fontFamily: fontFamily.body, fontSize: 12.5, color: 'rgba(255,255,255,0.73)', marginTop: 7, lineHeight: 18 },
  chartCard: { backgroundColor: colors.surfaceCard, borderWidth: 2, borderColor: colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  chartTitle: { fontFamily: fontFamily.heading, fontSize: 12.5, color: colors.textHeading },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 88, marginTop: 14 },
  bar: { flex: 1, borderRadius: 1 },
  chartEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartEndLabel: { fontFamily: fontFamily.body, fontSize: 10, color: colors.textMuted },
  legendRow: { flexDirection: 'row', gap: 14, marginTop: 11 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 2 },
  legendLabel: { fontFamily: fontFamily.body, fontSize: 10.5, color: colors.textMuted },
  impactCard: { backgroundColor: colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  impactTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: colors.textHeading },
  impactBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted, marginTop: 5, lineHeight: 18 },
  ackNote: { fontFamily: fontFamily.body, fontSize: 12, color: colors.cta, lineHeight: 17 },
});
