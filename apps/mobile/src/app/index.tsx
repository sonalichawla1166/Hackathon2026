import React from 'react';
import { View, Pressable, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUiStore, Surface } from '@/state/store';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { H1, Eyebrow, BodyText } from '@/components/ui/Text';
import { CustomerApp } from '@/features/customer-app/CustomerApp';
import { PublicPortal } from '@/features/public-portal/PublicPortal';
import { OpsDashboard } from '@/features/ops-dashboard/OpsDashboard';
import { AgentCopilot } from '@/features/agent-copilot/AgentCopilot';

const SURFACES: { key: Surface; label: string }[] = [
  { key: 'app', label: 'Customer app' },
  { key: 'portal', label: 'Public portal' },
  { key: 'ops', label: 'Ops dashboard' },
  { key: 'copilot', label: 'Agent copilot' },
];

export default function Home() {
  const surface = useUiStore((s) => s.surface);
  const setSurface = useUiStore((s) => s.setSurface);
  const { width } = useWindowDimensions();
  const compact = width < 720;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        {!compact && (
          <View style={{ flex: 1, minWidth: 220 }}>
            <Eyebrow>CG Infinity · Hackathon 2026 · Concept design</Eyebrow>
            <H1 style={styles.title}>OneGridAI</H1>
            <BodyText style={styles.subtitle}>
              One AI layer. Four surfaces. Same data. Concept for the customer app, public
              portal, operations dashboard and agent copilot.
            </BodyText>
          </View>
        )}
        {compact && <Text style={styles.compactTitle}>OneGridAI</Text>}
        <View style={styles.tabRow}>
          {SURFACES.map((s) => {
            const active = s.key === surface;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSurface(s.key)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                <Text style={[styles.tabLabel, { color: active ? '#fff' : colors.primary }]} numberOfLines={1}>
                  {compact ? s.label.split(' ')[0] : s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.stage, compact && styles.stageCompact]}>
        {surface === 'app' && <CustomerApp />}
        {surface === 'portal' && <PublicPortal />}
        {surface === 'ops' && <OpsDashboard />}
        {surface === 'copilot' && <AgentCopilot />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerCompact: { flexDirection: 'column', alignItems: 'stretch', paddingBottom: 10, gap: 10 },
  title: { marginTop: 6, marginBottom: 6 },
  compactTitle: { fontFamily: fontFamily.heading, fontSize: 20, color: colors.textHeading, alignSelf: 'flex-start' },
  subtitle: { maxWidth: 640 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  tabBtnActive: { backgroundColor: colors.primary },
  tabLabel: { fontFamily: fontFamily.bodyBold, fontSize: 12 },
  stage: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  stageCompact: { paddingHorizontal: 0, paddingBottom: 0 },
});
