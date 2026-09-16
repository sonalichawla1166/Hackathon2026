import React from 'react';
import { StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/theme';

interface RangeSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (v: number) => void;
}

export function RangeSlider({ value, minimumValue, maximumValue, step, onValueChange }: RangeSliderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.track}>
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.cta}
        maximumTrackTintColor={colors.borderMuted}
        thumbTintColor={colors.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // react-native-slider measures to zero width on web unless the box is
  // definite, which drops the track and wraps the thumb onto its own line.
  track: { width: '100%', justifyContent: 'center' },
  slider: { width: '100%', height: 36 },
});
