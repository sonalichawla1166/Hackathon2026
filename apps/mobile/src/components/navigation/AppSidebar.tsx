import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, motion, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import type { IconProps } from '@/components/icons/TabIcons';
import { LogoutIcon, MoonIcon, SidebarToggleIcon, SunIcon } from '@/components/icons/BrandIcons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useLogout } from '@/api/hooks';

/** The full-height navigation column, expanded and collapsed. */
export const SIDEBAR_WIDTH = 248;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

export interface SidebarItem<T extends string> {
  key: T;
  label: string;
  Icon: React.ComponentType<IconProps>;
  /** Optional second line, e.g. "6 assets over threshold". Expanded only. */
  meta?: string;
}

const ROW_HEIGHT = 46;
/** Rows grow when any of them carries a `meta` line. */
const ROW_HEIGHT_META = 58;
const ROW_GAP = 4;
const PAD = 12;

interface AppSidebarProps<T extends string> {
  items: readonly SidebarItem<T>[];
  current: T;
  onPick: (key: T) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Small print pinned above the account controls, e.g. model provenance. */
  footnote?: string;
}

/**
 * The desktop navigation column shared by the customer app and grid ops.
 *
 * Runs the full height of the window below the header, so navigation is a wall
 * rather than a card floating in empty space. Destinations sit at the top; the
 * account controls that would otherwise be reachable only through the avatar
 * menu — sign out and the appearance switch — are pinned to the bottom, which
 * is where a desktop user looks for them.
 *
 * Collapsing drops the labels and keeps the icons, so the column narrows to a
 * strip without anything moving between the two states. It starts expanded.
 *
 * Theming goes through the existing machinery: the switch is the shared
 * `ThemeToggle`, and the collapsed state falls back to a plain sun/moon button
 * calling the same `toggle` from the theme context, so the stored preference
 * behaves identically either way.
 */
export function AppSidebar<T extends string>({
  items,
  current,
  onPick,
  collapsed,
  onToggleCollapsed,
  footnote,
}: AppSidebarProps<T>) {
  const styles = useStyles();
  const { colors, gradients, mode, shadow, toggle } = useTheme();
  const logout = useLogout();

  const activeIndex = Math.max(0, items.findIndex((i) => i.key === current));
  // Collapsing hides the meta lines, so the rows shrink back to one line.
  const rowHeight = !collapsed && items.some((i) => i.meta) ? ROW_HEIGHT_META : ROW_HEIGHT;

  // Rows are a fixed height, so the capsule's position needs no measuring.
  const capsuleY = useRef(new Animated.Value(activeIndex * (rowHeight + ROW_GAP))).current;
  const width = useRef(new Animated.Value(collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH)).current;
  const placed = useRef(false);

  useEffect(() => {
    const to = activeIndex * (rowHeight + ROW_GAP);
    // Land on the first position rather than sliding in from the top.
    if (!placed.current) {
      placed.current = true;
      capsuleY.setValue(to);
      return;
    }
    Animated.spring(capsuleY, { toValue: to, useNativeDriver: true, ...motion.spring }).start();
  }, [activeIndex, rowHeight, capsuleY]);

  useEffect(() => {
    // Width cannot run on the native driver, but it is one property on one
    // view and the column clips its own overflow while it moves.
    Animated.timing(width, {
      toValue: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
      duration: motion.entrance.duration,
      useNativeDriver: false,
    }).start();
  }, [collapsed, width]);

  const isDark = mode === 'dark';

  return (
    <Animated.View style={[styles.sidebar, { width }]}>
      <View style={[styles.toggleRow, collapsed && styles.toggleRowCollapsed]}>
        <Pressable
          onPress={onToggleCollapsed}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          hitSlop={6}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
        >
          <SidebarToggleIcon size={17} color={colors.textMuted} open={!collapsed} />
        </Pressable>
      </View>

      <View style={styles.nav}>
        <Animated.View
          pointerEvents="none"
          style={[styles.capsule, { height: rowHeight, transform: [{ translateY: capsuleY }] }, shadow.glow(colors.cta)]}
        >
          <LinearGradient colors={gradients.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.capsuleFill} />
        </Animated.View>

        {items.map(({ key, label, Icon, meta }) => {
          const active = key === current;
          const tint = active ? colors.onCta : colors.textMuted;
          return (
            <Pressable
              key={key}
              onPress={() => onPick(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
              style={[styles.row, { height: rowHeight }, collapsed && styles.rowCollapsed]}
            >
              <Icon size={21} color={tint} active={active} />
              {!collapsed && (
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: tint }]} numberOfLines={1}>
                    {label}
                  </Text>
                  {!!meta && (
                    <Text
                      style={[styles.rowMeta, { color: active ? colors.onCta : colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {meta}
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Pushes the account controls to the floor of the column. */}
      <View style={styles.spacer} />

      <View style={styles.footer}>
        {!!footnote && !collapsed && <Text style={styles.footnote}>{footnote}</Text>}

        <View style={styles.divider} />

        <Pressable
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={({ pressed }) => [
            styles.row,
            { height: ROW_HEIGHT },
            collapsed && styles.rowCollapsed,
            pressed && { backgroundColor: withAlpha(colors.danger, 0.12) },
          ]}
        >
          <LogoutIcon size={19} color={colors.danger} />
          {!collapsed && (
            <Text style={[styles.rowLabel, { color: colors.danger }]} numberOfLines={1}>
              Sign out
            </Text>
          )}
        </Pressable>

        {collapsed ? (
          <Pressable
            onPress={toggle}
            accessibilityRole="switch"
            accessibilityState={{ checked: isDark }}
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={({ pressed }) => [styles.row, { height: ROW_HEIGHT }, styles.rowCollapsed, pressed && { opacity: 0.7 }]}
          >
            {isDark ? <MoonIcon size={19} color={colors.textMuted} /> : <SunIcon size={19} color={colors.textMuted} />}
          </Pressable>
        ) : (
          <View style={styles.themeRow}>
            {isDark ? <MoonIcon size={19} color={colors.textMuted} /> : <SunIcon size={19} color={colors.textMuted} />}
            <Text style={[styles.rowLabel, styles.themeLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {isDark ? 'Dark mode' : 'Light mode'}
            </Text>
            <ThemeToggle compact />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  sidebar: {
    height: '100%',
    // The column has to read as a distinct surface against the page in both
    // themes, and no single token does that. Light `surfaceCard` is pure white
    // on a cream page, a flat white slab; light `surfaceMuted` is the cream
    // tint that separates. Dark inverts the problem — `surfaceMuted` is the
    // page colour itself, so the raised `surfaceCard` is the one that works.
    backgroundColor: t.mode === 'dark' ? t.colors.surfaceCard : t.colors.surfaceMuted,
    borderRightWidth: 1,
    borderRightColor: t.colors.borderHairline,
    paddingHorizontal: PAD,
    paddingTop: 10,
    paddingBottom: 14,
    // The labels are clipped rather than reflowed while the column animates.
    overflow: 'hidden',
  },
  toggleRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  toggleRowCollapsed: { justifyContent: 'center' },
  iconButton: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  nav: { gap: ROW_GAP },
  capsule: { position: 'absolute', top: 0, left: 0, right: 0 },
  capsuleFill: { flex: 1, borderRadius: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
    borderRadius: 14,
  },
  rowCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, letterSpacing: 0.2 },
  rowMeta: { fontFamily: fontFamily.body, fontSize: 10.5, marginTop: 2, opacity: 0.85 },

  spacer: { flex: 1, minHeight: 20 },

  footer: { gap: ROW_GAP },
  footnote: { fontFamily: fontFamily.body, fontSize: 10, lineHeight: 15, color: t.colors.textMuted, paddingHorizontal: 13, marginBottom: 6 },
  divider: { height: 1, backgroundColor: t.colors.borderHairline, marginBottom: 8 },
  themeRow: { height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13 },
  themeLabel: { flex: 1, minWidth: 0 },
}));
