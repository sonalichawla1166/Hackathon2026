import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useUiStore, SalesScreen } from '@/state/store';
import { makeStyles, useIsDesktop } from '@/theme';
import { PageWash } from '@/components/ui/PageWash';
import { LeadsTabIcon, PipelineTabIcon, StatsTabIcon } from '@/components/icons/TabIcons';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { BoldTabBar, TabDef } from '@/components/navigation/BoldTabBar';
import { SurfaceHeader } from '@/components/navigation/SurfaceHeader';
import { AppSidebar, SidebarItem } from '@/components/navigation/AppSidebar';

import { LeadsScreen } from './screens/LeadsScreen';
import { LeadDetailScreen } from './screens/LeadDetailScreen';
import { PipelineScreen } from './screens/PipelineScreen';
import { StatsScreen } from './screens/StatsScreen';
import { hiddenScrollbar } from '@/components/ui/scroll';

const TITLES: Record<SalesScreen, string> = {
  leads: 'Nearby leads',
  detail: 'Lead',
  pipeline: 'Pipeline',
  stats: 'Today',
};

const TABS: TabDef<SalesScreen>[] = [
  { key: 'leads', label: 'Leads', Icon: LeadsTabIcon },
  { key: 'pipeline', label: 'Pipeline', Icon: PipelineTabIcon },
  { key: 'stats', label: 'Stats', Icon: StatsTabIcon },
];

/** The same three destinations, dressed for the desktop sidebar. */
const SIDEBAR_ITEMS: readonly SidebarItem<SalesScreen>[] = [
  { key: 'leads', label: 'Leads', meta: 'Nearby, nearest first', Icon: LeadsTabIcon },
  { key: 'pipeline', label: 'Pipeline', meta: 'Your book by stage', Icon: PipelineTabIcon },
  { key: 'stats', label: 'Stats', meta: "Today's knocks and route", Icon: StatsTabIcon },
];

const SALES_PROFILE_DETAILS = [
  { label: 'Territory', value: 'Con Edison · Brooklyn North' },
  { label: 'Access', value: 'Field sales' },
] as const;

/** The board is a wide column, so it gets more room than the other two. */
const CONTENT_MAX_WIDTH = 1180;
const GUTTER = 24;

export function SalesFieldApp() {
  const styles = useStyles();
  return (
    <View style={styles.fill}>
      <SalesFieldShell />
    </View>
  );
}

function SalesFieldShell() {
  const styles = useStyles();
  const desktop = useIsDesktop();
  const screen = useUiStore((s) => s.salesScreen);
  const setScreen = useUiStore((s) => s.setSalesScreen);
  const selectLead = useUiStore((s) => s.selectLead);

  // Starts expanded; the toggle in the sidebar's top corner narrows it.
  const [collapsed, setCollapsed] = useState(false);

  const goToTab = (key: SalesScreen) => {
    if (key !== 'detail') selectLead(null);
    setScreen(key);
  };

  // A lead detail is opened from the leads list, so the list stays lit.
  const navCurrent: SalesScreen = screen === 'detail' ? 'leads' : screen;

  const active = (
    <ScreenTransition key={screen}>
      {screen === 'leads' && <LeadsScreen />}
      {screen === 'detail' && <LeadDetailScreen />}
      {screen === 'pipeline' && <PipelineScreen />}
      {screen === 'stats' && <StatsScreen />}
    </ScreenTransition>
  );

  return (
    <View style={styles.shell}>
      <PageWash />
      <SurfaceHeader
        eyebrow="CG Infinity · Field sales"
        title={TITLES[screen]}
        profileDetails={SALES_PROFILE_DETAILS}
        showAccountControls={!desktop}
      />

      {desktop ? (
        <View style={styles.desktopBody}>
          <AppSidebar
            items={SIDEBAR_ITEMS}
            current={navCurrent}
            onPick={goToTab}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
          />

          <ScrollView style={styles.body} contentContainerStyle={styles.desktopContent} {...hiddenScrollbar}>
            <View style={styles.desktopColumn}>{active}</View>
          </ScrollView>
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

          <BoldTabBar tabs={TABS} current={navCurrent} onPick={goToTab} />
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
    paddingHorizontal: GUTTER,
    paddingTop: 22,
    paddingBottom: 24,
  },
  desktopColumn: { width: '100%', maxWidth: CONTENT_MAX_WIDTH },
}));
