import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useUiStore } from '@/state/store';
import { useAccountSummary } from '@/api/hooks';
import { makeStyles, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function HomeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const setScreen = useUiStore((s) => s.setScreen);
  const { data, isPending, isError, error, refetch } = useAccountSummary();

  if (isPending) return <LoadingState label="Loading your account…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.alertBanner} onPress={() => setScreen('alert')}>
        <Text style={styles.alertEyebrow}>Proactive alert</Text>
        <Text style={styles.alertTitle}>{data.alert.title}</Text>
        <Text style={styles.alertBody}>{data.alert.detail}</Text>
      </Pressable>

      <Card>
        <View style={styles.billRow}>
          <View>
            <Text style={styles.label}>Projected bill, closes Oct 12</Text>
            <Text style={styles.billTotal}>{data.billTotal}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.delta}>{data.deltaPct}</Text>
            <Text style={styles.deltaSub}>{data.deltaLabel}</Text>
          </View>
        </View>

        <View style={styles.chart}>
          {data.history.map((h) => (
            <View key={h.m} style={styles.chartCol}>
              <View style={[styles.bar, { height: h.hPx, backgroundColor: h.active ? colors.primary : withAlpha(colors.primary, 0.25) }]} />
              <Text style={styles.chartLabel}>{h.m}</Text>
            </View>
          ))}
        </View>

        <View style={styles.billActions}>
          <Button variant="primary" size="sm" onPress={() => setScreen('bill')} style={{ flex: 1 }}>
            Explain my bill
          </Button>
          <Button variant="cta" size="sm" onPress={() => setScreen('pay')} style={{ flex: 1 }}>
            Pay now
          </Button>
        </View>
      </Card>

      <Pressable style={styles.askCard} onPress={() => setScreen('chat')}>
        <View style={{ flex: 1 }}>
          <Text style={styles.askTitle}>Ask about anything on your account</Text>
          <Text style={styles.askSub}>Rates, net metering, service start or stop</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <View>
        <Text style={styles.sectionTitle}>Matched to your usage</Text>
        <Pressable style={styles.programCard} onPress={() => setScreen('programs')}>
          <View style={styles.programHeader}>
            <Text style={styles.programName}>{data.topProgram.name}</Text>
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{data.topProgram.match}% match</Text>
            </View>
          </View>
          <Text style={styles.programWhy}>{data.topProgram.blurb}</Text>
          <Text style={styles.programCta}>See all 4 recommendations ›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { padding: 17, gap: 13 },
  alertBanner: {
    backgroundColor: t.colors.primary,
    borderLeftWidth: 6,
    borderLeftColor: t.colors.danger,
    borderRadius: 5.4,
    padding: 15,
  },
  alertEyebrow: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 9,
    letterSpacing: 1.35,
    textTransform: 'uppercase',
    color: t.colors.dangerSoft,
    marginBottom: 6,
  },
  alertTitle: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textInverse, lineHeight: 20 },
  alertBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textInverseMuted, marginTop: 5, lineHeight: 18 },
  billRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  label: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted },
  billTotal: { fontFamily: fontFamily.heading, fontSize: 33, color: t.colors.textHeading, marginTop: 4 },
  delta: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: t.colors.danger },
  deltaSub: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted, marginTop: 3 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 70, marginTop: 16, marginBottom: 4 },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 5 },
  bar: { width: '100%', borderRadius: 2 },
  chartLabel: { fontFamily: fontFamily.body, fontSize: 9.5, color: t.colors.textMuted },
  billActions: { flexDirection: 'row', gap: 8, borderTopWidth: 2, borderTopColor: t.colors.surfaceMuted, marginTop: 12, paddingTop: 12 },
  askCard: {
    backgroundColor: t.colors.surfaceMuted,
    borderRadius: 5.4,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  askTitle: { fontFamily: fontFamily.heading, fontSize: 14, color: t.colors.textHeading },
  askSub: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, marginTop: 3 },
  chevron: { fontFamily: fontFamily.bodyBold, fontSize: 22, color: t.colors.accent },
  sectionTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading, marginBottom: 9 },
  programCard: { backgroundColor: t.colors.surfaceCard, borderWidth: 2, borderColor: t.colors.accent, borderRadius: 5.4, padding: 15 },
  programHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  programName: { fontFamily: fontFamily.heading, fontSize: 14.5, color: t.colors.textHeading },
  matchBadge: { backgroundColor: t.colors.cta, borderRadius: 3.2, paddingHorizontal: 8, paddingVertical: 5 },
  matchBadgeText: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: t.colors.onCta },
  programWhy: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, marginTop: 7, lineHeight: 18 },
  programCta: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.accent, marginTop: 10 },
}));
