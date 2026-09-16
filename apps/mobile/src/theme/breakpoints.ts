import { Platform, useWindowDimensions } from 'react-native';

/**
 * Where a surface switches to its desktop layout.
 *
 * Deliberately above an iPad in landscape (1024) so every tablet and phone
 * keeps the single-column layout it was designed for. Web only: a native
 * tablet build can never cross this line, whatever its screen reports.
 */
export const DESKTOP_MIN_WIDTH = 1080;

/**
 * True only on a desktop-width web viewport.
 *
 * Every desktop style in the app hangs off this one hook, so mobile and tablet
 * render the exact same tree they did before it existed.
 */
export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH;
}
