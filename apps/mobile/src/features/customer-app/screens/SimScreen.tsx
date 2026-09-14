import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUiStore } from '@/state/store';
import { useSimulate } from '@/api/hooks';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Citation } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function SimScreen() {
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

const styles = StyleSheet.create({
  wrap: { padding: 17, gap: 15 },
  sliderCard: { backgroundColor: colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  sliderHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sliderTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: colors.textHeading },
  sliderValue: { fontFamily: fontFamily.heading, fontSize: 19, color: colors.textHeading },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderEndLabel: { fontFamily: fontFamily.body, fontSize: 10.5, color: colors.textMuted },
  compareRow: { flexDirection: 'row', gap: 11 },
  compareCard: { flex: 1, backgroundColor: colors.surfaceCard, borderWidth: 2, borderColor: colors.surfaceMuted, borderRadius: 5.4, padding: 14 },
  compareCardDark: { backgroundColor: colors.primary, borderWidth: 0 },
  compareLabel: { fontFamily: fontFamily.body, fontSize: 11, color: colors.textMuted },
  compareLabelDark: { fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(255,255,255,0.73)' },
  compareValue: { fontFamily: fontFamily.heading, fontSize: 25, color: colors.textHeading, marginTop: 5 },
  compareValueDark: { fontFamily: fontFamily.heading, fontSize: 25, color: '#fff', marginTop: 5 },
  rows: { gap: 1, backgroundColor: colors.surfaceMuted, borderRadius: 5.4, overflow: 'hidden' },
  row: { backgroundColor: colors.surfaceCard, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowKey: { flex: 1, fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted },
  rowValue: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.textHeading, textAlign: 'right' },
  noteCard: { borderWidth: 2, borderColor: colors.accent, borderRadius: 5.4, padding: 14 },
  noteText: { fontFamily: fontFamily.body, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
});
