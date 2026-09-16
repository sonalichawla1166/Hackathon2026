// Paths lifted verbatim from the bottom tab bar in
// `project/OneGridAI Platform.dc.html` so the mobile tab icons match exactly.
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  /** Always pass one from the active theme — the `currentColor` default is
   *  only a fallback and inherits whatever the platform decides. */
  color?: string;
}

export function HomeTabIcon({ size = 21, color = 'currentColor' }: IconProps) {
  const w = (size * 51.9) / 84;
  return (
    <Svg width={w} height={size} viewBox="0 0 51.9 84" fill={color}>
      <Path d="M25.9,68c-2.1,0-3.7,1.7-3.7,3.7c0,2.1,1.7,3.7,3.7,3.7s3.7-1.7,3.7-3.7C29.7,69.7,28,68,25.9,68z" />
      <Path d="M43.9,1H8C4.1,1,1,4.1,1,8v68c0,3.9,3.1,7,7,7h35.9c3.9,0,7-3.1,7-7V8C50.9,4.1,47.7,1,43.9,1z M3,16.4h45.9v44.2H3V16.4z M8,3h35.9c2.8,0,5,2.2,5,5v6.4H3V8C3,5.2,5.2,3,8,3z M43.9,81H8c-2.8,0-5-2.2-5-5V62.6h45.9V76C48.9,78.8,46.6,81,43.9,81z" />
    </Svg>
  );
}

export function ChatTabIcon({ size = 17, color = 'currentColor' }: IconProps) {
  const w = (size * 24) / 22;
  return (
    <Svg width={w} height={size} viewBox="0 0 24 22" fill={color}>
      <Path d="M0.4,0.7V22l6-7.3c0.2-0.2,0.5-0.4,0.8-0.4h16.2V0.7H0.4z" />
    </Svg>
  );
}

export function BillTabIcon({ size = 20, color = 'currentColor' }: IconProps) {
  const w = (size * 60.3) / 69;
  return (
    <Svg width={w} height={size} viewBox="0 0 60.3 69" fill={color}>
      <Path d="M59.3,28.3C59.2,28.2,59.1,28,59,28L32.4,1.3c-0.1-0.1-0.2-0.2-0.3-0.2C31.9,1,31.8,1,31.7,1H2C1.4,1,1,1.4,1,2v65c0,0.6,0.4,1,1,1h56.3c0.6,0,1-0.4,1-1V28.7C59.3,28.5,59.3,28.4,59.3,28.3z M32.7,4.4L56,27.6H32.7V4.4z M3,66V3h27.7v25.7c0,0.6,0.4,1,1,1h25.7V66H3z" />
    </Svg>
  );
}

export function ForYouTabIcon({ size = 21, color = 'currentColor' }: IconProps) {
  const w = (size * 60.6) / 83.9;
  return (
    <Svg width={w} height={size} viewBox="0 0 60.6 83.9" fill={color}>
      <Path d="M59.7,30.3C59.7,14.1,46.5,1,30.3,1S1,14.1,1,30.3C1,40.8,6.4,50,14.7,55.2V82c0,0.4,0.2,0.7,0.5,0.9c0.3,0.2,0.7,0.1,1-0.1l14-10.4l14,10.4c0.2,0.1,0.4,0.2,0.6,0.2c0.2,0,0.3,0,0.5-0.1c0.3-0.2,0.5-0.5,0.5-0.9V55.2C54.2,50,59.7,40.8,59.7,30.3z M43.9,80l-13-9.6c-0.4-0.3-0.8-0.3-1.2,0l-13,9.6V56.3c4.1,2.1,8.7,3.4,13.6,3.4s9.5-1.2,13.6-3.4V80z M45,53.4L45,53.4c-0.5,0-0.8,0.2-1,0.6c-4,2.3-8.7,3.7-13.7,3.7s-9.7-1.3-13.7-3.7c-0.1-0.4-0.5-0.6-0.9-0.6c0,0,0,0-0.1,0C8,48.5,3,40,3,30.3C3,15.2,15.2,3,30.3,3s27.4,12.3,27.4,27.4C57.7,40,52.6,48.5,45,53.4z" />
    </Svg>
  );
}

// Not lifted from the design file (the Sales surface wasn't part of the
// original handoff) — drawn to match the others' single-path, filled style.
export function LeadsTabIcon({ size = 21, color = 'currentColor' }: IconProps) {
  const w = (size * 60) / 84;
  return (
    <Svg width={w} height={size} viewBox="0 0 60 84" fill={color}>
      <Path d="M30,1C14.5,1,2,13.5,2,29c0,20.7,26,52.6,27.1,53.9c0.2,0.3,0.6,0.4,0.9,0.4s0.7-0.1,0.9-0.4C31.9,81.6,58,49.7,58,29C58,13.5,45.5,1,30,1z M30,80.6C25.1,74.3,4,45.6,4,29C4,14.6,15.6,3,30,3s26,11.6,26,26C56,45.6,34.9,74.3,30,80.6z" />
      <Path d="M30,16c-7.2,0-13,5.8-13,13s5.8,13,13,13s13-5.8,13-13S37.2,16,30,16z M30,40c-6.1,0-11-4.9-11-11s4.9-11,11-11s11,4.9,11,11S36.1,40,30,40z" />
    </Svg>
  );
}

// Three uneven kanban columns — represents the pipeline board's stage
// layout, matching the others' single-path, filled style.
export function PipelineTabIcon({ size = 21, color = 'currentColor' }: IconProps) {
  const w = (size * 84) / 84;
  return (
    <Svg width={w} height={size} viewBox="0 0 84 84" fill={color}>
      <Path d="M22,84H6c-3.3,0-6-2.7-6-6V6c0-3.3,2.7-6,6-6h16c3.3,0,6,2.7,6,6v72C28,81.3,25.3,84,22,84z M6,3C4.3,3,3,4.3,3,6v72c0,1.7,1.3,3,3,3h16c1.7,0,3-1.3,3-3V6c0-1.7-1.3-3-3-3H6z" />
      <Path d="M50,60H34c-3.3,0-6-2.7-6-6V6c0-3.3,2.7-6,6-6h16c3.3,0,6,2.7,6,6v48C56,57.3,53.3,60,50,60z M34,3c-1.7,0-3,1.3-3,3v48c0,1.7,1.3,3,3,3h16c1.7,0,3-1.3,3-3V6c0-1.7-1.3-3-3-3H34z" />
      <Path d="M78,72H62c-3.3,0-6-2.7-6-6V6c0-3.3,2.7-6,6-6h16c3.3,0,6,2.7,6,6v60C84,69.3,81.3,72,78,72z M62,3c-1.7,0-3,1.3-3,3v60c0,1.7,1.3,3,3,3h16c1.7,0,3-1.3,3-3V6c0-1.7-1.3-3-3-3H62z" />
    </Svg>
  );
}

export function StatsTabIcon({ size = 21, color = 'currentColor' }: IconProps) {
  const w = (size * 84) / 84;
  return (
    <Svg width={w} height={size} viewBox="0 0 84 84" fill={color}>
      <Path d="M14,83h-2c-2.8,0-5-2.2-5-5V52c0-2.8,2.2-5,5-5h2c2.8,0,5,2.2,5,5v26C19,80.8,16.8,83,14,83z M12,49c-1.7,0-3,1.3-3,3v26c0,1.7,1.3,3,3,3h2c1.7,0,3-1.3,3-3V52c0-1.7-1.3-3-3-3H12z" />
      <Path d="M43,83h-2c-2.8,0-5-2.2-5-5V27c0-2.8,2.2-5,5-5h2c2.8,0,5,2.2,5,5v51C48,80.8,45.8,83,43,83z M41,24c-1.7,0-3,1.3-3,3v51c0,1.7,1.3,3,3,3h2c1.7,0,3-1.3,3-3V27c0-1.7-1.3-3-3-3H41z" />
      <Path d="M72,83h-2c-2.8,0-5-2.2-5-5V6c0-2.8,2.2-5,5-5h2c2.8,0,5,2.2,5,5v72C77,80.8,74.8,83,72,83z M70,3c-1.7,0-3,1.3-3,3v72c0,1.7,1.3,3,3,3h2c1.7,0,3-1.3,3-3V6c0-1.7-1.3-3-3-3H70z" />
    </Svg>
  );
}

export function ReportTabIcon({ size = 21, color = 'currentColor' }: IconProps) {
  const w = (size * 79.4) / 83.9;
  return (
    <Svg width={w} height={size} viewBox="0 0 79.4 83.9" fill={color}>
      <Path d="M62.2,58.7V36.2c0-0.3,0-0.6,0-1c-0.1-6-2.6-11.6-6.9-15.8c-2.3-2.2-5-3.8-7.9-4.9c0.3-0.2,0.4-0.5,0.4-0.8v-1.6c-0.2-4.5-4-8-8.5-7.9c-4.2,0.2-7.7,3.6-7.8,7.9v1.5c0,0.3,0.2,0.6,0.4,0.8c-3.2,1.2-6.1,3-8.6,5.6c-4.2,4.4-6.4,10.1-6.3,16.1v22.6l-6,9.5c-0.1,0.2-0.2,0.4-0.2,0.5v2.8c0,0.6,0.4,1,1,1h20c-0.2,0.2-0.3,0.4-0.3,0.7v1.6c0.1,2.2,1,4.2,2.6,5.7c1.5,1.4,3.5,2.2,5.5,2.2c0.1,0,0.2,0,0.3,0c4.2-0.2,7.7-3.6,7.9-7.9v-1.5c0-0.3-0.1-0.5-0.3-0.7h20c0.6,0,1-0.4,1-1v-2.9c0-0.2-0.1-0.4-0.2-0.5L62.2,58.7z M33.5,12.2c0.1-3.2,2.7-5.8,5.9-5.9c3.4-0.1,6.3,2.5,6.4,5.9v1.5c0,0.1,0,0.2,0.1,0.3c-2.2-0.6-4.4-0.9-6.7-0.9c-2,0-3.9,0.4-5.7,0.9c0-0.1,0.1-0.2,0.1-0.3L33.5,12.2z M45.9,74.8c-0.1,3.2-2.7,5.8-5.9,5.9c-1.6,0.1-3.2-0.5-4.4-1.6s-1.9-2.6-2-4.2v-1.5c0-0.3-0.1-0.5-0.3-0.7h12.8c-0.2,0.2-0.3,0.4-0.3,0.7L45.9,74.8z M66.6,70.6H12.8v-1.5l6.2-9.5c0.1-0.2,0.2-0.4,0.2-0.5v-23C19,24.8,28,15.4,39.3,15.1C44.8,15,50,17,53.9,20.8c4,3.8,6.2,8.9,6.3,14.4c0,0.3,0,0.6,0,0.9V59c0,0.2,0.1,0.4,0.2,0.5l6.2,9.5V70.6z" />
      <Path d="M23,2.9c0.5-0.2,0.7-0.8,0.5-1.3s-0.8-0.7-1.3-0.5C1.2,11.3,1,30.2,1,30.4c0,0.6,0.4,1,1,1s1-0.4,1-1C3,30.3,3.2,12.5,23,2.9z" />
      <Path d="M75.8,19.6c-2.4-5.5-7.6-13.2-18.5-18.5c-0.5-0.2-1.1,0-1.3,0.5s0,1.1,0.5,1.3c19.7,9.6,20,27.4,20,27.5c0,0.6,0.4,1,1,1l0,0c0.6,0,1-0.4,1-1C78.5,30.2,78.4,25.6,75.8,19.6z" />
    </Svg>
  );
}
