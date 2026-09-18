import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useUiStore } from '@/state/store';

// Matches the backend's SALES_REP_BASE fallback (Uniondale/Hicksville, NY —
// apps/backend/app/real/sales_engine.py) so leads/distances stay consistent
// while on the territory base, and so there's always a sensible default
// even off-device (web preview) or when permission is denied.
const FALLBACK = { lat: 40.7684, lng: -73.5251 };

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

// Location is opt-in (via `locationMode` in the store) rather than
// requested automatically: the real lead book is anchored around the
// Nassau/Suffolk customer footprint, so a rep whose device is anywhere else
// would silently see zero leads with a real-GPS default. Defaulting to the
// assigned territory base always shows something; "use my current
// location" is one explicit tap away.
export function useSalesLocation() {
  const mode = useUiStore((s) => s.locationMode);
  const setMode = useUiStore((s) => s.setLocationMode);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');

  useEffect(() => {
    if (mode !== 'device') return;
    let cancelled = false;
    setStatus('requesting');

    (async () => {
      try {
        const { status: permission } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (permission !== 'granted') {
          setStatus('denied');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const usingDeviceLocation = mode === 'device' && status === 'granted';

  return {
    coords: usingDeviceLocation && coords ? coords : FALLBACK,
    usingDeviceLocation,
    status: mode === 'device' ? status : 'idle',
    mode,
    useDeviceLocation: () => setMode('device'),
    useTerritoryBase: () => setMode('territory'),
  };
}
