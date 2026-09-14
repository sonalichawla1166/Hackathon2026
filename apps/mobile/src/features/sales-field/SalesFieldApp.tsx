import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useUiStore, SalesScreen } from '@/state/store';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LeadsTabIcon, StatsTabIcon } from '@/components/icons/TabIcons';

import { LeadsScreen } from './screens/LeadsScreen';
import { LeadDetailScreen } from './screens/LeadDetailScreen';
import { StatsScreen } from './screens/StatsScreen';

const TITLES: Record<SalesScreen, string> = {
  leads: 'Nearby leads',
  detail: 'Lead',
  stats: 'Today',
};

const TABS: { key: SalesScreen; label: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { key: 'leads', label: 'Leads', Icon: LeadsTabIcon },
  { key: 'stats', label: 'Stats', Icon: StatsTabIcon },
];

export function SalesFieldApp() {
  return (
    <View style={styles.fill}>
      <SalesFieldShell />
    </View>
  );
}

function SalesFieldShell() {
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
      <Header title={TITLES[screen]} onLogout={logout} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        {screen === 'leads' && <LeadsScreen />}
        {screen === 'detail' && <LeadDetailScreen />}
        {screen === 'stats' && <StatsScreen />}
      </ScrollView>

      <TabBar current={screen === 'detail' ? 'leads' : screen} onPick={goToTab} />
    </View>
  );
}

function Header({ title, onLogout }: { title: string; onLogout: () => void }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerEyebrow}>OneGridAI · Field sales</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <Pressable onPress={onLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutLabel}>Log out</Text>
      </Pressable>
    </View>
  );
}

function TabBar({ current, onPick }: { current: SalesScreen; onPick: (s: SalesScreen) => void }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map(({ key, label, Icon }) => {
        const active = current === key;
        const color = active ? colors.primary : colors.textMuted;
        return (
          <Pressable key={key} onPress={() => onPick(key)} style={styles.tabItem}>
            <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
            <Icon color={color} />
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%' },
  shell: { flex: 1, backgroundColor: colors.surfaceCard },
  header: {
    backgroundColor: colors.primary,
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
    borderColor: 'rgba(255,255,255,0.35)',
  },
  logoutLabel: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: '#fff' },
  headerEyebrow: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 9,
    letterSpacing: 1.35,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.73)',
  },
  headerTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 19,
    color: '#fff',
    marginTop: 4,
  },
  body: { flex: 1, backgroundColor: colors.surfaceCard },
  bodyContent: { paddingBottom: 8 },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surfaceCard,
    borderTopWidth: 2,
    borderTopColor: colors.surfaceMuted,
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingTop: 10,
    paddingBottom: 6,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.cta,
  },
  tabIndicatorActive: { width: 30 },
  tabLabel: { fontFamily: fontFamily.bodyBold, fontSize: 9.5 },
});
