export interface LatLng {
  lat: number;
  lng: number;
}

export type MarkerKind =
  /** Teardrop pin, anchored at its point. The default. */
  | 'pin'
  /** Plain circle, anchored at its centre — outage clusters. */
  | 'dot'
  /** The viewer's own position: a steady core inside a slow pulse. */
  | 'me';

export interface MapMarker extends LatLng {
  id: string;
  /** Fill, always passed from the active theme. */
  color: string;
  kind?: MarkerKind;
  /** Diameter for `dot`; ignored by the other kinds. */
  size?: number;
  /** Native tooltip text. */
  label?: string;
  /** Set false for decoration that should not answer taps. Defaults true. */
  selectable?: boolean;
}

/** Baked into the document at build time; changing these remounts the frame. */
export interface MapInit {
  center: LatLng;
  zoom: number;
  /** Shown behind the tiles while they load. */
  surface: string;
  /** Ring and pulse colour. */
  accent: string;
  /** Open on satellite rather than street. */
  satellite: boolean;
  /** False for a decorative map: no dragging, no zoom, no layer switcher. */
  interactive: boolean;
}

export interface MapCanvasProps {
  center: LatLng;
  zoom?: number;
  height: number;
  markers?: readonly MapMarker[];
  selectedId?: string | null;
  onSelectMarker?: (id: string | null) => void;
  /** Draws a translucent circle of this radius around the centre. */
  radiusKm?: number;
  /** Zoom out far enough to hold every marker once they arrive. */
  fitToMarkers?: boolean;
  satellite?: boolean;
  interactive?: boolean;
  /** Accessibility label for the frame. */
  label?: string;
}
