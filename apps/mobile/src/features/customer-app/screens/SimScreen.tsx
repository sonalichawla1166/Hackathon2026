import React from 'react';
import { View, Text } from 'react-native';
import { useUiStore } from '@/state/store';
import { useSimulate } from '@/api/hooks';
import { makeStyles } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Citation } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function SimScreen() {
  const styles = useStyles();
  const solarKw = useUiStore((s) => s.solarKw);
  const setSolarKw = useUiStore((s) => s.setSolarKw);

  const { data, isPending, isError, error, refetch, isFetching } = useSimulate(solarKw);

  if (isPending) return <LoadingState label="Modelling your roof…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View style={[styles.wrap, isFetching && { opacity: 0.7 }]}>
      <View style={styles.sliderCard}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderTitle}>Rooftop array size</Text>
          <Text style={styles.sliderValue}>{data.solarLabel}</Text>
        </View>
        <RangeSlider value={solarKw} minimumValue={0} maximumValue={12} step={0.5} onValueChange={setSolarKw} />
        <View style={styles.sliderEnds}>
          <Text style={styles.sliderEndLabel}>No solar</Text>
          <Text style={styles.sliderEndLabel}>12 kW</Text>
        </View>
      </View>

      <View style={styles.compareRow}>
        <View style={styles.compareCard}>
          <Text style={styles.compareLabel}>Bill today</Text>
          <Text style={styles.compareValue}>{data.billToday}</Text>
        </View>
        <View style={[styles.compareCard, styles.compareCardDark]}>
          <Text style={styles.compareLabelDark}>With solar</Text>
          <Text style={styles.compareValueDark}>{data.billWithSolar}</Text>
        </View>
      </View>

      <View style={styles.rows}>
        {data.rows.map((r) => (
          <View key={r.k} style={styles.row}>
            <Text style={styles.rowKey}>{r.k}</Text>
            <Text style={styles.rowValue}>{r.v}</Text>
          </View>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Exported kWh are credited at your full retail rate and roll forward for 12 months. Credits are not paid
          out in cash.
        </Text>
        <View style={{ marginTop: 9, alignSelf: 'flex-start' }}>
          <Citation label="Con Edison SC 1 Rider R · p. 18" />
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { padding: 17, gap: 15 },
  sliderCard: { backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  sliderHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sliderTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading },
  sliderValue: { fontFamily: fontFamily.heading, fontSize: 19, color: t.colors.textHeading },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderEndLabel: { fontFamily: fontFamily.body, fontSize: 10.5, color: t.colors.textMuted },
  compareRow: { flexDirection: 'row', gap: 11 },
  compareCard: { flex: 1, backgroundColor: t.colors.surfaceCard, borderWidth: 2, borderColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 14 },
  compareCardDark: { backgroundColor: t.colors.primary, borderWidth: 0 },
  compareLabel: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted },
  compareLabelDark: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textInverseMuted },
  compareValue: { fontFamily: fontFamily.heading, fontSize: 25, color: t.colors.textHeading, marginTop: 5 },
  compareValueDark: { fontFamily: fontFamily.heading, fontSize: 25, color: t.colors.textInverse, marginTop: 5 },
  rows: { gap: 1, backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, overflow: 'hidden' },
  row: { backgroundColor: t.colors.surfaceCard, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowKey: { flex: 1, fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted },
  rowValue: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: t.colors.textHeading, textAlign: 'right' },
  noteCard: { borderWidth: 2, borderColor: t.colors.accent, borderRadius: 5.4, padding: 14 },
  noteText: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, lineHeight: 18 },
}));
