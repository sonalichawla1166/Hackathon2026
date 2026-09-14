import React from 'react';
import { View, Pressable, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { BrowserFrame } from '@/components/chrome/DeviceFrame';
import { useUiStore, OpsView } from '@/state/store';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { MaintenanceQueue } from './MaintenanceQueue';
import { DemandResponseView } from './DemandResponseView';

const OPS_NAV: { key: OpsView; label: string; meta: string }[] = [
  { key: 'maint', label: 'Predictive maintenance', meta: '6 assets over threshold' },
  { key: 'dr', label: 'Demand response', meta: 'Next event Oct 14' },
];

const FOOTNOTE =
  'Maintenance risk model trained on the UCI AI4I 2020 set, relabelled to grid assets. Proxy data, stated openly.';

export function OpsDashboard() {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const opsView = useUiStore((s) => s.opsView);
  const setOpsView = useUiStore((s) => s.setOpsView);

  return (
    <BrowserFrame url="ops.onegridai.internal/maintenance">
      <View style={[styles.root, compact && styles.rootCompact]}>
        <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
          <View style={compact ? styles.brandRowCompact : styles.brandBlock}>
            <Text style={styles.brandTitle}>OneGridAI Ops</Text>
            {!compact && <Text style={styles.brandSubtitle}>Con Edison · Manhattan West</Text>}
          </View>

          <View style={[styles.navList, compact && styles.navListCompact]}>
            {OPS_NAV.map((n) => {
              const active = opsView === n.key;
              return (
                <Pressable
                  key={n.key}
                  onPress={() => setOpsView(n.key)}
                  style={[
                    compact ? styles.navItemCompact : styles.navItem,
                    {
                      borderLeftColor: !compact && active ? colors.cta : 'transparent',
                      borderTopColor: compact && active ? colors.cta : 'transparent',
                      backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.navLabel} numberOfLines={1}>{n.label}</Text>
                  {!compact && <Text style={styles.navMeta}>{n.meta}</Text>}
                </Pressable>
              );
            })}
          </View>

          {!compact && (
            <View style={styles.footnoteBlock}>
              <Text style={styles.footnoteText}>{FOOTNOTE}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.content} contentContainerStyle={[styles.contentInner, compact && styles.contentInnerCompact]}>
          {opsView === 'maint' && <MaintenanceQueue compact={compact} />}
          {opsView === 'dr' && <DemandResponseView compact={compact} />}
          {compact && (
            <View style={styles.footnoteBlockCompact}>
              <Text style={styles.footnoteText}>{FOOTNOTE}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </BrowserFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: '#ECEEEF' },
  rootCompact: { flexDirection: 'column' },

  sidebar: { width: 224, backgroundColor: colors.primary, paddingVertical: 22 },
  sidebarCompact: { width: '100%', paddingVertical: 0 },

  brandBlock: { paddingHorizontal: 20, paddingBottom: 20 },
  brandRowCompact: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  brandTitle: { fontFamily: fontFamily.heading, fontSize: 16, color: '#fff' },
  brandSubtitle: { fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(255,255,255,0.73)', marginTop: 4 },

  navList: {},
  navListCompact: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },

  navItem: { paddingVertical: 12, paddingHorizontal: 20, borderLeftWidth: 4 },
  navItemCompact: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 3, borderRadius: 4 },
  navLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: '#fff' },
  navMeta: { fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(255,255,255,0.73)', marginTop: 3 },

  footnoteBlock: { marginTop: 'auto', paddingHorizontal: 20, paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  footnoteBlockCompact: { backgroundColor: colors.primary, borderRadius: 5.4, padding: 14, marginTop: 8 },
  footnoteText: { fontFamily: fontFamily.body, fontSize: 11, lineHeight: 16, color: 'rgba(255,255,255,0.73)' },

  content: { flex: 1, minWidth: 0 },
  contentInner: { padding: 26, paddingHorizontal: 30, paddingBottom: 34 },
  contentInnerCompact: { padding: 16, paddingBottom: 24 },
});
