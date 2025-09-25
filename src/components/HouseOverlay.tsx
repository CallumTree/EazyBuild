
import { useEffect } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useMap } from 'react-leaflet';
import { useViability } from '../store/viability';

type Dims = {
  buildingW: number; // m
  buildingD: number; // m
  plotW: number;     // m
  plotD: number;     // m
  frontSetback: number; // m
  rearGarden: number;   // m
  driveW: number;       // m
  driveD: number;       // m
};

const DEFAULT: Dims = {
  buildingW: 6.0,
  buildingD: 7.5,   // ~45 m² per floor -> ~90 m² 2-storey
  plotW: 10.0,
  plotD: 22.5,      // 5 front + 7.5 house + 10 garden
  frontSetback: 5.0,
  rearGarden: 10.0,
  driveW: 5.0,
  driveD: 5.0,
};

export default function HouseOverlay() {
  const map = useMap();
  const { polygonCoords, showFootprints, footprintScale } = useViability();

  useEffect(() => {
    if (!map || !showFootprints || polygonCoords.length < 3) return;

    const layer = L.layerGroup().addTo(map);

    const coords = polygonCoords.map(p => [p.lng, p.lat]) as [number, number][];
    const closed = coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]
      ? coords
      : [...coords, coords[0]];
    const sitePoly = turf.polygon([closed]);

    const s = Math.max(0.6, Math.min(1.6, footprintScale));
    const dims = scaleDims(DEFAULT, s);

    const bbox = turf.bbox(sitePoly); // [minX, minY, maxX, maxY]
    const topLeft: turf.helpers.Position = [bbox[0], bbox[3]];

    const cols = clampInt(metersWide(bbox, polygonCoords[0].lat) / dims.plotW, 1, 200);
    const rows = clampInt(metersHigh(bbox) / dims.plotD, 1, 200);

    let placed = 0;
    outer: for (let r = 0; r < rows; r++) {
      const rowStart = move(topLeft, r * dims.plotD, 180);
      for (let c = 0; c < cols; c++) {
        const origin = move(rowStart, c * dims.plotW, 90);

        const plotPoly = rectFromTopLeft(origin, dims.plotW, dims.plotD);
        if (!turf.booleanContains(sitePoly, plotPoly)) continue;

        addGeo(layer, plotPoly, { color: '#ffffff', weight: 1, fillOpacity: 0.12 });

        const houseLeft = move(origin, (dims.plotW - dims.buildingW) / 2, 90);
        const houseTopLeft = move(houseLeft, dims.frontSetback, 180);
        const housePoly = rectFromTopLeft(houseTopLeft, dims.buildingW, dims.buildingD);
        addGeo(layer, housePoly, { color: '#22c55e', weight: 1, fillOpacity: 0.35 });

        const driveLeft = move(origin, 0.5, 90);
        const driveTopLeft = move(driveLeft, 0.5, 180);
        const drivePoly = rectFromTopLeft(driveTopLeft, Math.min(dims.driveW, dims.plotW - 1), Math.min(dims.driveD, dims.frontSetback - 1));
        addGeo(layer, drivePoly, { color: '#60a5fa', weight: 1, fillOpacity: 0.35 });

        placed++;
        if (placed > 600) break outer;
      }
    }

    return () => {
      layer.remove();
    };
  }, [map, polygonCoords, showFootprints, footprintScale]);

  return null;
}

// helpers
function move(fromLngLat: turf.helpers.Position, meters: number, bearingDeg: number): turf.helpers.Position {
  const km = Math.max(0, meters) / 1000;
  return turf.destination(fromLngLat, km, bearingDeg, { units: 'kilometers' }).geometry.coordinates as turf.helpers.Position;
}

function rectFromTopLeft(tl: turf.helpers.Position, w: number, d: number) {
  const tr = move(tl, w, 90);
  const br = move(tr, d, 180);
  const bl = move(tl, d, 180);
  return turf.polygon([[tl, tr, br, bl, tl]]);
}

function addGeo(layer: L.LayerGroup, poly: turf.helpers.Polygon, style: L.PathOptions) {
  const gj = L.geoJSON(poly as any, { style });
  layer.addLayer(gj);
}

function metersHigh(bbox: turf.helpers.BBox) {
  return (bbox[3] - bbox[1]) * 111320;
}

function metersWide(bbox: turf.helpers.BBox, lat: number) {
  return (bbox[2] - bbox[0]) * 111320 * Math.cos(lat * Math.PI / 180);
}

function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function scaleDims(d: Dims, s: number): Dims {
  return {
    buildingW: d.buildingW * s,
    buildingD: d.buildingD * s,
    plotW: d.plotW * s,
    plotD: d.plotD * s,
    frontSetback: d.frontSetback * s,
    rearGarden: d.rearGarden * s,
    driveW: d.driveW * s,
    driveD: d.driveD * s,
  };
}
