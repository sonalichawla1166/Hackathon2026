import React, { useState } from 'react';
import { View, Pressable, Text, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUiStore, OpsView } from '@/state/store';
import { makeStyles, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { CgInfinityLogo } from '@/components/brand/CgInfinityLogo';
import { PageWash } from '@/components/ui/PageWash';
import { ProfileMenu } from '@/components/ui/ProfileMenu';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { SurfaceHeader } from '@/components/navigation/SurfaceHeader';
import { AppSidebar, SidebarItem } from '@/components/navigation/AppSidebar';
import { ImpactTabIcon, MaintenanceTabIcon, DemandTabIcon } from '@/components/icons/TabIcons';
import { MaintenanceQueue } from './MaintenanceQueue';
import { DemandResponseView } from './DemandResponseView';
import { ImpactSummary } from './ImpactSummary';
import { hiddenScrollbar } from '@/components/ui/scroll';

const OPS_NAV: { key: OpsView; label: string; meta: string }[] = [
  { key: 'impact', label: 'Impact & ROI', meta: 'Business summary' },
  { key: 'maint', label: 'Predictive maintenance', meta: '6 assets over threshold' },
  { key: 'dr', label: 'Demand response', meta: 'Next event Oct 14' },
];

/** The same destinations as `OPS_NAV`, dressed for the shared sidebar. */
const OPS_SIDEBAR: readonly SidebarItem<OpsView>[] = [
  { key: 'impact', label: 'Impact & ROI', meta: 'Business summary', Icon: ImpactTabIcon },
  { key: 'maint', label: 'Predictive maintenance', meta: '6 assets over threshold', Icon: MaintenanceTabIcon },
  { key: 'dr', label: 'Demand response', meta: 'Next event Oct 14', Icon: DemandTabIcon },
];

const OPS_PROFILE_DETAILS = [
  { label: 'Region', value: 'PSEG Long Island · Nassau/Suffolk' },
  { label: 'Access', value: 'Grid operations' },
] as const;

const FOOTNOTE =
  'Maintenance risk model trained on the UCI AI4I 2020 set, relabelled to grid assets. Proxy data, stated openly.';

export function OpsDashboard() {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  // Below 900 the dashboard keeps the stacked layout it was built with; the
  // header-plus-sidebar shell is the wide-screen shape.
  return compact ? <OpsCompact /> : <OpsWide />;
}

/**
 * Wide-screen grid ops: the same shell the customer app uses — a header across
 * the top and the shared full-height sidebar down the left.
 */
function OpsWide() {
  const styles = useStyles();
  const opsView = useUiStore((s) => s.opsView);
  const setOpsView = useUiStore((s) => s.setOpsView);
  const [collapsed, setCollapsed] = useState(false);

  const title = OPS_NAV.find((n) => n.key === opsView)?.label ?? 'Grid operations';

  const active = (
    <ScreenTransition key={opsView}>
      {opsView === 'impact' && <ImpactSummary compact={false} />}
      {opsView === 'maint' && <MaintenanceQueue compact={false} />}
      {opsView === 'dr' && <DemandResponseView compact={false} />}
    </ScreenTransition>
  );

  return (
    <View style={styles.fill}>
      <View style={styles.shell}>
        <PageWash />
        <SurfaceHeader
          eyebrow="CG Infinity · OneGridAI Ops"
          title={title}
          profileDetails={OPS_PROFILE_DETAILS}
          showAccountControls={false}
        />

        <View style={styles.wideBody}>
          <AppSidebar
            items={OPS_SIDEBAR}
            current={opsView}
            onPick={setOpsView}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
            footnote={FOOTNOTE}
          />

          <ScrollView style={styles.content} contentContainerStyle={styles.wideContent} {...hiddenScrollbar}>
            {active}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

/** Narrow grid ops, unchanged: the plum bar carries the brand, nav and menu. */
function OpsCompact() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const opsView = useUiStore((s) => s.opsView);
  const setOpsView = useUiStore((s) => s.setOpsView);

  return (
    <View style={styles.fill}>
      <View style={[styles.root, styles.rootCompact]}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.sidebar, styles.sidebarCompact]}
        >
          <View style={styles.brandRowCompact}>
            <View style={styles.brandTopRow}>
              <CgInfinityLogo size={26} withWordmark={false} />
              <Text style={styles.brandTitle} numberOfLines={1}>OneGridAI Ops</Text>
              <View style={styles.brandSpacer} />
              <ProfileMenu onInverse details={OPS_PROFILE_DETAILS} />
            </View>
          </View>

          <View style={[styles.navList, styles.navListCompact]}>
            {OPS_NAV.map((n) => {
              const active = opsView === n.key;
              return (
                <Pressable
                  key={n.key}
                  onPress={() => setOpsView(n.key)}
                  style={[
                    styles.navItemCompact,
                    {
                      borderTopColor: active ? colors.cta : 'transparent',
                      backgroundColor: active ? colors.inverseFillWeak : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.navLabel} numberOfLines={1}>{n.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>

        <View style={styles.contentWrap}>
          <PageWash />
          <ScrollView style={styles.content} contentContainerStyle={[styles.contentInner, styles.contentInnerCompact]} {...hiddenScrollbar}>
            <ScreenTransition key={opsView}>
              {opsView === 'impact' && <ImpactSummary compact />}
              {opsView === 'maint' && <MaintenanceQueue compact />}
              {opsView === 'dr' && <DemandResponseView compact />}
            </ScreenTransition>
            <View style={styles.footnoteBlockCompact}>
              <Text style={styles.footnoteText}>{FOOTNOTE}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  brandTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandSpacer: { flex: 1 },
  fill: { flex: 1, width: '100%' },
  shell: { flex: 1, backgroundColor: t.colors.page },
  root: { flex: 1, flexDirection: 'row', backgroundColor: t.colors.page },
  rootCompact: { flexDirection: 'column' },

  sidebar: { width: 224, paddingVertical: 22 },
  sidebarCompact: { width: '100%', paddingVertical: 0 },

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
  contentWrap: { flex: 1, minWidth: 0 },

  navList: {},
  navListCompact: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  navItemCompact: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 3, borderRadius: 4 },
  navLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: t.colors.textInverse },

  footnoteBlockCompact: { backgroundColor: t.colors.primary, borderRadius: 5.4, padding: 14, marginTop: 8 },
  footnoteText: { fontFamily: fontFamily.body, fontSize: 11, lineHeight: 16, color: t.colors.textInverseMuted },

  content: { flex: 1, backgroundColor: 'transparent' },
  contentInner: { flexGrow: 1, padding: 26, paddingHorizontal: 30, paddingBottom: 34 },
  contentInnerCompact: { padding: 16, paddingBottom: 24 },

  // Wide shell: the sidebar is flush to the window edges, the page beside it
  // carries the gutter.
  wideBody: { flex: 1, flexDirection: 'row', width: '100%' },
  wideContent: { flexGrow: 1, padding: 26, paddingHorizontal: 30, paddingBottom: 34 },
}));
