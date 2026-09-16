import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { makeStyles, radius } from '@/theme';
import { useMapBridge } from './useMapBridge';
import type { MapCanvasProps } from './types';

/**
 * Web host for the shared Leaflet document.
 *
 * It goes in an `<iframe srcDoc>` rather than being mounted straight into the
 * page so that both platforms run the identical document — the same layers,
 * the same pin geometry, the same handshake — instead of a DOM build and a
 * WebView build that drift. The frame is created once; markers and selection
 * are pushed into it, so panning and zooming survive a data refresh.
 */
export function MapCanvas(props: MapCanvasProps) {
  const styles = useStyles();
  const { html, patch, ready, handleMessage } = useMapBridge(props);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // A `srcDoc` frame is an opaque origin, so it reports "null" — identify
      // it by its window instead, and ignore everything else on the channel.
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return;
      handleMessage(e.data);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleMessage]);

  useEffect(() => {
    if (!ready) return;
    frameRef.current?.contentWindow?.postMessage(patch, '*');
  }, [ready, patch]);

  return (
    <View style={[styles.frame, { height: props.height }]}>
      <iframe
        ref={frameRef}
        title={props.label ?? 'Map'}
        srcDoc={html}
        style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
        // The document is ours and inline; it needs scripts, and same-origin so
        // the host can reach `contentWindow` to push updates.
        sandbox="allow-scripts allow-same-origin allow-popups"
        referrerPolicy="no-referrer-when-downgrade"
        // Emphatically not `loading="lazy"`: these frames sit low in a rail or
        // below the fold inside a scroll container the browser does not treat
        // as the viewport, so a deferred frame simply never loads.
        loading="eager"
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
}));
