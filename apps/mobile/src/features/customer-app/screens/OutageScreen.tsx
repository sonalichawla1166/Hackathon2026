import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useUiStore } from '@/state/store';
import { useOutageMap, useReportOutage } from '@/api/hooks';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function OutageScreen() {
  const reportPicks = useUiStore((s) => s.reportPicks);
  const toggleReportPick = useUiStore((s) => s.toggleReportPick);
  const { data, isPending, isError, error, refetch } = useOutageMap();
  const reportOutage = useReportOutage();

  if (isPending) return <LoadingState label="Loading outage map…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const disabled = reportPicks.length === 0;
  const reported = reportOutage.data?.reported ?? false;

  return (
    <View style={styles.wrap}>
      <View style={styles.mapCard}>
        <Text style={styles.mapTitle}>Reported near you</Text>
        <View style={styles.map}>
          {data.pins.map((p, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                width: p.d,
                height: p.d,
                borderRadius: p.d / 2,
                backgroundColor: p.danger ? colors.danger : colors.accent,
                borderWidth: 2,
                borderColor: colors.primary,
              }}
            />
          ))}
          <View style={styles.youAreHere} />
        </View>
        <Text style={styles.mapCaption}>{data.caption}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>What are you seeing?</Text>
        <View style={styles.chips}>
          {data.options.map((label, i) => {
            const on = reportPicks.includes(i);
            return (
              <Pressable
                key={label}
                onPress={() => toggleReportPick(i)}
                style={[
                  styles.chip,
                  on ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceMuted },
                ]}
              >
                <Text style={[styles.chipText, { color: on ? '#fff' : colors.textHeading }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.address}>412 W 47th St, Apt 6B{'\n'}Meter 8841-220-C</Text>
          <Button
            variant="cta"
            size="sm"
            disabled={disabled || reportOutage.isPending}
            onPress={() => reportOutage.mutate(reportPicks)}
          >
            {reported ? 'Reported' : 'Submit report'}
          </Button>
        </View>
      </View>

      {reported && reportOutage.data && (
        <View style={styles.ticketCard}>
          <Text style={styles.ticketTitle}>Ticket {reportOutage.data.ticket} opened</Text>
          <Text style={styles.ticketBody}>{reportOutage.data.detail}</Text>
          <Text style={styles.ticketNote}>{reportOutage.data.note}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 17, gap: 15 },
  mapCard: { backgroundColor: colors.primary, borderRadius: 5.4, padding: 15, overflow: 'hidden' },
  mapTitle: { fontFamily: fontFamily.heading, fontSize: 12.5, color: '#fff' },
  map: { height: 150, marginTop: 12, borderRadius: 3.2, backgroundColor: '#253541', overflow: 'hidden' },
  youAreHere: {
    position: 'absolute', left: '47%', top: '52%', width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#fff', borderWidth: 3, borderColor: colors.cta,
  },
  mapCaption: { fontFamily: fontFamily.body, fontSize: 11.5, color: 'rgba(255,255,255,0.73)', marginTop: 10, lineHeight: 16 },
  formCard: { backgroundColor: colors.surfaceCard, borderWidth: 2, borderColor: colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  formTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: colors.textHeading },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  chip: { borderWidth: 2, borderRadius: 3.2, paddingHorizontal: 11, paddingVertical: 8 },
  chipText: { fontFamily: fontFamily.body, fontSize: 12 },
  footerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    borderTopWidth: 2, borderTopColor: colors.surfaceMuted, marginTop: 14, paddingTop: 13,
  },
  address: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.textMuted, lineHeight: 16 },
  ticketCard: { backgroundColor: colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  ticketTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: colors.textHeading },
  ticketBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted, marginTop: 5, lineHeight: 18 },
  ticketNote: { fontFamily: fontFamily.body, fontSize: 11, color: colors.accent, marginTop: 8 },
});
