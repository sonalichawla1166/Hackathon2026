import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { radius, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { EyeIcon } from '@/components/icons/BrandIcons';

interface AuthFieldProps extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  /** Renders a Show/Hide eye button and masks the value until it is pressed. */
  secure?: boolean;
  /** Draws the field in the danger colour. */
  invalid?: boolean;
}

/**
 * The pill-shaped input used on the sign-in card: a soft filled capsule that
 * picks up an amber ring while focused.
 */
export function AuthField({ secure = false, invalid = false, onFocus, onBlur, ...rest }: AuthFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = invalid ? colors.danger : focused ? colors.borderFocus : colors.borderMuted;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surfaceField,
          borderColor,
        },
        focused && { shadowColor: colors.brand, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
      ]}
    >
      <TextInput
        {...rest}
        secureTextEntry={secure && !revealed}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.brand}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, { color: colors.textHeading }]}
      />
      {secure && (
        <Pressable
          onPress={() => setRevealed((v) => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          style={({ pressed }) => [styles.eye, { backgroundColor: pressed ? withAlpha(colors.brand, 0.16) : 'transparent' }]}
        >
          <EyeIcon size={17} color={colors.textMuted} off={revealed} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingLeft: 18,
    paddingRight: 8,
    minHeight: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontFamily: fontFamily.body,
    fontSize: 14.5,
    // Web-only: strip the default focus outline, the wrapper draws the ring.
    outlineStyle: 'none',
  } as object,
  eye: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
