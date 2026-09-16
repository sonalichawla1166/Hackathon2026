import React from 'react';
import { View, Text } from 'react-native';
import { useUiStore } from '@/state/store';
import { useAckAnomaly, useAnomalies, useDismissAnomaly } from '@/api/hooks';
import { makeStyles, useTheme, useIsDesktop } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function AlertScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const desktop = useIsDesktop();
  const setScreen = useUiStore((s) => s.setScreen);
  const { data, isPending, isError, error, refetch } = useAnomalies();
  const ack = useAckAnomaly();
  const dismiss = useDismissAnomaly();

  // Interval heights arrive sized for the phone chart; desktop scales the box
  // and the bars together so the series keeps its shape.
  const barScale = desktop ? 1.6 : 1;

  if (isPending) return <LoadingState label="Loading meter data…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const headline = (
    <View style={[styles.headline, desktop && styles.headlineDesktop]}>
      <Text style={styles.eyebrow}>Anomaly detected</Text>
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.body}>{data.detail}</Text>
    </View>
  );

  const chart = (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>15-minute interval data, last 14 nights</Text>
      <View style={[styles.chart, desktop && styles.chartDesktop]}>
        {data.intervals.map((i, idx) => (
          <View key={idx} style={[styles.bar, { height: i.hPx * barScale, backgroundColor: i.flagged ? colors.danger : colors.accent }]} />
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
  );

  const impact = (
    <View style={styles.impactCard}>
      <Text style={styles.impactTitle}>If it runs to month end</Text>
      <Text style={styles.impactBody}>{data.impact}</Text>
    </View>
  );

  const decision = (
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
  );

  const note = data.ack && data.ackNote ? <Text style={styles.ackNote}>{data.ackNote}</Text> : null;

  // Desktop puts the evidence — the claim and the interval chart backing it —
  // on the left, and what it costs plus the two answers on the right, so the
  // decision is never scrolled away from the data behind it.
  if (desktop) {
    return (
      <View style={[styles.wrap, styles.wrapDesktop]}>
        <View style={styles.columns}>
          <View style={[styles.column, styles.columnWide]}>
            {headline}
            {chart}
          </View>
          <View style={styles.column}>
            {impact}
            {decision}
            {note}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {headline}
      {chart}
      {impact}
      {decision}
      {note}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { padding: 17, gap: 15 },
  wrapDesktop: { padding: 0, gap: 18 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  column: { flex: 1, minWidth: 0, gap: 18 },
  columnWide: { flex: 1.25 },
  headline: { backgroundColor: t.colors.primary, borderRadius: 5.4, padding: 16 },
  headlineDesktop: { padding: 22 },
  eyebrow: { fontFamily: fontFamily.bodyBlack, fontSize: 9, letterSpacing: 1.35, textTransform: 'uppercase', color: t.colors.danger },
  title: { fontFamily: fontFamily.heading, fontSize: 18, color: t.colors.textInverse, marginTop: 8, lineHeight: 24 },
  body: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textInverseMuted, marginTop: 7, lineHeight: 18 },
  chartCard: { backgroundColor: t.colors.surfaceCard, borderWidth: 2, borderColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  chartTitle: { fontFamily: fontFamily.heading, fontSize: 12.5, color: t.colors.textHeading },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 88, marginTop: 14 },
  // 14 nights of intervals deserve more than 88px once there is room for it.
  chartDesktop: { height: 142, gap: 5, marginTop: 18 },
  bar: { flex: 1, borderRadius: 1 },
  chartEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartEndLabel: { fontFamily: fontFamily.body, fontSize: 10, color: t.colors.textMuted },
  legendRow: { flexDirection: 'row', gap: 14, marginTop: 11 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 2 },
  legendLabel: { fontFamily: fontFamily.body, fontSize: 10.5, color: t.colors.textMuted },
  impactCard: { backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  impactTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading },
  impactBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, marginTop: 5, lineHeight: 18 },
  ackNote: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.brandInk, lineHeight: 17 },
}));
