
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  polygonGeoJSON: any | null;
  onPolygonChange: (geoJSON: any | null, areaM2: number) => void;
  className?: string;
}

export function InteractiveMap({ polygonGeoJSON, onPolygonChange, className = '' }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const currentPolygonRef = useRef<L.Polygon | null>(null);

  // Load existing polygon
  useEffect(() => {
    if (polygonGeoJSON && featureGroupRef.current && !currentPolygonRef.current) {
      try {
        const layer = L.geoJSON(polygonGeoJSON);
        layer.eachLayer((l) => {
          featureGroupRef.current?.addLayer(l);
          currentPolygonRef.current = l as L.Polygon;
        });
      } catch (e) {
        console.warn('Failed to load polygon:', e);
      }
    }
  }, [polygonGeoJSON]);

  const calculateArea = (layer: L.Layer): number => {
    if (layer instanceof L.Polygon) {
      const geoJSON = layer.toGeoJSON();
      try {
        const area = turf.area(geoJSON);
        return area;
      } catch (e) {
        console.warn('Failed to calculate area:', e);
        return 0;
      }
    }
    return 0;
  };

  const handleCreated = (e: any) => {
    const layer = e.layer as L.Polygon;
    
    // Remove existing polygon
    if (currentPolygonRef.current && featureGroupRef.current) {
      featureGroupRef.current.removeLayer(currentPolygonRef.current);
    }
    
    currentPolygonRef.current = layer;
    const geoJSON = layer.toGeoJSON();
    const area = calculateArea(layer);
    onPolygonChange(geoJSON, area);
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        const geoJSON = layer.toGeoJSON();
        const area = calculateArea(layer);
        onPolygonChange(geoJSON, area);
      }
    });
  };

  const handleDeleted = (e: any) => {
    currentPolygonRef.current = null;
    onPolygonChange(null, 0);
  };

  const handleGPS = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.setView([latitude, longitude], 16);
          
          // Add temporary marker
          const marker = L.marker([latitude, longitude]).addTo(mapRef.current!);
          setTimeout(() => {
            marker.remove();
          }, 5000);
        },
        (error) => {
          console.warn('GPS error:', error);
          alert('Could not get your location. Please check GPS permissions.');
        }
      );
    } else {
      alert('GPS not available in this browser.');
    }
  };

  const handleExportGeoJSON = () => {
    if (currentPolygonRef.current) {
      const geoJSON = currentPolygonRef.current.toGeoJSON();
      const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'polygon.geojson';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('No polygon to export');
    }
  };

  const handleImportGeoJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.geojson,.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const geoJSON = JSON.parse(e.target.result);
            
            // Remove existing polygon
            if (currentPolygonRef.current && featureGroupRef.current) {
              featureGroupRef.current.removeLayer(currentPolygonRef.current);
            }
            
            // Add new polygon
            const layer = L.geoJSON(geoJSON);
            layer.eachLayer((l) => {
              featureGroupRef.current?.addLayer(l);
              currentPolygonRef.current = l as L.Polygon;
            });
            
            const area = turf.area(geoJSON);
            onPolygonChange(geoJSON, area);
            
            // Fit map to polygon
            if (featureGroupRef.current && mapRef.current) {
              mapRef.current.fitBounds(featureGroupRef.current.getBounds());
            }
          } catch (e) {
            alert('Invalid GeoJSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 left-2 z-[1000] flex gap-2">
        <button 
          onClick={handleGPS}
          className="px-3 py-1 bg-slate-800 text-white text-sm rounded border border-slate-600 hover:bg-slate-700"
        >
          📍 Use GPS
        </button>
        <button 
          onClick={handleImportGeoJSON}
          className="px-3 py-1 bg-slate-800 text-white text-sm rounded border border-slate-600 hover:bg-slate-700"
        >
          📥 Import
        </button>
        <button 
          onClick={handleExportGeoJSON}
          className="px-3 py-1 bg-slate-800 text-white text-sm rounded border border-slate-600 hover:bg-slate-700"
        >
          📤 Export
        </button>
      </div>
      
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#e1e100',
                  message: '<strong>Error:</strong> shape edges cannot cross!'
                },
                shapeOptions: {
                  color: '#97fb00'
                }
              }
            }}
            edit={{
              featureGroup: featureGroupRef.current
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}
