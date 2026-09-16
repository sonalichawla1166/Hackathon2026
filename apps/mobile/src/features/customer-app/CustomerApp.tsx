import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useUiStore, AppScreen, SCREEN_TITLES } from '@/state/store';
import { useAccountSummary } from '@/api/hooks';
import { makeStyles, useTheme, useIsDesktop } from '@/theme';
import { PageWash } from '@/components/ui/PageWash';
import { BellIcon } from '@/components/icons/BrandIcons';
import { HomeTabIcon, ChatTabIcon, BillTabIcon, ForYouTabIcon, ReportTabIcon } from '@/components/icons/TabIcons';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { BoldTabBar, TabDef } from '@/components/navigation/BoldTabBar';
import { SurfaceHeader } from '@/components/navigation/SurfaceHeader';
import { hiddenScrollbar } from '@/components/ui/scroll';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { DESKTOP_CONTENT_MAX_WIDTH, DESKTOP_GUTTER } from './layout';

import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { BillScreen } from './screens/BillScreen';
import { SimScreen } from './screens/SimScreen';
import { AlertScreen } from './screens/AlertScreen';
import { ProgramsScreen } from './screens/ProgramsScreen';
import { OutageScreen } from './screens/OutageScreen';
import { PayScreen } from './screens/PayScreen';

const TABS: TabDef<AppScreen>[] = [
  { key: 'home', label: 'Home', Icon: HomeTabIcon },
  { key: 'chat', label: 'Ask', Icon: ChatTabIcon },
  { key: 'bill', label: 'Bill', Icon: BillTabIcon },
  { key: 'programs', label: 'For you', Icon: ForYouTabIcon },
  { key: 'outage', label: 'Report', Icon: ReportTabIcon },
];

export function CustomerApp() {
  const styles = useStyles();
  return (
    <View style={styles.fill}>
      <CustomerAppShell />
    </View>
  );
}

function CustomerAppShell() {
  const styles = useStyles();
  const { colors } = useTheme();
  const desktop = useIsDesktop();
  const screen = useUiStore((s) => s.screen);
  const setScreen = useUiStore((s) => s.setScreen);
  const { data: account } = useAccountSummary();

  // Starts expanded; the toggle in the sidebar's top corner narrows it.
  const [collapsed, setCollapsed] = useState(false);

  // The account's own facts belong in the profile menu, not the header bar.
  const profileDetails = useMemo(
    () =>
      account?.customer
        ? [
            { label: 'Account holder', value: account.customer.name },
            { label: 'Utility', value: account.customer.utility },
          ]
        : [],
    [account?.customer]
  );

  const actions = useMemo(
    () => [
      {
        key: 'alerts',
        label: 'Meter alerts',
        icon: <BellIcon size={17} color={colors.textInverse} />,
        onPress: () => setScreen('alert'),
        badge: true,
      },
    ],
    [colors.textInverse, setScreen]
  );

  // Ask scrolls its own conversation and pins its composer, so on desktop it
  // gets a bounded pane instead of the page scroller — nesting the two would
  // leave the composer floating in the middle of a tall window.
  const selfScrolling = desktop && screen === 'chat';

  const active = (
    // Without an explicit `flex`, the transition wrapper keeps an auto basis
    // and Yoga's default `flexShrink: 0`, so a long conversation sizes the
    // pane to its own content and pushes the composer past the bottom of the
    // window. A zero basis is what makes the pane bounded.
    <ScreenTransition key={screen} style={selfScrolling ? styles.fillTransition : undefined}>
      {screen === 'home' && <HomeScreen />}
      {screen === 'chat' && <ChatScreen />}
      {screen === 'bill' && <BillScreen />}
      {screen === 'sim' && <SimScreen />}
      {screen === 'alert' && <AlertScreen />}
      {screen === 'programs' && <ProgramsScreen />}
      {screen === 'outage' && <OutageScreen />}
      {screen === 'pay' && <PayScreen />}
    </ScreenTransition>
  );

  return (
    <View style={styles.shell}>
      <PageWash />
      <SurfaceHeader
        eyebrow="CG Infinity · OneGridAI"
        title={SCREEN_TITLES[screen]}
        actions={actions}
        profileDetails={profileDetails}
        showAccountControls={!desktop}
      />

      {desktop ? (
        <View style={styles.desktopBody}>
          <AppSidebar
            items={TABS}
            current={screen}
            onPick={setScreen}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
          />

          {selfScrolling ? (
            <View style={styles.desktopPane}>
              <View style={styles.desktopColumnFill}>{active}</View>
            </View>
          ) : (
            <ScrollView style={styles.body} contentContainerStyle={styles.desktopContent} {...hiddenScrollbar}>
              <View style={styles.desktopColumn}>{active}</View>
            </ScrollView>
          )}
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            {...hiddenScrollbar}
          >
            {active}
          </ScrollView>

          <BoldTabBar tabs={TABS} current={screen} onPick={setScreen} />
        </>
      )}
    </View>
  );
}


const useStyles = makeStyles((t) => ({
  fill: { flex: 1, width: '100%' },
  shell: { flex: 1, backgroundColor: t.colors.page },
  body: { flex: 1, backgroundColor: 'transparent' },
  bodyContent: { flexGrow: 1, paddingBottom: 8 },

  // The sidebar is flush to the window edges so it reads as a wall; only the
  // page column beside it carries a gutter.
  desktopBody: { flex: 1, flexDirection: 'row', width: '100%' },
  desktopContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: DESKTOP_GUTTER,
    paddingTop: 22,
    paddingBottom: 24,
  },
  desktopPane: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    alignItems: 'center',
    paddingHorizontal: DESKTOP_GUTTER,
    paddingTop: 22,
    paddingBottom: 24,
  },
  desktopColumn: { width: '100%', maxWidth: DESKTOP_CONTENT_MAX_WIDTH },
  // Only the self-scrolling pane fills its height; a scrolled column must be
  // free to grow past the viewport.
  desktopColumnFill: { flex: 1, minHeight: 0, width: '100%', maxWidth: DESKTOP_CONTENT_MAX_WIDTH },
  fillTransition: { flex: 1, minHeight: 0 },
}));
