import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { CgInfinityLogo } from '@/components/brand/CgInfinityLogo';
import { ProfileMenu } from '@/components/ui/ProfileMenu';

/** Below this the eyebrow line is dropped and the title shrinks. */
const COMPACT = 560;

export interface HeaderAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  /** Draws a small dot on the button. */
  badge?: boolean;
}

interface SurfaceHeaderProps {
  /** Small caps line above the title, e.g. the utility and product. */
  eyebrow: string;
  title: string;
  /** Extra buttons left of the profile avatar. */
  actions?: readonly HeaderAction[];
  /** Extra rows for the profile menu, e.g. the account number. */
  profileDetails?: ReadonlyArray<{ label: string; value: string }>;
  /**
   * Whether the profile menu carries the appearance switch and sign out. The
   * desktop customer layout turns this off because its sidebar already pins
   * both to the bottom of the navigation column. On by default.
   */
  showAccountControls?: boolean;
}

/**
 * The top bar shared by every surface.
 *
 * One shape everywhere: CG Infinity's mark and the product name on the left
 * (so the brand is actually visible inside the app, not only on sign-in), the
 * screen title under it, and the account menu on the right. The theme switch
 * and sign out live inside that menu rather than crowding the bar.
 */
export function SurfaceHeader({ eyebrow, title, actions = [], profileDetails = [], showAccountControls = true }: SurfaceHeaderProps) {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < COMPACT;

  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bar}>
      <View style={styles.identity}>
        <CgInfinityLogo size={compact ? 28 : 32} withWordmark={false} />
        <View style={styles.titleBlock}>
          {!compact && <Text style={styles.eyebrow} numberOfLines={1}>{eyebrow}</Text>}
          <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            hitSlop={6}
            style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.75 }]}
          >
            {action.icon}
            {action.badge ? <View style={[styles.badgeDot, { backgroundColor: colors.dangerSoft }]} /> : null}
          </Pressable>
        ))}
        <ProfileMenu onInverse details={profileDetails} showAccountControls={showAccountControls} />
      </View>
    </LinearGradient>
  );
}

const useStyles = makeStyles((t) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  titleBlock: { flex: 1, minWidth: 0 },
  eyebrow: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 9,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: t.colors.textInverseMuted,
  },
  title: { fontFamily: fontFamily.heading, fontSize: 19, color: t.colors.textInverse, marginTop: 3 },
  titleCompact: { fontSize: 16, marginTop: 0 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: t.colors.borderInverse,
    backgroundColor: t.colors.inverseFillWeak,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
}));
