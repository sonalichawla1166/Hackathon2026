import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUiStore, SalesScreen } from '@/state/store';
import { makeStyles, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { PageWash } from '@/components/ui/PageWash';
import { LeadsTabIcon, PipelineTabIcon, StatsTabIcon } from '@/components/icons/TabIcons';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { BoldTabBar, TabDef } from '@/components/navigation/BoldTabBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
  const logout = useUiStore((s) => s.logout);

  const goToTab = (key: SalesScreen) => {
    if (key !== 'detail') selectLead(null);
    setScreen(key);
  };

  return (
    <View style={styles.shell}>
      <PageWash />
      <Header title={TITLES[screen]} onLogout={logout} />

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

function Header({ title, onLogout }: { title: string; onLogout: () => void }) {
  const styles = useStyles();
  const { gradients } = useTheme();
  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
      <View>
        <Text style={styles.headerEyebrow}>OneGridAI · Field sales</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.headerActions}>
        <ThemeToggle onInverse compact />
        <Pressable onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const useStyles = makeStyles((t) => ({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fill: { flex: 1, width: '100%' },
  shell: { flex: 1, backgroundColor: t.colors.page },
  header: {
    paddingTop: 24,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: t.colors.borderInverse,
  },
  logoutLabel: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: t.colors.textInverse },
  headerEyebrow: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 9,
    letterSpacing: 1.35,
    textTransform: 'uppercase',
    color: t.colors.textInverseMuted,
  },
  headerTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 19,
    color: t.colors.textInverse,
    marginTop: 4,
  },
  body: { flex: 1, backgroundColor: 'transparent' },
  bodyContent: { paddingBottom: 8 },
}));
