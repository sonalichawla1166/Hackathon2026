import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useUiStore } from '@/state/store';
import { usePortalNav, usePortalRates, usePortalSolar } from '@/api/hooks';
import { colors, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { BrowserFrame } from '@/components/chrome/DeviceFrame';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { RatePlanCards } from './RatePlanCards';
import { FaqAccordion } from './FaqAccordion';
import { AskPanel } from './AskPanel';
import { OutageMapWidget } from './OutageMapWidget';

/**
 * Public portal surface — a marketing/self-service page at conedison.com,
 * ported from `OneGridAI Platform.dc.html` (isPortal block, lines ~423-557).
 * No account needed: a usage slider prices the three residential rate
 * plans, a solar comparison, an FAQ accordion and a read-only "Ask
 * OneGridAI" side panel that shares chat state with the customer app.
 */
export function PublicPortal() {
  return (
    <BrowserFrame url="conedison.com/rates/compare">
      <PortalBody />
    </BrowserFrame>
  );
}

function PortalBody() {
  const { width } = useWindowDimensions();
  const compact = width < 900;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <TopNav compact={compact} />
      <Hero compact={compact} />
      <View style={[styles.body, compact ? styles.bodyCompact : styles.bodyWide]}>
        <View style={styles.mainCol}>
          <UsageCard />
          <RatePlanCardsSection compact={compact} />
          <SolarCard />
          <FaqAccordion />
        </View>
        <View style={[styles.rail, compact ? styles.railCompact : styles.railWide]}>
          <AskPanel />
          <OutageMapWidget />
        </View>
      </View>
    </ScrollView>
  );
}

function TopNav({ compact }: { compact: boolean }) {
  const { data } = usePortalNav();

  return (
    <View style={[styles.nav, { paddingHorizontal: compact ? 20 : 40 }]}>
      <View style={styles.navLeft}>
        <Text style={styles.wordmark}>Con Edison</Text>
        {!compact && !!data && (
          <View style={styles.navItems}>
            {data.nav.map((n) => (
              <Text key={n} style={styles.navItem}>
                {n}
              </Text>
            ))}
          </View>
        )}
      </View>
      <View style={styles.navRight}>
        {!compact && !!data && <Text style={styles.poweredBy}>{data.poweredBy}</Text>}
        <Button variant="cta" size="md">
          Sign in
        </Button>
      </View>
    </View>
  );
}

function Hero({ compact }: { compact: boolean }) {
  return (
    <View style={[styles.hero, { paddingHorizontal: compact ? 20 : 40, paddingVertical: compact ? 28 : 44 }]}>
      <View style={styles.heroInner}>
        <Text style={[styles.heroTitle, { fontSize: compact ? 26 : 36, lineHeight: compact ? 31 : 41 }]}>
          See What You Would Pay on Every Rate Plan
        </Text>
        <Text style={styles.heroBody}>
          No account needed. Move the slider to your typical monthly usage and we will price all three
          residential plans against the current tariff.
        </Text>
      </View>
    </View>
  );
}

function UsageCard() {
  const portalUsage = useUiStore((s) => s.portalUsage);
  const setPortalUsage = useUiStore((s) => s.setPortalUsage);
  const label = `${portalUsage.toLocaleString('en-US')} kWh`;

  return (
    <View style={styles.usageCard}>
      <View style={styles.usageHeader}>
        <Text style={styles.usageLabel}>Your monthly usage</Text>
        <Text style={styles.usageValue}>{label}</Text>
      </View>
      <RangeSlider value={portalUsage} minimumValue={200} maximumValue={2600} step={20} onValueChange={setPortalUsage} />
      <View style={styles.usageEnds}>
        <Text style={styles.usageEndLabel}>200 kWh</Text>
        <Text style={styles.usageEndLabel}>2,600 kWh</Text>
      </View>
    </View>
  );
}

function RatePlanCardsSection({ compact }: { compact: boolean }) {
  const portalUsage = useUiStore((s) => s.portalUsage);
  const { data, isPending, isError, error, refetch } = usePortalRates(portalUsage);

  if (isPending) return <LoadingState label="Pricing rate plans…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return <RatePlanCards plans={data.plans} compact={compact} />;
}

function SolarCard() {
  const solarKw = useUiStore((s) => s.solarKw);
  const setSolarKw = useUiStore((s) => s.setSolarKw);
  const { data, isPending, isError, error, refetch } = usePortalSolar(solarKw);

  return (
    <View style={styles.solarCard}>
      <View style={styles.solarHeader}>
        <Text style={styles.solarTitle}>Add solar to the comparison</Text>
        <Text style={styles.solarNote}>{data ? data.note : 'Generation modelled from PVWatts v8 for ZIP 10036'}</Text>
      </View>
      <View style={styles.solarBody}>
        <View style={styles.solarSlider}>
          <View style={styles.solarSliderHeader}>
            <Text style={styles.solarSliderLabel}>Array size</Text>
            <Text style={styles.solarSliderLabel}>{solarKw} kW</Text>
          </View>
          <RangeSlider value={solarKw} minimumValue={0} maximumValue={12} step={0.5} onValueChange={setSolarKw} />
        </View>
        {isPending && <LoadingState label="Modelling your roof…" />}
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

const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%', backgroundColor: colors.surfaceCard },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },

  nav: {
    backgroundColor: colors.primary,
    minHeight: 70,
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 34, flexWrap: 'wrap' },
  wordmark: { fontFamily: fontFamily.heading, fontSize: 19, color: '#fff' },
  navItems: { flexDirection: 'row', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  navItem: { fontFamily: fontFamily.body, fontSize: 14, color: 'rgba(255,255,255,0.73)' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  poweredBy: { fontFamily: fontFamily.body, fontSize: 12, color: 'rgba(255,255,255,0.73)' },

  hero: { backgroundColor: colors.accent },
  heroInner: { maxWidth: 760 },
  heroTitle: { fontFamily: fontFamily.heading, color: '#fff' },
  heroBody: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 24, color: 'rgba(255,255,255,0.9)', marginTop: 12 },

  body: { padding: 24, gap: 24 },
  bodyWide: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 40, paddingTop: 34, paddingBottom: 40 },
  bodyCompact: { flexDirection: 'column' },
  mainCol: { flex: 1, minWidth: 0, gap: 26 },
  rail: { gap: 20 },
  railWide: { width: 330 },
  railCompact: { width: '100%' },

  usageCard: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 22 },
  usageHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  usageLabel: { fontFamily: fontFamily.heading, fontSize: 15, color: colors.textHeading },
  usageValue: { fontFamily: fontFamily.heading, fontSize: 26, color: colors.textHeading },
  usageEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  usageEndLabel: { fontFamily: fontFamily.body, fontSize: 11, color: colors.textMuted },

  solarCard: { backgroundColor: colors.surfaceCard, borderWidth: 2, borderColor: colors.surfaceMuted, borderRadius: radius.md, padding: 22 },
  solarHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 },
  solarTitle: { fontFamily: fontFamily.heading, fontSize: 17, color: colors.textHeading },
  solarNote: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.accent },
  solarBody: { flexDirection: 'row', flexWrap: 'wrap', gap: 26, marginTop: 18, alignItems: 'center' },
  solarSlider: { flex: 1, minWidth: 230 },
  solarSliderHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  solarSliderLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.textHeading },
  stat: {},
  statLabel: { fontFamily: fontFamily.body, fontSize: 11, color: colors.textMuted },
  statValue: { fontFamily: fontFamily.heading, fontSize: 21, color: colors.textHeading, marginTop: 4 },
});
