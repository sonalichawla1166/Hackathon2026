import React from 'react';
import { View } from 'react-native';
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
    <View>
      <Slider
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
