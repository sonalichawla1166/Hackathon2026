import { Platform } from 'react-native';

/**
 * Spread onto every `ScrollView` in the app: `<ScrollView {...hiddenScrollbar}>`.
 *
 * The web build paints a permanent scrollbar gutter down the right edge of any
 * overflow container, which the design does not account for — it cuts into
 * card padding and puts a grey stripe beside the page wash. Native scroll
 * indicators are transient overlays that fade on their own and are part of the
 * platform's own feel, so they are deliberately left switched on.
 */
export const hiddenScrollbar = {
  showsVerticalScrollIndicator: Platform.OS !== 'web',
} as const;
