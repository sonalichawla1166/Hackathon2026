import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useUiStore } from '@/state/store';
import { useOutageMap, useReportOutage } from '@/api/hooks';
import { makeStyles, radius, useTheme, useIsDesktop } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function OutageScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const desktop = useIsDesktop();
  const reportPicks = useUiStore((s) => s.reportPicks);
  const toggleReportPick = useUiStore((s) => s.toggleReportPick);
  const { data, isPending, isError, error, refetch } = useOutageMap();
  const reportOutage = useReportOutage();

  if (isPending) return <LoadingState label="Loading outage map…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const disabled = reportPicks.length === 0;
  const reported = reportOutage.data?.reported ?? false;

  // The canvas runs to the card's own edges — a framed map reads as a picture
  // of a map. Title and caption carry the padding instead.
  const map = (
    <View style={styles.mapCard}>
      <View style={[styles.mapHeader, desktop && styles.mapHeaderDesktop]}>
        <Text style={styles.mapTitle}>Reported near you</Text>
      </View>
      <View style={[styles.map, desktop && styles.mapDesktop]}>
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
              borderColor: colors.surfaceMapCanvas,
            }}
          />
        ))}
        <View style={styles.youAreHere} />
      </View>
      <View style={[styles.mapFooter, desktop && styles.mapFooterDesktop]}>
        <Text style={styles.mapCaption}>{data.caption}</Text>
      </View>
    </View>
  );

  const form = (
    <View style={[styles.formCard, desktop && styles.formCardDesktop]}>
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
              <Text style={[styles.chipText, { color: on ? colors.textInverse : colors.textHeading }]}>{label}</Text>
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
  );

  const ticket =
    reported && reportOutage.data ? (
      <View style={styles.ticketCard}>
        <Text style={styles.ticketTitle}>Ticket {reportOutage.data.ticket} opened</Text>
        <Text style={styles.ticketBody}>{reportOutage.data.detail}</Text>
        <Text style={styles.ticketNote}>{reportOutage.data.note}</Text>
      </View>
    ) : null;

  // The map is the reason to be on this screen, so on desktop it takes the
  // full column width and the report form sits underneath it. Splitting them
  // into side-by-side columns shrank the map and left the form's own column
  // mostly empty.
  return (
    <View style={[styles.wrap, desktop && styles.wrapDesktop]}>
      {map}
      {form}
      {ticket}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { padding: 17, gap: 15 },
  wrapDesktop: { padding: 0, gap: 18 },
  mapCard: {
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  mapHeader: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 12 },
  mapHeaderDesktop: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  mapFooter: { paddingHorizontal: 15, paddingVertical: 12 },
  mapFooterDesktop: { paddingHorizontal: 20, paddingVertical: 14 },
  mapTitle: { fontFamily: fontFamily.heading, fontSize: 12.5, color: t.colors.textHeading },
  map: { height: 150, backgroundColor: t.colors.surfaceMapCanvas },
  // Pins are placed as percentages, so the canvas can grow without moving them.
  mapDesktop: { height: 420 },
  youAreHere: {
    position: 'absolute', left: '47%', top: '52%', width: 14, height: 14, borderRadius: 7,
    backgroundColor: t.colors.inverseSolid, borderWidth: 3, borderColor: t.colors.cta,
  },
  mapCaption: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, lineHeight: 16 },
  formCard: { backgroundColor: t.colors.surfaceCard, borderWidth: 2, borderColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  formCardDesktop: { padding: 20 },
  formTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  chip: { borderWidth: 2, borderRadius: 3.2, paddingHorizontal: 11, paddingVertical: 8 },
  chipText: { fontFamily: fontFamily.body, fontSize: 12 },
  footerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    borderTopWidth: 2, borderTopColor: t.colors.surfaceMuted, marginTop: 14, paddingTop: 13,
  },
  address: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, lineHeight: 16 },
  ticketCard: { backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 15 },
  ticketTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading },
  ticketBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, marginTop: 5, lineHeight: 18 },
  ticketNote: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.accent, marginTop: 8 },
}));
