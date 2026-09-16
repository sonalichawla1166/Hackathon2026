import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, motion, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import type { IconProps } from '@/components/icons/TabIcons';

export interface TabDef<T extends string> {
  key: T;
  label: string;
  Icon: React.ComponentType<IconProps>;
}

const BAR_PAD_SIDE = 8;
const BAR_PAD_V = 8;
const ITEM_HEIGHT = 52;
/** The capsule keeps this width whatever the slot width is. */
const PILL_WIDTH = 76;
/** The floating bar never grows past this on a tablet or desktop. */
const BAR_MAX_WIDTH = 520;

/**
 * Floating bottom tab bar.
 *
 * A rounded, inset bar that sits above the page rather than welding itself to
 * the bottom edge, with a fixed-width amber capsule that glides between slots.
 * Fixed width matters: a capsule stretched across a 1/5 slot on a wide screen
 * reads as a banner, not a selection.
 */
export function BoldTabBar<T extends string>({ tabs, current, onPick }: { tabs: TabDef<T>[]; current: T; onPick: (t: T) => void }) {
  const styles = useStyles();
  const { colors, gradients, shadow } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const [barWidth, setBarWidth] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === current));

  const slotWidth = barWidth > 0 ? (barWidth - BAR_PAD_SIDE * 2) / tabs.length : 0;
  // Centre the fixed-width capsule inside the active slot.
  const pillOffset = BAR_PAD_SIDE + activeIndex * slotWidth + (slotWidth - PILL_WIDTH) / 2;

  useEffect(() => {
    if (slotWidth === 0) return;
    // Jump to the first position instead of sliding in from the left edge;
    // only tab *changes* animate.
    if (!placed.current) {
      placed.current = true;
      pillX.setValue(pillOffset);
      return;
    }
    Animated.spring(pillX, { toValue: pillOffset, useNativeDriver: true, ...motion.spring }).start();
  }, [pillOffset, slotWidth, pillX]);

  return (
    <View style={[styles.dock, screenWidth >= BAR_MAX_WIDTH && styles.dockWide]} pointerEvents="box-none">
      <View style={styles.bar} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        {slotWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[styles.pillWrap, { transform: [{ translateX: pillX }] }, shadow.glow(colors.cta)]}
          >
            <LinearGradient colors={gradients.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill} />
          </Animated.View>
        )}

        {tabs.map(({ key, label, Icon }) => {
          const active = key === current;
          const tint = active ? colors.onCta : colors.textMuted;
          return (
            <Pressable
              key={key}
              onPress={() => onPick(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
              style={styles.item}
            >
              <Icon size={21} color={tint} active={active} />
              <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  dock: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 6,
  },
  dockWide: { alignItems: 'center' },
  bar: {
    width: '100%',
    maxWidth: BAR_MAX_WIDTH,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    borderRadius: 24,
    paddingHorizontal: BAR_PAD_SIDE,
    paddingVertical: BAR_PAD_V,
    ...t.shadow.lifted,
  },
  pillWrap: {
    position: 'absolute',
    top: BAR_PAD_V,
    width: PILL_WIDTH,
    height: ITEM_HEIGHT,
  },
  pill: { flex: 1, borderRadius: 18 },
  item: {
    flex: 1,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 18,
  },
  label: { fontFamily: fontFamily.bodyBold, fontSize: 10, letterSpacing: 0.2 },
}));
