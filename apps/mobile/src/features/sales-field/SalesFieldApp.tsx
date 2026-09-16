import React from 'react';
import { View, ScrollView } from 'react-native';
import { useUiStore, SalesScreen } from '@/state/store';
import { makeStyles } from '@/theme';
import { PageWash } from '@/components/ui/PageWash';
import { LeadsTabIcon, PipelineTabIcon, StatsTabIcon } from '@/components/icons/TabIcons';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { BoldTabBar, TabDef } from '@/components/navigation/BoldTabBar';
import { SurfaceHeader } from '@/components/navigation/SurfaceHeader';

import { LeadsScreen } from './screens/LeadsScreen';
import { LeadDetailScreen } from './screens/LeadDetailScreen';
import { PipelineScreen } from './screens/PipelineScreen';
import { StatsScreen } from './screens/StatsScreen';

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
  const screen = useUiStore((s) => s.salesScreen);
  const setScreen = useUiStore((s) => s.setSalesScreen);
  const selectLead = useUiStore((s) => s.selectLead);

  const goToTab = (key: SalesScreen) => {
    if (key !== 'detail') selectLead(null);
    setScreen(key);
  };

  return (
    <View style={styles.shell}>
      <PageWash />
      <SurfaceHeader eyebrow="CG Infinity · Field sales" title={TITLES[screen]} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <ScreenTransition key={screen}>
          {screen === 'leads' && <LeadsScreen />}
          {screen === 'detail' && <LeadDetailScreen />}
          {screen === 'pipeline' && <PipelineScreen />}
          {screen === 'stats' && <StatsScreen />}
        </ScreenTransition>
      </ScrollView>

      <BoldTabBar tabs={TABS} current={screen === 'detail' ? 'leads' : screen} onPick={goToTab} />
    </View>
  );
}


const useStyles = makeStyles((t) => ({
  fill: { flex: 1, width: '100%' },
  shell: { flex: 1, backgroundColor: t.colors.page },
  body: { flex: 1, backgroundColor: 'transparent' },
  bodyContent: { paddingBottom: 8 },
}));
