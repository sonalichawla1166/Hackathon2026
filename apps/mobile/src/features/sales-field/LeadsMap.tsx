import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import type { SalesLead } from '@/api/types';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { outcomeColor } from './outcomeColors';

const VIEWPORT_HEIGHT = 230;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.5;

// Schematic (not geographically real) map: the rep's position sits at the
// centre and each lead's `mapX`/`mapY` (0-1, from the backend) place it
// relative to that — same illustrative-pin convention as the old static
// dots, but now with tappable pin markers, a zoom/pan canvas, and a
// bottom-docked callout instead of a plain read-only dot field.
export function LeadsMap({ leads, onOpenLead }: { leads: SalesLead[]; onOpenLead: (id: string) => void }) {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = leads.find((l) => l.id === activeId) ?? null;
  const canvasW = width * zoom;
  const canvasH = VIEWPORT_HEIGHT * zoom;

  const canvas = (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.canvas, { width: canvasW || '100%', height: canvasH }]}
    >
      <View style={styles.ring} />
      {leads.map((l) => (
        <Pin key={l.id} lead={l} active={l.id === activeId} onPress={() => setActiveId((cur) => (cur === l.id ? null : l.id))} />
      ))}
      <RepMarker />
    </LinearGradient>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.viewport} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {zoom > 1 && width > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: VIEWPORT_HEIGHT }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: canvasW, height: VIEWPORT_HEIGHT }}>
              {canvas}
            </ScrollView>
          </ScrollView>
        ) : (
          canvas
        )}

        <View style={styles.toolbar}>
          <ToolbarBtn label="+" onPress={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))} disabled={zoom >= MAX_ZOOM} />
          <ToolbarBtn label="–" onPress={() => setZoom((z) => Math.max(1, z - ZOOM_STEP))} disabled={zoom <= 1} />
          {zoom > 1 && <ToolbarBtn label="⟲" onPress={() => setZoom(1)} />}
        </View>
      </View>

      {active && (
        <View style={styles.callout}>
          <View style={{ flex: 1 }}>
            <View style={styles.calloutTop}>
              <Text style={styles.calloutAddress} numberOfLines={1}>
                {active.address}
                {active.unit ? `, ${active.unit}` : ''}
              </Text>
              <Text style={styles.calloutDistance}>{active.distanceLabel}</Text>
            </View>
            <Text style={styles.calloutCustomer} numberOfLines={1}>
              {active.customerName} · {active.accountStatus}
            </Text>
            {active.lastOutcome && (
              <View style={{ marginTop: 6 }}>
                <Badge label={active.knockedToday ? `Today: ${active.lastOutcome}` : `Last: ${active.lastOutcome}`} bg={outcomeColor(active.lastOutcome, colors)} />
              </View>
            )}
          </View>
          <View style={{ gap: 8, alignItems: 'flex-end' }}>
            <Pressable onPress={() => setActiveId(null)} hitSlop={8}>
              <Text style={styles.calloutClose}>✕</Text>
            </Pressable>
            <Pressable onPress={() => onOpenLead(active.id)}>
              <Text style={styles.calloutView}>View lead ›</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function ToolbarBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.toolbarBtn, disabled && { opacity: 0.35 }]}>
      <Text style={styles.toolbarBtnLabel}>{label}</Text>
    </Pressable>
  );
}

function Pin({ lead, active, onPress }: { lead: SalesLead; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const dotColor = lead.knockedToday ? outcomeColor(lead.lastOutcome, colors) : colors.accent;
  const size = active ? 30 : 22;
  const h = size * (32 / 24);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        position: 'absolute',
        left: `${lead.mapX * 100}%`,
        top: `${lead.mapY * 100}%`,
        width: size,
        height: h,
        marginLeft: -size / 2,
        marginTop: -h,
        alignItems: 'center',
      }}
    >
      <Svg width={size} height={h} viewBox="0 0 24 32">
        <Path
          d="M12,0C5.4,0,0,5.4,0,12c0,9,12,20,12,20s12-11,12-20C24,5.4,18.6,0,12,0z"
          fill={dotColor}
          stroke={colors.inverseSolid}
          strokeWidth={active ? 1.5 : 1}
        />
        <Path d="M12,7.5c-2.5,0-4.5,2-4.5,4.5s4.5,8,4.5,8s4.5-5.5,4.5-8S14.5,7.5,12,7.5z" fill={colors.inverseSolid} opacity={0.9} />
      </Svg>
    </Pressable>
  );
}

function RepMarker() {
  const styles = useStyles();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={styles.repWrap} pointerEvents="none">
      <Animated.View style={[styles.repPulse, { transform: [{ scale }], opacity }]} />
      <View style={styles.repDot}>
        <View style={styles.repDotCore} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 8 },
  viewport: {
    height: VIEWPORT_HEIGHT,
    borderRadius: radius.chip,
    backgroundColor: t.colors.primary,
    overflow: 'hidden',
  },
  canvas: {},
  ring: {
    position: 'absolute',
    left: '8%',
    top: '8%',
    right: '8%',
    bottom: '8%',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: t.colors.borderInverse,
    borderStyle: 'dashed',
  },
  toolbar: { position: 'absolute', right: 10, bottom: 10, gap: 6 },
  toolbarBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: t.colors.inverseFillMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarBtnLabel: { fontFamily: fontFamily.bodyBold, fontSize: 15, color: t.colors.textInverse },
  repWrap: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, alignItems: 'center', justifyContent: 'center' },
  repPulse: { position: 'absolute', width: 16, height: 16, marginLeft: -8, marginTop: -8, borderRadius: 8, backgroundColor: t.colors.inverseSolid },
  repDot: {
    width: 16,
    height: 16,
    marginLeft: -8,
    marginTop: -8,
    borderRadius: 8,
    backgroundColor: t.colors.inverseFillStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repDotCore: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: t.colors.inverseSolid },
  callout: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: t.colors.surfaceCard,
    borderRadius: radius.md,
    padding: 13,
    ...t.shadow.lifted,
  },
  calloutTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  calloutAddress: { flex: 1, fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },
  calloutDistance: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.accent },
  calloutCustomer: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, marginTop: 3 },
  calloutClose: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: t.colors.textMuted },
  calloutView: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: t.colors.accent },
}));
