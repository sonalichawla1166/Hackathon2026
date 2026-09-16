import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/theme';
import { buildMapHtml } from './mapHtml';
import type { MapCanvasProps, MapInit } from './types';

/**
 * The half of the map host that is the same on both platforms: building the
 * document once, tracking the Leaflet handshake, and turning inbound JSON into
 * `onSelectMarker` calls.
 *
 * Only the transport differs — an `<iframe>` on web, a `WebView` on native —
 * so that is all the two `MapCanvas` files are left to implement.
 */
/**
 * Where a map falls back to if it is handed no usable centre — the service
 * area every demo dataset sits in. A map that silently fails to build is far
 * worse than one pointing at the right city with no pins.
 */
const FALLBACK_CENTER = { lat: 40.7614, lng: -73.9903 };

function usableCenter(c: MapCanvasProps['center']) {
  return c && Number.isFinite(c.lat) && Number.isFinite(c.lng) ? c : FALLBACK_CENTER;
}

export function useMapBridge({
  center,
  zoom = 14,
  markers,
  selectedId,
  onSelectMarker,
  radiusKm,
  fitToMarkers,
  satellite = false,
  interactive = true,
}: MapCanvasProps) {
  const { colors, mode } = useTheme();
  const [ready, setReady] = useState(false);

  // The initial document. Everything that can change afterwards travels over
  // `__mapApply`, so this must not depend on markers or selection.
  const html = useMemo(() => {
    const init: MapInit = {
      center: usableCenter(center),
      zoom,
      surface: colors.surfaceMapCanvas,
      accent: colors.cta,
      satellite,
      interactive,
    };
    return buildMapHtml(init);
    // `center` is the *initial* view; later changes are pushed, not remounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors.surfaceMapCanvas, colors.cta, satellite, interactive, mode]);

  // Switching theme rebuilds the document, which remounts the frame. The new
  // one has to re-announce itself before anything is pushed into it.
  useEffect(() => {
    setReady(false);
    patchRef.current = '';
  }, [html]);

  // Callers build their marker arrays inline, so the array identity changes on
  // every render even when nothing in it did. Comparing the serialised form
  // keeps `patch` referentially stable, so the push effect below fires on real
  // changes rather than on every render.
  const patchRef = useRef('');
  const nextPatch = JSON.stringify({
    markers: markers ?? [],
    selectedId: selectedId ?? null,
    radiusKm: radiusKm ?? 0,
    fit: !!fitToMarkers,
  });
  if (nextPatch !== patchRef.current) patchRef.current = nextPatch;
  const patch = patchRef.current;

  const onSelectRef = useRef(onSelectMarker);
  onSelectRef.current = onSelectMarker;

  /** Handles one raw JSON string from the document. */
  const handleMessage = useCallback((raw: unknown) => {
    if (typeof raw !== 'string') return;
    let msg: { type?: string; id?: string | null };
    try {
      msg = JSON.parse(raw);
    } catch {
      return; // Not ours — other libraries post on the same channel.
    }
    if (msg?.type === 'ready') setReady(true);
    else if (msg?.type === 'select') onSelectRef.current?.(msg.id ?? null);
  }, []);

  return { html, patch, ready, handleMessage };
}
