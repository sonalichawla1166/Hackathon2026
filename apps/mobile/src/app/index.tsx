import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUiStore } from '@/state/store';
import { colors } from '@/theme';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { CustomerApp } from '@/features/customer-app/CustomerApp';
import { PublicPortal } from '@/features/public-portal/PublicPortal';
import { OpsDashboard } from '@/features/ops-dashboard/OpsDashboard';
import { AgentCopilot } from '@/features/agent-copilot/AgentCopilot';

export default function Home() {
  const session = useUiStore((s) => s.session);

  if (session === null) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.stage}>
        {session === 'app' && <CustomerApp />}
        {session === 'portal' && <PublicPortal />}
        {session === 'ops' && <OpsDashboard />}
        {session === 'copilot' && <AgentCopilot />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
  stage: { flex: 1 },
});
