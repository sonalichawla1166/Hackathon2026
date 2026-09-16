import React from 'react';
import { View, Text } from 'react-native';
import { useUiStore } from '@/state/store';
import { useBillExplain } from '@/api/hooks';
import { makeStyles, useIsDesktop } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function BillScreen() {
  const styles = useStyles();
  const desktop = useIsDesktop();
  const setScreen = useUiStore((s) => s.setScreen);
  const { data, isPending, isError, error, refetch } = useBillExplain();

  if (isPending) return <LoadingState label="Loading your bill…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const summary = (
    <View style={[styles.summary, desktop && styles.summaryDesktop]}>
      <Text style={styles.summaryLabel}>{data.period}</Text>
      <Text style={styles.summaryTotal}>{data.total}</Text>
      <View style={styles.segmentBar}>
        {data.lines.map((l) => (
          <View key={l.label} style={{ width: `${l.pct}%`, backgroundColor: l.bg }} />
        ))}
      </View>
    </View>
  );

  const lines = (
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
  );

  const why = (
    <View style={styles.whyCard}>
      <Text style={styles.whyTitle}>Why it moved</Text>
      <Text style={styles.whyBody}>{data.whyItMoved}</Text>
    </View>
  );

  const actions = (
    <View style={styles.actions}>
      <Button variant="primary" size="sm" onPress={() => setScreen('sim')} style={{ flex: 1 }}>
        Model solar
      </Button>
      <Button variant="cta" size="sm" onPress={() => setScreen('pay')} style={{ flex: 1 }}>
        Pay {data.total}
      </Button>
    </View>
  );

  // Desktop puts the itemisation on the left and the reasoning plus the two
  // actions on the right, so "what you owe" and "what to do about it" are read
  // together rather than one scroll apart.
  if (desktop) {
    return (
      <View style={[styles.wrap, styles.wrapDesktop]}>
        <View style={styles.columns}>
          <View style={[styles.column, styles.columnWide]}>
            {summary}
            {lines}
          </View>
          <View style={styles.column}>
            {why}
            {actions}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {summary}
      {lines}
      {why}
      {actions}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { padding: 17, gap: 15 },
  wrapDesktop: { padding: 0, gap: 18 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  column: { flex: 1, minWidth: 0, gap: 18 },
  columnWide: { flex: 1.15 },
  summary: { backgroundColor: t.colors.primary, borderRadius: 5.4, padding: 17 },
  summaryDesktop: { padding: 24 },
  summaryLabel: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textInverseMuted },
  summaryTotal: { fontFamily: fontFamily.heading, fontSize: 35, color: t.colors.textInverse, marginTop: 5 },
  segmentBar: { flexDirection: 'row', height: 11, borderRadius: 2, overflow: 'hidden', marginTop: 15 },
  lineList: { gap: 1, backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, overflow: 'hidden' },
  lineRow: { backgroundColor: t.colors.surfaceCard, padding: 13, paddingHorizontal: 15 },
  lineHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  lineDot: { width: 9, height: 9, borderRadius: 2 },
  lineLabel: { flex: 1, fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },
  lineAmount: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: t.colors.textHeading },
  linePlain: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, marginTop: 6, marginLeft: 18, lineHeight: 17 },
  whyCard: { backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  whyTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading },
  whyBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, marginTop: 5, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8 },
}));
