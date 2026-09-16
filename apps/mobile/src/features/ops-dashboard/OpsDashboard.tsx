import React from 'react';
import { View, Pressable, Text, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUiStore, OpsView } from '@/state/store';
import { makeStyles, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { CgInfinityLogo } from '@/components/brand/CgInfinityLogo';
import { PageWash } from '@/components/ui/PageWash';
import { ProfileMenu } from '@/components/ui/ProfileMenu';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { MaintenanceQueue } from './MaintenanceQueue';
import { DemandResponseView } from './DemandResponseView';

const OPS_NAV: { key: OpsView; label: string; meta: string }[] = [
  { key: 'maint', label: 'Predictive maintenance', meta: '6 assets over threshold' },
  { key: 'dr', label: 'Demand response', meta: 'Next event Oct 14' },
];

const OPS_PROFILE_DETAILS = [
  { label: 'Region', value: 'Con Edison · Manhattan West' },
  { label: 'Access', value: 'Grid operations' },
] as const;

const FOOTNOTE =
  'Maintenance risk model trained on the UCI AI4I 2020 set, relabelled to grid assets. Proxy data, stated openly.';

export function OpsDashboard() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const opsView = useUiStore((s) => s.opsView);
  const setOpsView = useUiStore((s) => s.setOpsView);

  return (
    <View style={styles.fill}>
      <View style={[styles.root, compact && styles.rootCompact]}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.sidebar, compact && styles.sidebarCompact]}
        >
          <View style={compact ? styles.brandRowCompact : styles.brandBlock}>
            <View style={styles.brandTopRow}>
              <CgInfinityLogo size={compact ? 26 : 28} withWordmark={false} />
              {compact ? (
                <Text style={styles.brandTitle} numberOfLines={1}>OneGridAI Ops</Text>
              ) : (
                <Text style={styles.brandWordmark} numberOfLines={1}>CG Infinity</Text>
              )}
              <View style={styles.brandSpacer} />
              <ProfileMenu onInverse details={OPS_PROFILE_DETAILS} />
            </View>
            {!compact && (
              <View style={styles.brandTitleBlock}>
                <Text style={styles.brandTitle}>OneGridAI Ops</Text>
                <Text style={styles.brandSubtitle}>Con Edison · Manhattan West</Text>
              </View>
            )}
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
                      backgroundColor: active ? colors.inverseFillWeak : 'transparent',
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
        </LinearGradient>

        <View style={styles.contentWrap}>
          <PageWash />
          <ScrollView style={styles.content} contentContainerStyle={[styles.contentInner, compact && styles.contentInnerCompact]}>
          <ScreenTransition key={opsView}>
            {opsView === 'maint' && <MaintenanceQueue compact={compact} />}
            {opsView === 'dr' && <DemandResponseView compact={compact} />}
          </ScreenTransition>
          {compact && (
            <View style={styles.footnoteBlockCompact}>
              <Text style={styles.footnoteText}>{FOOTNOTE}</Text>
            </View>
          )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  brandTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandSpacer: { flex: 1 },
  brandTitleBlock: { marginTop: 14 },
  brandWordmark: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textInverse },
  fill: { flex: 1, width: '100%' },
  root: { flex: 1, flexDirection: 'row', backgroundColor: t.colors.page },
  rootCompact: { flexDirection: 'column' },

  sidebar: { width: 224, paddingVertical: 22 },
  sidebarCompact: { width: '100%', paddingVertical: 0 },

  brandBlock: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  brandRowCompact: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brandTitle: { fontFamily: fontFamily.heading, fontSize: 16, color: t.colors.textInverse },
  brandSubtitle: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textInverseMuted, marginTop: 4 },
  contentWrap: { flex: 1, minWidth: 0 },

  navList: {},
  navListCompact: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },

  navItem: { paddingVertical: 12, paddingHorizontal: 20, borderLeftWidth: 4 },
  navItemCompact: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 3, borderRadius: 4 },
  navLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: t.colors.textInverse },
  navMeta: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textInverseMuted, marginTop: 3 },

  footnoteBlock: { marginTop: 'auto', paddingHorizontal: 20, paddingTop: 18, borderTopWidth: 1, borderTopColor: t.colors.borderInverseSoft },
  footnoteBlockCompact: { backgroundColor: t.colors.primary, borderRadius: 5.4, padding: 14, marginTop: 8 },
  footnoteText: { fontFamily: fontFamily.body, fontSize: 11, lineHeight: 16, color: t.colors.textInverseMuted },

  content: { flex: 1 },
  contentInner: { padding: 26, paddingHorizontal: 30, paddingBottom: 34 },
  contentInnerCompact: { padding: 16, paddingBottom: 24 },
}));
