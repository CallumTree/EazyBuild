
import { MapContainer, TileLayer, Polygon as LPolygon, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-geometryutil';
import { useEffect, useMemo, useState } from 'react';
import { useViability } from '../store/viability';
import HouseOverlay from './HouseOverlay';

type LatLngLiteral = { lat: number; lng: number };

function ClickCapture({ onClick, onDblClick }: { onClick: (p: LatLngLiteral) => void; onDblClick: () => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    dblclick() {
      onDblClick();
    },
  });
  return null;
}

export default function MapPolygon() {
  const { setPolygonArea, setPolygon, showFootprints } = useViability();
  const [points, setPoints] = useState<LatLngLiteral[]>([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (points.length > 2) {
      const latlngs = points.map(p => L.latLng(p.lat, p.lng));
      const area = (L as any).GeometryUtil.geodesicArea(latlngs);
      setPolygonArea(area);
      setPolygon(points);
    } else {
      setPolygonArea(0);
      setPolygon([]);
    }
  }, [points, setPolygon, setPolygonArea]);

  const polygonPositions = useMemo(() => points.map(p => [p.lat, p.lng]) as [number, number][], [points]);

  function handleClick(p: LatLngLiteral) {
    if (closed) return;
    setPoints(prev => [...prev, p]);
  }
  
  function handleDblClick() {
    if (points.length >= 3) setClosed(true);
  }
  
  function handleUndo() {
    if (!closed) setPoints(prev => prev.slice(0, -1));
  }
  
  function handleClear() {
    setPoints([]);
    setClosed(false);
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-800">
      <div className="h-[420px] relative">
        <MapContainer 
          center={[51.5, -0.1]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }} 
          doubleClickZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickCapture onClick={handleClick} onDblClick={handleDblClick} />

          {!closed && points.length > 0 && (
            <Polyline positions={polygonPositions} pathOptions={{ color: '#22c55e' }} />
          )}
          
          {closed && points.length >= 3 && (
            <LPolygon positions={polygonPositions} pathOptions={{ color: '#22c55e', fillOpacity: 0.1 }} />
          )}

          {showFootprints && closed && points.length >= 3 && <HouseOverlay />}
        </MapContainer>

        <div className="absolute top-3 left-3 flex gap-2">
          <button onClick={handleUndo} className="px-3 py-1 rounded bg-neutral-900/80 text-white text-sm">Undo</button>
          <button onClick={handleClear} className="px-3 py-1 rounded bg-neutral-900/80 text-white text-sm">Clear</button>
          {!closed && points.length >= 3 && (
            <button onClick={handleDblClick} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Finish</button>
          )}
        </div>
        <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded bg-neutral-900/80 text-white">
          Click to add points. Double-click or press Finish to close the polygon.
        </div>
      </div>
    </div>
  );
}
