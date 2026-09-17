import React, { useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PortalView, PORTAL_TITLES, useUiStore } from '@/state/store';
import { usePortalNav } from '@/api/hooks';
import { makeStyles, radius, useTheme, useIsDesktop } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { CgInfinityLogo } from '@/components/brand/CgInfinityLogo';
import { PageWash } from '@/components/ui/PageWash';
import { ProfileMenu } from '@/components/ui/ProfileMenu';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { SurfaceHeader } from '@/components/navigation/SurfaceHeader';
import { AppSidebar, SidebarItem } from '@/components/navigation/AppSidebar';
import { RatesTabIcon, SolarTabIcon, OutageTabIcon, SupportTabIcon } from '@/components/icons/TabIcons';
import { hiddenScrollbar } from '@/components/ui/scroll';

import { FaqAccordion } from './FaqAccordion';
import { AskPanel } from './AskPanel';
import { OutageMapWidget } from './OutageMapWidget';
import { RatesSection, UsageCard, RatePlanCardsSection } from './sections/RatesSection';
import { SolarSection, SolarCard } from './sections/SolarSection';
import { OutagesSection } from './sections/OutagesSection';
import { SupportSection } from './sections/SupportSection';

/**
 * Public portal surface — a marketing/self-service page at conedison.com,
 * ported from `OneGridAI Platform.dc.html` (isPortal block, lines ~423-557).
 * No account needed: a usage slider prices the three residential rate
 * plans, a solar comparison, an FAQ accordion and a read-only "Ask
 * OneGridAI" side panel that shares chat state with the customer app.
 *
 * On a desktop-width window it takes the shell the other surfaces use — a
 * header across the top and the shared full-height sidebar down the left,
 * splitting the page into Rates, Solar, Outages and Support. Narrower than
 * that it stays the single scrolling marketing page it was built as.
 */
export function PublicPortal() {
  const styles = useStyles();
  const desktop = useIsDesktop();
  return <View style={styles.fill}>{desktop ? <PortalWide /> : <PortalCompact />}</View>;
}

const PORTAL_SIDEBAR: readonly SidebarItem<PortalView>[] = [
  { key: 'rates', label: 'Rates', meta: 'Compare every plan', Icon: RatesTabIcon },
  { key: 'solar', label: 'Solar', meta: 'Model an array', Icon: SolarTabIcon },
  { key: 'outages', label: 'Outages', meta: 'Live map and events', Icon: OutageTabIcon },
  { key: 'support', label: 'Support', meta: 'Reach a person', Icon: SupportTabIcon },
];

const PORTAL_PROFILE_DETAILS = [
  { label: 'Utility', value: 'Con Edison' },
  { label: 'Access', value: 'Public self-service' },
] as const;

/** Desktop portal: header, sidebar, one section at a time. */
function PortalWide() {
  const styles = useStyles();
  const portalView = useUiStore((s) => s.portalView);
  const setPortalView = useUiStore((s) => s.setPortalView);
  const [collapsed, setCollapsed] = useState(false);

  const active = (
    <ScreenTransition key={portalView}>
      {portalView === 'rates' && <RatesSection compact={false} />}
      {portalView === 'solar' && <SolarSection compact={false} />}
      {portalView === 'outages' && <OutagesSection compact={false} />}
      {portalView === 'support' && <SupportSection compact={false} />}
    </ScreenTransition>
  );

  return (
    <View style={styles.shell}>
      <PageWash />
      <SurfaceHeader
        eyebrow="Con Edison · Powered by OneGridAI"
        title={PORTAL_TITLES[portalView]}
        profileDetails={PORTAL_PROFILE_DETAILS}
        showAccountControls={false}
      />

      <View style={styles.wideBody}>
        <AppSidebar
          items={PORTAL_SIDEBAR}
          current={portalView}
          onPick={setPortalView}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          footnote="Prices are modelled against the filed Con Edison tariff. Indicative, not a quotation."
        />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.wideContent} {...hiddenScrollbar}>
          <View style={styles.wideColumn}>{active}</View>
        </ScrollView>
      </View>
    </View>
  );
}

/** Narrow portal, unchanged: one scrolling marketing page. */
function PortalCompact() {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const compact = width < 900;

  return (
    <View style={styles.shell}>
      <PageWash />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} {...hiddenScrollbar}>
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
    </View>
  );
}

function TopNav({ compact }: { compact: boolean }) {
  const styles = useStyles();
  const { data } = usePortalNav();

  return (
    <View style={[styles.nav, { paddingHorizontal: compact ? 20 : 40 }]}>
      <View style={styles.navLeft}>
        <CgInfinityLogo size={compact ? 26 : 30} withWordmark={false} />
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
        <ProfileMenu onInverse details={PORTAL_PROFILE_DETAILS} />
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

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, width: '100%' },
  scroll: { flex: 1, width: '100%', backgroundColor: 'transparent' },
  shell: { flex: 1, backgroundColor: t.colors.page },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },

  // Desktop shell: the sidebar is flush to the window edges, the page beside
  // it carries the gutter.
  wideBody: { flex: 1, flexDirection: 'row', width: '100%' },
  wideContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 30, paddingTop: 24, paddingBottom: 34 },
  wideColumn: { width: '100%', maxWidth: 1180 },

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
}));
