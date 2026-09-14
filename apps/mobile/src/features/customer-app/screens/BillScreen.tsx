import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUiStore } from '@/state/store';
import { useBillExplain } from '@/api/hooks';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function BillScreen() {
  const setScreen = useUiStore((s) => s.setScreen);
  const { data, isPending, isError, error, refetch } = useBillExplain();

  if (isPending) return <LoadingState label="Loading your bill…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View style={styles.wrap}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>{data.period}</Text>
        <Text style={styles.summaryTotal}>{data.total}</Text>
        <View style={styles.segmentBar}>
          {data.lines.map((l) => (
            <View key={l.label} style={{ width: `${l.pct}%`, backgroundColor: l.bg }} />
          ))}
        </View>
      </View>

      <View style={styles.lineList}>
        {data.lines.map((l) => (
          <View key={l.label} style={styles.lineRow}>
            <View style={styles.lineHeader}>
              <View style={[styles.lineDot, { backgroundColor: l.bg }]} />
              <Text style={styles.lineLabel}>{l.label}</Text>
              <Text style={styles.lineAmount}>{l.amount}</Text>
            </View>
            <Text style={styles.linePlain}>{l.plain}</Text>
          </View>
        ))}
      </View>

      <View style={styles.whyCard}>
        <Text style={styles.whyTitle}>Why it moved</Text>
        <Text style={styles.whyBody}>{data.whyItMoved}</Text>
      </View>

      <View style={styles.actions}>
        <Button variant="primary" size="sm" onPress={() => setScreen('sim')} style={{ flex: 1 }}>
          Model solar
        </Button>
        <Button variant="cta" size="sm" onPress={() => setScreen('pay')} style={{ flex: 1 }}>
          Pay {data.total}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 17, gap: 15 },
  summary: { backgroundColor: colors.primary, borderRadius: 5.4, padding: 17 },
  summaryLabel: { fontFamily: fontFamily.body, fontSize: 11.5, color: 'rgba(255,255,255,0.73)' },
  summaryTotal: { fontFamily: fontFamily.heading, fontSize: 35, color: '#fff', marginTop: 5 },
  segmentBar: { flexDirection: 'row', height: 11, borderRadius: 2, overflow: 'hidden', marginTop: 15 },
  lineList: { gap: 1, backgroundColor: colors.surfaceMuted, borderRadius: 5.4, overflow: 'hidden' },
  lineRow: { backgroundColor: colors.surfaceCard, padding: 13, paddingHorizontal: 15 },
  lineHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  lineDot: { width: 9, height: 9, borderRadius: 2 },
  lineLabel: { flex: 1, fontFamily: fontFamily.heading, fontSize: 13.5, color: colors.textHeading },
  lineAmount: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.textHeading },
  linePlain: { fontFamily: fontFamily.body, fontSize: 12, color: colors.textMuted, marginTop: 6, marginLeft: 18, lineHeight: 17 },
  whyCard: { backgroundColor: colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  whyTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: colors.textHeading },
  whyBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted, marginTop: 5, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8 },
});
