// A single stroke-drawn icon set for the bottom tab bars and the app chrome.
//
// One geometry, one weight, one 24×24 grid, so the row reads as a set. The
// active tab passes a filled look by bumping `strokeWidth`; nothing here picks
// its own colour — always pass one from the active theme.
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  /** Always pass one from the active theme — `currentColor` is only a fallback. */
  color?: string;
  /** The tab is selected; the icon draws a touch heavier. */
  active?: boolean;
}

function stroke(active?: boolean) {
  return active ? 2.3 : 1.8;
}

const BASE = {
  fill: 'none' as const,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function HomeTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M3.5 10.2 12 3.6l8.5 6.6V19a1.6 1.6 0 0 1-1.6 1.6H5.1A1.6 1.6 0 0 1 3.5 19z" />
      <Path d="M9.4 20.6v-6.2h5.2v6.2" />
    </Svg>
  );
}

export function ChatTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M20.5 15.2a1.9 1.9 0 0 1-1.9 1.9H8.2L4 20.8V5.4a1.9 1.9 0 0 1 1.9-1.9h12.7a1.9 1.9 0 0 1 1.9 1.9z" />
      <Path d="M8.4 8.8h8M8.4 12.2h5" />
    </Svg>
  );
}

export function BillTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M5.6 2.9h12.8v18.2l-2.6-1.7-2.6 1.7-2.6-1.7-2.6 1.7-2.4-1.7z" />
      <Path d="M9 7.6h6M9 11.4h6M9 15.2h3.6" />
    </Svg>
  );
}

/** Gift/offer mark for the "For you" recommendations tab. */
export function ForYouTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="m12 3.2 2.6 5.4 5.9.85-4.25 4.15 1 5.9L12 16.7l-5.25 2.8 1-5.9L3.5 9.45l5.9-.85z" />
    </Svg>
  );
}

/** Warning triangle for "Report a problem". */
export function ReportTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M12 3.6 21.2 19.6H2.8z" />
      <Path d="M12 9.6v4.2" />
      <Circle cx={12} cy={17} r={0.9} fill={color} stroke="none" />
    </Svg>
  );
}

/** Map pin for the field-sales leads tab. */
export function LeadsTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M19 10.2c0 5.1-7 11-7 11s-7-5.9-7-11a7 7 0 1 1 14 0z" />
      <Circle cx={12} cy={10} r={2.6} />
    </Svg>
  );
}

/** Kanban columns for the pipeline board tab. */
export function PipelineTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Rect x={3.2} y={3.4} width={5} height={17.2} rx={1.6} />
      <Rect x={9.5} y={3.4} width={5} height={11.6} rx={1.6} />
      <Rect x={15.8} y={3.4} width={5} height={14.4} rx={1.6} />
    </Svg>
  );
}

/** Bar chart for the stats tab. */
export function StatsTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M4 20.4V13M10 20.4V6.2M16 20.4v-9.6M22 20.4V3.4" />
    </Svg>
  );
}
