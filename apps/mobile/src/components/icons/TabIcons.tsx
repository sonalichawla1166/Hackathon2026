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

/** Microphone for the chat composer's voice-input button — not a tab icon,
 * but drawn to match this set's stroke/grid/weight so it doesn't stand out. */
export function MicIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Rect x={9} y={2.5} width={6} height={11} rx={3} />
      <Path d="M6 11a6 6 0 0 0 12 0" />
      <Path d="M12 17v4M9 21h6" />
    </Svg>
  );
}

// ── Grid operations ──────────────────────────────────────────────────────────

/** Rising bars with a trend line — the business impact and ROI summary. */
export function ImpactTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M3.6 20.4h16.8" />
      <Path d="M7 20.4v-5.6M12 20.4V9.2M17 20.4V12.6" />
      <Path d="m4.6 9.6 4.2-3.9 3.6 2.6 6.8-4.9" />
    </Svg>
  );
}

/** Spanner over an asset — the predictive maintenance queue. */
export function MaintenanceTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M15.3 3.4a5 5 0 0 0-5.9 6.4L3.6 15.6a1.9 1.9 0 0 0 2.7 2.7l5.8-5.8a5 5 0 0 0 6.4-5.9l-2.8 2.8-2.8-.7-.7-2.8z" />
      <Path d="M5.1 17.1h.01" />
    </Svg>
  );
}

/** Bolt inside a dial — a demand response event on the grid. */
export function DemandTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Circle cx={12} cy={12} r={8.6} />
      <Path d="M12.9 7.3 9.4 12.6h3.1l-.9 4.1 3.5-5.3h-3.1z" />
    </Svg>
  );
}

// ── Public portal ────────────────────────────────────────────────────────────

/** Price tag — the rate plan comparison. */
export function RatesTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M3.6 12.6V4.4a.8.8 0 0 1 .8-.8h8.2l7.4 7.4a1.6 1.6 0 0 1 0 2.3l-6.1 6.1a1.6 1.6 0 0 1-2.3 0z" />
      <Circle cx={8.1} cy={8.1} r={1.5} />
    </Svg>
  );
}

/** Sun over a panel — the solar and net metering section. */
export function SolarTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Circle cx={12} cy={8.4} r={3.4} />
      <Path d="M12 1.8v1.6M12 13.4V15M18.6 8.4H17M7 8.4H5.4M16.7 3.7l-1.1 1.1M8.4 12l-1.1 1.1M16.7 13.1l-1.1-1.1M8.4 4.8 7.3 3.7" />
      <Path d="M5.2 20.6h13.6M7.4 17.4h9.2" />
    </Svg>
  );
}

/** Struck-through bolt — an interruption to supply. */
export function OutageTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M13.4 2.6 6.2 13.2h4.9l-1.5 8.2 7.2-10.6h-4.9z" />
      <Path d="M3.4 3.4 20.6 20.6" />
    </Svg>
  );
}

/** Headset — the support desk. */
export function SupportTabIcon({ size = 22, color = 'currentColor', active }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={stroke(active)} {...BASE}>
      <Path d="M4.2 15.4v-3.2a7.8 7.8 0 0 1 15.6 0v3.2" />
      <Path d="M19.8 16.2a2.2 2.2 0 0 1-2.2 2.2h-1.2v-4.6h1.2a2.2 2.2 0 0 1 2.2 2.2zM4.2 16.2a2.2 2.2 0 0 0 2.2 2.2h1.2v-4.6H6.4a2.2 2.2 0 0 0-2.2 2.2z" />
      <Path d="M19.8 18.4v.6a2.4 2.4 0 0 1-2.4 2.4H12" />
    </Svg>
  );
}
