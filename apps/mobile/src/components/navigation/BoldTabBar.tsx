import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, motion, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';

export interface TabDef<T extends string> {
  key: T;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

const ITEM_HEIGHT = 52;
const BAR_PAD_TOP = 10;
const BAR_PAD_SIDE = 8;

const useStyles = makeStyles((t) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: t.colors.surfaceCard,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: BAR_PAD_SIDE,
    paddingTop: BAR_PAD_TOP,
    paddingBottom: 22,
    ...t.shadow.lifted,
  },
  pillWrap: {
    position: 'absolute',
    top: BAR_PAD_TOP,
    height: ITEM_HEIGHT,
  },
  pill: { flex: 1, borderRadius: radius.sm },
  item: {
    flex: 1,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: { fontFamily: fontFamily.bodyBold, fontSize: 10.5, letterSpacing: 0.2 },
}));

// A bold sliding-pill tab bar: the active tab sits inside a gradient
// capsule that glides between slots (instead of a thin top-line indicator),
// with a bigger icon and a brighter label — used by every bottom-tab
// surface (Customer app, Field sales) so the chrome stays identical.
export function BoldTabBar<T extends string>({ tabs, current, onPick }: { tabs: TabDef<T>[]; current: T; onPick: (t: T) => void }) {
  const styles = useStyles();
  const { colors, gradients, shadow } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === current));

  const innerWidth = containerWidth - BAR_PAD_SIDE * 2;
  const tabWidth = innerWidth / tabs.length;

  useEffect(() => {
    if (containerWidth === 0) return;
    Animated.spring(pillX, {
      toValue: BAR_PAD_SIDE + activeIndex * tabWidth,
      useNativeDriver: true,
      ...motion.spring,
    }).start();
  }, [activeIndex, containerWidth, tabWidth, pillX]);

  return (
    <View style={styles.bar} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {containerWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.pillWrap, { width: tabWidth, transform: [{ translateX: pillX }] }, shadow.glow(colors.cta)]}
        >
          <LinearGradient colors={gradients.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill} />
        </Animated.View>
      )}
      {tabs.map(({ key, label, Icon }) => {
        const active = key === current;
        return (
          <Pressable
            key={key}
            onPress={() => onPick(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.item}
          >
            <Icon size={active ? 23 : 20} color={active ? colors.onCta : colors.textMuted} />
            <Text style={[styles.label, { color: active ? colors.onCta : colors.textMuted }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
