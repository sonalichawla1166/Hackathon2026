import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useUiStore, AppScreen, SCREEN_TITLES } from '@/state/store';
import { useAccountSummary } from '@/api/hooks';
import { makeStyles, useTheme } from '@/theme';
import { PageWash } from '@/components/ui/PageWash';
import { BellIcon } from '@/components/icons/BrandIcons';
import { HomeTabIcon, ChatTabIcon, BillTabIcon, ForYouTabIcon, ReportTabIcon } from '@/components/icons/TabIcons';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { BoldTabBar, TabDef } from '@/components/navigation/BoldTabBar';
import { SurfaceHeader } from '@/components/navigation/SurfaceHeader';

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
  const screen = useUiStore((s) => s.screen);
  const setScreen = useUiStore((s) => s.setScreen);
  const { data: account } = useAccountSummary();

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

  return (
    <View style={styles.shell}>
      <PageWash />
      <SurfaceHeader
        eyebrow="CG Infinity · OneGridAI"
        title={SCREEN_TITLES[screen]}
        actions={actions}
        profileDetails={profileDetails}
      />

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


const useStyles = makeStyles((t) => ({
  fill: { flex: 1, width: '100%' },
  shell: { flex: 1, backgroundColor: t.colors.page },
  body: { flex: 1, backgroundColor: 'transparent' },
  bodyContent: { paddingBottom: 8 },
}));
