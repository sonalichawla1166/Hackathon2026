import React from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUiStore } from '@/state/store';
import { usePortalNav, usePortalRates, usePortalSolar } from '@/api/hooks';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { RangeSlider } from '@/components/ui/RangeSlider';
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
  const styles = useStyles();
  return (
    <View style={styles.fill}>
      <PortalBody />
    </View>
  );
}

function PortalBody() {
  const styles = useStyles();
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
  const styles = useStyles();
  const { data } = usePortalNav();
  const logout = useUiStore((s) => s.logout);

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
        <ThemeToggle onInverse compact />
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Hero({ compact }: { compact: boolean }) {
  const styles = useStyles();
  const { gradients } = useTheme();
  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingHorizontal: compact ? 20 : 40, paddingVertical: compact ? 28 : 44 }]}
    >
      <View style={styles.heroInner}>
        <Text style={[styles.heroTitle, { fontSize: compact ? 26 : 36, lineHeight: compact ? 31 : 41 }]}>
          See What You Would Pay on Every Rate Plan
        </Text>
        <Text style={styles.heroBody}>
          No account needed. Move the slider to your typical monthly usage and we will price all three
          residential plans against the current tariff.
        </Text>
      </View>
    </LinearGradient>
  );
}

function UsageCard() {
  const styles = useStyles();
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
  const styles = useStyles();
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

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, width: '100%' },
  scroll: { flex: 1, width: '100%', backgroundColor: t.colors.page },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },

  nav: {
    backgroundColor: t.colors.primary,
    minHeight: 70,
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 34, flexWrap: 'wrap' },
  wordmark: { fontFamily: fontFamily.heading, fontSize: 19, color: t.colors.textInverse },
  navItems: { flexDirection: 'row', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  navItem: { fontFamily: fontFamily.body, fontSize: 14, color: t.colors.textInverseMuted },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  poweredBy: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textInverseMuted },
  logoutBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: t.colors.borderInverse,
  },
  logoutLabel: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.textInverse },

  hero: {},
  heroInner: { maxWidth: 760 },
  heroTitle: { fontFamily: fontFamily.heading, color: t.colors.textInverse },
  heroBody: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 24, color: t.colors.textInverseMutedAlt, marginTop: 12 },

  body: { padding: 24, gap: 24 },
  bodyWide: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 40, paddingTop: 34, paddingBottom: 40 },
  bodyCompact: { flexDirection: 'column' },
  mainCol: { flex: 1, minWidth: 0, gap: 26 },
  rail: { gap: 20 },
  railWide: { width: 330 },
  railCompact: { width: '100%' },

  usageCard: { backgroundColor: t.colors.surfaceMuted, borderRadius: radius.md, padding: 22 },
  usageHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  usageLabel: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textHeading },
  usageValue: { fontFamily: fontFamily.heading, fontSize: 26, color: t.colors.textHeading },
  usageEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  usageEndLabel: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted },

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
}));
