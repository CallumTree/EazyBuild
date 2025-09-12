
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapProps {
  boundary?: Array<{ lat: number; lng: number }>;
  onBoundaryChange: (boundary: Array<{ lat: number; lng: number }>) => void;
  onAreaChange: (areaM2: number) => void;
  className?: string;
}

function MapController({ boundary, onBoundaryChange, onAreaChange }: {
  boundary?: Array<{ lat: number; lng: number }>;
  onBoundaryChange: (boundary: Array<{ lat: number; lng: number }>) => void;
  onAreaChange: (areaM2: number) => void;
}) {
  const map = useMap();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  useEffect(() => {
    map.addLayer(featureGroupRef.current);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: featureGroupRef.current,
      }
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    // Load existing boundary
    if (boundary && boundary.length > 2) {
      const latLngs = boundary.map(p => [p.lat, p.lng] as [number, number]);
      const polygon = L.polygon(latLngs, {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        weight: 2,
      });
      
      featureGroupRef.current.addLayer(polygon);
      polygonLayerRef.current = polygon;
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] });

      // Calculate area
      const geoJsonFeature = turf.polygon([latLngs.concat([latLngs[0]])]);
      const area = turf.area(geoJsonFeature);
      onAreaChange(area);
    }

    const handleDrawCreated = (e: any) => {
      const { layer } = e;
      
      // Remove existing polygon
      if (polygonLayerRef.current) {
        featureGroupRef.current.removeLayer(polygonLayerRef.current);
      }

      featureGroupRef.current.addLayer(layer);
      polygonLayerRef.current = layer;

      const latLngs = layer.getLatLngs()[0];
      const boundary = latLngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
      onBoundaryChange(boundary);

      // Calculate area using turf
      const coords = latLngs.map((ll: L.LatLng) => [ll.lng, ll.lat]);
      coords.push(coords[0]); // Close the polygon
      const geoJsonFeature = turf.polygon([coords]);
      const area = turf.area(geoJsonFeature);
      onAreaChange(area);
    };

    const handleDrawEdited = (e: any) => {
      const { layers } = e;
      layers.eachLayer((layer: any) => {
        const latLngs = layer.getLatLngs()[0];
        const boundary = latLngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
        onBoundaryChange(boundary);

        // Calculate area
        const coords = latLngs.map((ll: L.LatLng) => [ll.lng, ll.lat]);
        coords.push(coords[0]);
        const geoJsonFeature = turf.polygon([coords]);
        const area = turf.area(geoJsonFeature);
        onAreaChange(area);
      });
    };

    const handleDrawDeleted = () => {
      polygonLayerRef.current = null;
      onBoundaryChange([]);
      onAreaChange(0);
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);
    map.on(L.Draw.Event.EDITED, handleDrawEdited);
    map.on(L.Draw.Event.DELETED, handleDrawDeleted);

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      map.removeLayer(featureGroupRef.current);
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
      map.off(L.Draw.Event.EDITED, handleDrawEdited);
      map.off(L.Draw.Event.DELETED, handleDrawDeleted);
    };
  }, [map, onBoundaryChange, onAreaChange]);

  return null;
}

export function InteractiveMap({ boundary, onBoundaryChange, onAreaChange, className = "" }: InteractiveMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUseGPS = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleClearBoundary = useCallback(() => {
    onBoundaryChange([]);
    onAreaChange(0);
  }, [onBoundaryChange, onAreaChange]);

  const handleExportGeoJSON = useCallback(() => {
    if (!boundary || boundary.length < 3) {
      alert('No boundary to export');
      return;
    }

    const coords = boundary.map(p => [p.lng, p.lat]);
    coords.push(coords[0]); // Close polygon
    
    const geoJson = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords]
      },
      properties: {}
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-boundary.geojson';
    a.click();
    URL.revokeObjectURL(url);
  }, [boundary]);

  const center: [number, number] = userLocation || 
    (boundary && boundary.length > 0 
      ? [boundary[0].lat, boundary[0].lng] 
      : [51.5074, -0.1278]); // Default to London

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <button
          onClick={handleUseGPS}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          {loading ? '📍 Getting GPS...' : '📍 Use GPS'}
        </button>
        <button
          onClick={handleClearBoundary}
          className="btn-ghost text-sm"
        >
          🗑️ Clear Boundary
        </button>
        <button
          onClick={handleExportGeoJSON}
          className="btn-ghost text-sm"
          disabled={!boundary || boundary.length < 3}
        >
          📄 Export GeoJSON
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={userLocation ? 16 : 13}
        style={{ height: '100%', width: '100%' }}
        key={userLocation ? `${userLocation[0]},${userLocation[1]}` : 'default'}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        <MapController
          boundary={boundary}
          onBoundaryChange={onBoundaryChange}
          onAreaChange={onAreaChange}
        />
      </MapContainer>
    </div>
  );
}
