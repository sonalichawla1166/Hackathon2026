import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius, useTheme, withAlpha } from '@/theme';
import { Surface } from '@/state/store';
import { Caption, H4 } from '@/components/ui/Text';

export interface RoleOption {
  key: Surface;
  label: string;
  blurb: string;
}

interface RoleSelectorProps {
  options: readonly RoleOption[];
  value: Surface | null;
  onChange: (role: Surface) => void;
  /** One column instead of two — used on narrow phones. */
  stacked?: boolean;
}

/**
 * Picks which of the five OneGridAI surfaces the session lands in. The
 * selected tile fills with brand amber rather than a gradient so it reads as
 * the single committed choice on the card.
 */
export function RoleSelector({ options, value, onChange, stacked = false }: RoleSelectorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {options.map((option) => {
        const active = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${option.label}. ${option.blurb}`}
            style={({ pressed }) => [
              styles.tile,
              { flexBasis: stacked ? '100%' : '47%' },
              {
                backgroundColor: active ? withAlpha(colors.brand, 0.14) : colors.surfaceMutedAlt,
                borderColor: active ? colors.brand : colors.borderMuted,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <H4 color={colors.textHeading}>{option.label}</H4>
            <Caption color={active ? colors.textBody : colors.textMuted} style={styles.blurb}>
              {option.blurb}
            </Caption>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  blurb: { marginTop: 4 },
});
