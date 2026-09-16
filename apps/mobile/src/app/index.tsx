import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUiStore } from '@/state/store';
import { useTheme } from '@/theme';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { CustomerApp } from '@/features/customer-app/CustomerApp';
import { PublicPortal } from '@/features/public-portal/PublicPortal';
import { OpsDashboard } from '@/features/ops-dashboard/OpsDashboard';
import { AgentCopilot } from '@/features/agent-copilot/AgentCopilot';
import { SalesFieldApp } from '@/features/sales-field/SalesFieldApp';

export default function Home() {
  const session = useUiStore((s) => s.session);
  const { colors } = useTheme();

  if (session === null) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1 }}>
        {session === 'app' && <CustomerApp />}
        {session === 'portal' && <PublicPortal />}
        {session === 'ops' && <OpsDashboard />}
        {session === 'copilot' && <AgentCopilot />}
        {session === 'sales' && <SalesFieldApp />}
      </View>
    </SafeAreaView>
  );
}
