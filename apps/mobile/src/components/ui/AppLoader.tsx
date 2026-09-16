import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '@/theme';
import { Caption } from '@/components/ui/Text';

const LOADING_ANIMATION = require('../../../assets/lottie/loading.json');

interface AppLoaderProps {
  /** Text under the animation. Pass null for a bare spinner. */
  label?: string | null;
  size?: number;
  /** Fill the available space and centre, instead of sitting inline. */
  fullscreen?: boolean;
}

/**
 * The one loading indicator for the whole app.
 *
 * Everything that waits on the backend goes through here, so the wait always
 * looks the same. `ActivityIndicator` is the fallback if the Lottie runtime
 * fails to mount (it needs a native module on device and a web player on web).
 */
export function AppLoader({ label = 'Loading…', size = 120, fullscreen = false }: AppLoaderProps) {
  const { colors } = useTheme();
  const [failed, setFailed] = React.useState(false);

  return (
    <View style={[styles.wrap, fullscreen && styles.fullscreen]}>
      {failed ? (
        <ActivityIndicator size="large" color={colors.brand} />
      ) : (
        <LottieErrorBoundary onFail={() => setFailed(true)}>
          {/* The web player sizes itself from the animation's own canvas, so
              the box has to be clamped here rather than on the player. */}
          <View style={{ width: size, height: size, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
            <LottieView source={LOADING_ANIMATION} autoPlay loop style={{ width: size, height: size }} />
          </View>
        </LottieErrorBoundary>
      )}
      {label ? <Caption color={colors.textMuted}>{label}</Caption> : null}
    </View>
  );
}

/** Keeps a Lottie runtime failure from taking the whole screen down. */
class LottieErrorBoundary extends React.Component<
  { children: React.ReactNode; onFail: () => void },
  { crashed: boolean }
> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.crashed ? null : this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 24 },
  fullscreen: { flex: 1, paddingVertical: 0 },
});
