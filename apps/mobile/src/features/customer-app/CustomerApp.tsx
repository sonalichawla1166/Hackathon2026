import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUiStore, AppScreen, SCREEN_TITLES } from '@/state/store';
import { colors, gradients } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { HomeTabIcon, ChatTabIcon, BillTabIcon, ForYouTabIcon, ReportTabIcon } from '@/components/icons/TabIcons';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { BoldTabBar, TabDef } from '@/components/navigation/BoldTabBar';

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
  return (
    <View style={styles.fill}>
      <CustomerAppShell />
    </View>
  );
}

function CustomerAppShell() {
  const screen = useUiStore((s) => s.screen);
  const setScreen = useUiStore((s) => s.setScreen);
  const logout = useUiStore((s) => s.logout);

  return (
    <View style={styles.shell}>
      <Header title={SCREEN_TITLES[screen]} onBell={() => setScreen('alert')} onLogout={logout} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <ScreenTransition key={screen}>
          {screen === 'home' && <HomeScreen />}
          {screen === 'chat' && <ChatScreen />}
          {screen === 'bill' && <BillScreen />}
          {screen === 'sim' && <SimScreen />}
          {screen === 'alert' && <AlertScreen />}
          {screen === 'programs' && <ProgramsScreen />}
          {screen === 'outage' && <OutageScreen />}
          {screen === 'pay' && <PayScreen />}
        </ScreenTransition>
      </ScrollView>

      <BoldTabBar tabs={TABS} current={screen} onPick={setScreen} />
    </View>
  );
}

function Header({ title, onBell, onLogout }: { title: string; onBell: () => void; onLogout: () => void }) {
  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
      <View>
        <Text style={styles.headerEyebrow}>Con Edison · OneGridAI</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
        <Pressable onPress={onBell} style={styles.bell}>
          <Text style={styles.bellGlyph}>!</Text>
          <View style={styles.bellDot} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%' },
  shell: { flex: 1, backgroundColor: colors.surfaceCard },
  header: {
    paddingTop: 24,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  bell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellGlyph: { fontFamily: fontFamily.bodyBold, fontSize: 16, color: '#fff' },
  bellDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  body: { flex: 1, backgroundColor: colors.surfaceCard },
  bodyContent: { paddingBottom: 8 },
});
