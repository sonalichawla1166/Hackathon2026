import type { MapInit } from './types';

/**
 * Leaflet, from a CDN, as one self-contained document.
 *
 * Both platforms load this exact string — the web build in an `<iframe>`, the
 * native build in a `WebView` — so there is a single implementation of the map
 * rather than one per platform that drift apart.
 *
 * It talks to its host with JSON in both directions:
 *
 *   out  `{ type: 'ready' }`                 Leaflet is up, send markers
 *        `{ type: 'select', id }`            a pin was tapped (`null` = cleared)
 *        `{ type: 'layer', id }`             street/satellite was switched
 *   in   `window.__mapApply({ ... })`        markers, selection, view, radius
 *
 * The markers are deliberately *not* baked into the document: re-generating
 * the HTML would remount the frame, throwing away the user's pan and zoom and
 * refetching every tile. They arrive over `__mapApply` after `ready`.
 */
export function buildMapHtml(init: MapInit): string {
  const cfg = JSON.stringify(init);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: ${init.surface}; }
  .leaflet-container { background: ${init.surface}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  /* The host card already rounds its own corners; keep controls clear of them. */
  .leaflet-control-container .leaflet-top { margin-top: 4px; }
  .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.78); }
  .og-pin { display: block; }
  .og-pin svg { display: block; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.45)); }
  .og-dot {
    border-radius: 50%;
    box-sizing: border-box;
    box-shadow: 0 2px 5px rgba(0,0,0,0.4);
  }
  /* The rep's own position: a steady core inside a slow pulse. */
  .og-me { position: relative; }
  .og-me .core {
    position: absolute; inset: 0; margin: auto;
    width: 14px; height: 14px; border-radius: 50%;
    background: #fff; border: 3px solid ${init.accent}; box-sizing: border-box;
  }
  .og-me .pulse {
    position: absolute; inset: 0; border-radius: 50%;
    background: ${init.accent}; opacity: 0.35; animation: ogpulse 2.2s ease-out infinite;
  }
  .og-offline {
    display: flex; align-items: center; justify-content: center;
    height: 100%; padding: 16px; box-sizing: border-box;
    text-align: center; line-height: 1.5;
    font-size: 12px; color: rgba(255,255,255,0.72);
  }
  @keyframes ogpulse {
    0%   { transform: scale(0.4); opacity: 0.45; }
    70%  { transform: scale(1);   opacity: 0;    }
    100% { transform: scale(1);   opacity: 0;    }
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
(function () {
  var CFG = ${cfg};

  function post(msg) {
    var s = JSON.stringify(msg);
    // react-native-webview on native; the embedding page on web.
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  }

  // Leaflet comes off a CDN, so a blocked or offline network leaves an empty
  // box with no explanation. Say what happened instead, and still hand the
  // host a no-op __mapApply so its pushes do not throw.
  if (typeof L === 'undefined') {
    document.getElementById('map').innerHTML =
      '<div class="og-offline">Map tiles could not be loaded.<br/>Check the network connection.</div>';
    window.__mapApply = function () {};
    post({ type: 'ready' });
    return;
  }

  var map = L.map('map', {
    center: [CFG.center.lat, CFG.center.lng],
    zoom: CFG.zoom,
    zoomControl: CFG.interactive !== false,
    dragging: CFG.interactive !== false,
    scrollWheelZoom: CFG.interactive !== false,
    doubleClickZoom: CFG.interactive !== false,
    touchZoom: CFG.interactive !== false,
    boxZoom: CFG.interactive !== false,
    keyboard: CFG.interactive !== false,
    attributionControl: true
  });

  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // OpenStreetMap publishes no aerial tiles; Esri's World Imagery is the
  // standard free pairing, and its attribution is required.
  var satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, attribution: 'Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics' }
  );

  (CFG.satellite ? satellite : street).addTo(map);
  if (CFG.interactive !== false) {
    L.control.layers({ 'Street': street, 'Satellite': satellite }, null, { position: 'topright' }).addTo(map);
  }
  map.on('baselayerchange', function (e) { post({ type: 'layer', id: e.name.toLowerCase() }); });

  var markerLayer = L.layerGroup().addTo(map);
  var ring = null;
  var byId = {};
  var selectedId = null;
  // The radius is drawn around the subject of the map, so panning away must
  // not drag the ring along with the viewport.
  var anchor = { lat: CFG.center.lat, lng: CFG.center.lng };
  var radiusKm = 0;

  function teardrop(color, size) {
    var h = Math.round(size * 32 / 24);
    return '<div class="og-pin"><svg width="' + size + '" height="' + h + '" viewBox="0 0 24 32">' +
      '<path d="M12,0C5.4,0,0,5.4,0,12c0,9,12,20,12,20s12-11,12-20C24,5.4,18.6,0,12,0z" fill="' + color + '" stroke="#ffffff" stroke-width="1.6"/>' +
      '<circle cx="12" cy="12" r="4.4" fill="#ffffff"/></svg></div>';
  }

  function iconFor(m, isSelected) {
    if (m.kind === 'me') {
      var d = 34;
      return L.divIcon({
        className: '',
        html: '<div class="og-me" style="width:' + d + 'px;height:' + d + 'px"><div class="pulse"></div><div class="core"></div></div>',
        iconSize: [d, d],
        iconAnchor: [d / 2, d / 2]
      });
    }
    if (m.kind === 'dot') {
      var s = (m.size || 16) * (isSelected ? 1.25 : 1);
      return L.divIcon({
        className: '',
        html: '<div class="og-dot" style="width:' + s + 'px;height:' + s + 'px;background:' + m.color +
              ';border:2px solid ' + (isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)') + '"></div>',
        iconSize: [s, s],
        iconAnchor: [s / 2, s / 2]
      });
    }
    var size = isSelected ? 32 : 24;
    var height = Math.round(size * 32 / 24);
    return L.divIcon({
      className: '',
      html: teardrop(m.color, size),
      iconSize: [size, height],
      iconAnchor: [size / 2, height]
    });
  }

  function drawMarkers(list) {
    markerLayer.clearLayers();
    byId = {};
    (list || []).forEach(function (m) {
      var marker = L.marker([m.lat, m.lng], {
        icon: iconFor(m, m.id === selectedId),
        interactive: m.selectable !== false,
        keyboard: false,
        zIndexOffset: m.id === selectedId ? 1000 : 0,
        title: m.label || ''
      });
      if (m.selectable !== false) {
        marker.on('click', function (e) {
          L.DomEvent.stopPropagation(e);
          post({ type: 'select', id: m.id === selectedId ? null : m.id });
        });
      }
      marker.addTo(markerLayer);
      byId[m.id] = { marker: marker, def: m };
    });
  }

  var lastList = [];

  function restyle() {
    Object.keys(byId).forEach(function (id) {
      var entry = byId[id];
      entry.marker.setIcon(iconFor(entry.def, id === selectedId));
      entry.marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    });
  }

  function setRadius(km) {
    radiusKm = km || 0;
    if (ring) { map.removeLayer(ring); ring = null; }
    if (!radiusKm) return;
    ring = L.circle([anchor.lat, anchor.lng], {
      radius: radiusKm * 1000,
      color: CFG.accent,
      weight: 1.5,
      opacity: 0.75,
      fillColor: CFG.accent,
      fillOpacity: 0.07,
      interactive: false
    }).addTo(map);
  }

  // Clicking bare map clears the selection, the way tapping off a callout does.
  map.on('click', function () { post({ type: 'select', id: null }); });

  window.__mapApply = function (patch) {
    if (typeof patch === 'string') { try { patch = JSON.parse(patch); } catch (e) { return; } }
    if (!patch) return;

    if (patch.center) {
      anchor = { lat: patch.center.lat, lng: patch.center.lng };
      map.setView([anchor.lat, anchor.lng], patch.zoom || map.getZoom());
      if (radiusKm) setRadius(radiusKm);
    }
    if (patch.selectedId !== undefined) selectedId = patch.selectedId;
    if (patch.markers) { lastList = patch.markers; drawMarkers(lastList); }
    else if (patch.selectedId !== undefined) restyle();
    if (patch.radiusKm !== undefined) setRadius(patch.radiusKm);

    if (patch.fit && lastList.length > 0) {
      var pts = lastList.map(function (m) { return [m.lat, m.lng]; });
      map.fitBounds(L.latLngBounds(pts).pad(0.25), { animate: false });
    }
    if (patch.invalidate) map.invalidateSize();
  };

  // The web host forwards patches as window messages; native injects directly.
  window.addEventListener('message', function (e) {
    if (!e || !e.data) return;
    window.__mapApply(e.data);
  });

  // A frame that is laid out after load (a collapsing sidebar, a tab switch)
  // leaves Leaflet with a stale size until it is told to re-measure.
  window.addEventListener('resize', function () { map.invalidateSize(); });

  setTimeout(function () { map.invalidateSize(); post({ type: 'ready' }); }, 0);
})();
</script>
</body>
</html>`;
}
