import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { makeStyles, radius } from '@/theme';
import { useMapBridge } from './useMapBridge';
import type { MapCanvasProps } from './types';

/**
 * Native host for the shared Leaflet document (`MapCanvas.web.tsx` is the web
 * one; Metro picks by platform).
 *
 * The document is handed over as inline HTML rather than a bundled asset, and
 * updates are injected as a direct `__mapApply` call — the same entry point the
 * web host reaches with `postMessage`.
 */
export function MapCanvas(props: MapCanvasProps) {
  const styles = useStyles();
  const { html, patch, ready, handleMessage } = useMapBridge(props);
  const viewRef = useRef<WebView | null>(null);

  useEffect(() => {
    if (!ready) return;
    // The patch is already JSON; quote it again so it arrives as a string
    // literal the document can parse, and end with `true` so iOS does not
    // complain about a non-serialisable return value.
    viewRef.current?.injectJavaScript(`window.__mapApply(${JSON.stringify(patch)}); true;`);
  }, [ready, patch]);

  return (
    <View style={[styles.frame, { height: props.height }]}>
      <WebView
        ref={viewRef}
        source={{ html }}
        originWhitelist={['*']}
        onMessage={(e) => handleMessage(e.nativeEvent.data)}
        style={styles.web}
        // Leaflet is a scrolling surface of its own; the WebView must not add
        // its own bounce on top of the map's panning.
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled
        domStorageEnabled
        // Tiles come off the network; without this Android blocks the mix.
        mixedContentMode="always"
        androidLayerType="hardware"
        setSupportMultipleWindows={false}
        accessibilityLabel={props.label ?? 'Map'}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  frame: {
    width: '100%',
    borderRadius: radius.chip,
    overflow: 'hidden',
    backgroundColor: t.colors.surfaceMapCanvas,
  },
  web: { flex: 1, backgroundColor: 'transparent' },
}));
