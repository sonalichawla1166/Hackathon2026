import type { OutageMap, OutagePin } from './types';

/**
 * The service address the outage demo is arranged around, and the box the
 * schematic pins were laid out in. These mirror the backend's own constants;
 * they exist here only as a fallback.
 */
const FALLBACK_CENTER = { lat: 40.7614, lng: -73.9903 };
const SPAN_LNG = 0.016;
const SPAN_LAT = 0.012;

/**
 * Guarantee every outage pin has usable coordinates.
 *
 * Pins have always carried layout coordinates (`x`/`y`, 0-1); real `lat`/`lng`
 * and a map `center` were added later. A backend that has not been restarted
 * still answers with the older shape, and the difference is not cosmetic —
 * reading `center.lat` off nothing throws, and a marker at `undefined` silently
 * fails to plot. Rather than make every screen defend itself, the projection
 * happens once, here, on the way out of the query.
 *
 * `y` grows downwards on the schematic and latitude grows upwards, hence the
 * subtraction — the same arithmetic the backend does.
 */
export function withOutageCoords(data: OutageMap): OutageMap {
  const center =
    data.center && Number.isFinite(data.center.lat) && Number.isFinite(data.center.lng)
      ? data.center
      : FALLBACK_CENTER;

  const pins: OutagePin[] = data.pins.map((p) =>
    Number.isFinite(p.lat) && Number.isFinite(p.lng)
      ? p
      : {
          ...p,
          lat: center.lat - (p.y - 0.5) * SPAN_LAT,
          lng: center.lng + (p.x - 0.5) * SPAN_LNG,
        }
  );

  // An older backend has no events at all; the pins are what it can offer.
  return { ...data, center, pins, events: data.events ?? [] };
}
