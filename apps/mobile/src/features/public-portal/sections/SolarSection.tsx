import React from 'react';
import { View, Text } from 'react-native';
import { useUiStore } from '@/state/store';
import { usePortalSolar } from '@/api/hooks';
import { makeStyles, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Citation } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

/**
 * The array-size card. Shared by the compact single-page layout and the Solar
 * section, so the two cannot drift.
 */
export function SolarCard() {
  const styles = useStyles();
  const solarKw = useUiStore((s) => s.solarKw);
  const setSolarKw = useUiStore((s) => s.setSolarKw);
  const { data, isPending, isError, error, refetch } = usePortalSolar(solarKw);

  return (
    <View style={styles.solarCard}>
      <View style={styles.solarHeader}>
        <Text style={styles.solarTitle}>Add solar to the comparison</Text>
        <Text style={styles.solarNote}>{data ? data.note : 'Generation modelled at ~1,250 kWh/kW/yr for Long Island'}</Text>
      </View>
      <View style={styles.solarBody}>
        <View style={styles.solarSlider}>
          <View style={styles.solarSliderHeader}>
            <Text style={styles.solarSliderLabel}>Array size</Text>
            <Text style={styles.solarSliderLabel}>{solarKw} kW</Text>
          </View>
          <RangeSlider value={solarKw} minimumValue={0} maximumValue={12} step={0.5} onValueChange={setSolarKw} />
        </View>
        {isPending && <LoadingState label="Modelling your roof…" inline />}
        {isError && <ErrorState error={error} onRetry={refetch} />}
        {data &&
          data.stats.map((s) => (
            <View key={s.k} style={styles.stat}>
              <Text style={styles.statLabel}>{s.k}</Text>
              <Text style={styles.statValue}>{s.v}</Text>
            </View>
          ))}
      </View>
    </View>
  );
}

/** What net metering actually does with the kWh a roof exports. */
const NET_METERING = [
  {
    id: 'credit',
    title: 'Exports are credited at the full retail rate',
    body: 'Every kWh the array sends back is worth what a kWh costs you to buy — delivery and supply, not just supply.',
  },
  {
    id: 'rollover',
    title: 'Credits roll forward for twelve months',
    body: 'A summer surplus offsets the following winter. Unused credit expires at the end of the twelve-month cycle.',
  },
  {
    id: 'no-cheque',
    title: 'No cash is paid out',
    body: 'Credits reduce future bills. They are never refunded, so sizing an array far beyond your own usage buys nothing.',
  },
  {
    id: 'standing',
    title: 'The standing charge still applies',
    body: 'The basic service charge covers the meter and the service line. A zero-usage month is not a zero bill.',
  },
];

/**
 * Solar: size an array, see what it does to the bill, and read the four rules
 * that decide whether it is worth it.
 */
export function SolarSection({ compact }: { compact: boolean }) {
  const styles = useStyles();

  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>
        Generation is modelled from PVWatts v8 for this ZIP code and applied to the usage shape you set under
        Rates, so the two sections always agree.
      </Text>
      <SolarCard />

      <View style={styles.rulesBlock}>
        <Text style={styles.blockTitle}>How net metering works here</Text>
        <View style={[styles.rules, compact && styles.rulesCompact]}>
          {NET_METERING.map((r) => (
            <View key={r.id} style={styles.ruleCard}>
              <Text style={styles.ruleTitle}>{r.title}</Text>
              <Text style={styles.ruleBody}>{r.body}</Text>
            </View>
          ))}
        </View>
        <View style={styles.citeRow}>
          <Citation label="PSEG Long Island · Rate 194 · Net Metering Rider" />
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 22 },
  intro: { fontFamily: fontFamily.body, fontSize: 13, color: t.colors.textMuted, lineHeight: 19, maxWidth: 640 },

  solarCard: { backgroundColor: t.colors.surfaceCard, borderWidth: 2, borderColor: t.colors.surfaceMuted, borderRadius: radius.md, padding: 22 },
  solarHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 },
  solarTitle: { fontFamily: fontFamily.heading, fontSize: 17, color: t.colors.textHeading },
  solarNote: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.accent },
  solarBody: { flexDirection: 'row', flexWrap: 'wrap', gap: 26, marginTop: 18, alignItems: 'center' },
  solarSlider: { flex: 1, minWidth: 230 },
  solarSliderHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  solarSliderLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: t.colors.textHeading },
  stat: {},
  statLabel: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted },
  statValue: { fontFamily: fontFamily.heading, fontSize: 21, color: t.colors.textHeading, marginTop: 4 },

  rulesBlock: { gap: 12 },
  blockTitle: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textHeading },
  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  rulesCompact: { flexDirection: 'column' },
  ruleCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 240,
    backgroundColor: t.colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 16,
  },
  ruleTitle: { fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading, lineHeight: 19 },
  ruleBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, marginTop: 6, lineHeight: 18 },
  citeRow: { alignSelf: 'flex-start' },
}));
