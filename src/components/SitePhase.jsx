
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { getProject, updateProject } from '../utils/storage';
import { calcSiteArea } from '../utils/calculators';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapWithDraw({ onAreaChange, onPolygonChange }) {
  const map = useMap();
  const drawControlRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const featureGroupRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    map.addLayer(featureGroupRef.current);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.2,
          }
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

    const handleDrawCreated = (e) => {
      const { layer } = e;
      
      // Remove existing polygon
      if (polygonLayerRef.current) {
        featureGroupRef.current.removeLayer(polygonLayerRef.current);
      }

      featureGroupRef.current.addLayer(layer);
      polygonLayerRef.current = layer;

      const latLngs = layer.getLatLngs()[0];
      
      // Calculate area using turf
      const coords = latLngs.map((ll) => [ll.lng, ll.lat]);
      coords.push(coords[0]); // Close the polygon
      const geoJsonFeature = turf.polygon([coords]);
      const area = calcSiteArea(geoJsonFeature);
      
      onAreaChange(Math.round(area));
      onPolygonChange(geoJsonFeature);
    };

    const handleDrawEdited = (e) => {
      const { layers } = e;
      layers.eachLayer((layer) => {
        const latLngs = layer.getLatLngs()[0];
        
        const coords = latLngs.map((ll) => [ll.lng, ll.lat]);
        coords.push(coords[0]);
        const geoJsonFeature = turf.polygon([coords]);
        const area = calcSiteArea(geoJsonFeature);
        
        onAreaChange(Math.round(area));
        onPolygonChange(geoJsonFeature);
      });
    };

    const handleDrawDeleted = () => {
      polygonLayerRef.current = null;
      onAreaChange(0);
      onPolygonChange(null);
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
  }, [map, onAreaChange, onPolygonChange]);

  return null;
}

export function SitePhase({ projectId, onBack, onNext }) {
  const [project, setProject] = useState(null);
  const [postcode, setPostcode] = useState('');
  const [siteAreaM2, setSiteAreaM2] = useState(0);
  const [constraintsNote, setConstraintsNote] = useState('');
  const [localAuthority, setLocalAuthority] = useState('');
  const [densityHint, setDensityHint] = useState('');
  const [polygon, setPolygon] = useState(null);

  useEffect(() => {
    console.log('SitePhase loaded for project ID:', projectId);
    if (projectId) {
      const projectData = getProject(projectId);
      if (projectData) {
        setProject(projectData);
        setPostcode(projectData.postcode || '');
        setSiteAreaM2(projectData.siteAreaM2 || 0);
        setConstraintsNote(projectData.constraintsNote || '');
        setLocalAuthority(projectData.localAuthority || '');
        setDensityHint(projectData.densityHint || '');
        setPolygon(projectData.polygon || null);
      }
    }
  }, [projectId]);

  const handlePostcodeChange = async (value) => {
    setPostcode(value.toUpperCase());
    
    // Fetch region and multiplier when postcode has 5+ characters
    if (value.length >= 5) {
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${value.replace(/\s/g, '')}`);
        const data = await response.json();
        
        if (data.status === 200 && data.result) {
          const region = data.result.region || '';
          const adminDistrict = data.result.admin_district || '';
          
          // Map region to multiplier
          const regionMultipliers = {
            'London': 1.8,
            'South East': 1.25,
            'East of England': 1.1,
            'South West': 1.15,
            'West Midlands': 0.95,
            'East Midlands': 0.9,
            'North West': 0.85,
            'North East': 0.8,
            'Yorkshire and The Humber': 0.9,
            'Scotland': 0.85,
            'Wales': 0.9,
            'Northern Ireland': 0.95
          };
          
          const multiplier = regionMultipliers[region] || 1.0;
          
          setLocalAuthority(adminDistrict);
          setDensityHint(`${region} (${multiplier}x value uplift)`);
          
          // Save multiplier to project
          updateProject(projectId, { multiplier });
        } else {
          // Fallback
          setLocalAuthority('Unknown');
          setDensityHint('');
          updateProject(projectId, { multiplier: 1.0 });
        }
      } catch (error) {
        console.error('Postcode lookup failed:', error);
        setLocalAuthority('Unknown');
        setDensityHint('');
        updateProject(projectId, { multiplier: 1.0 });
      }
    } else {
      setLocalAuthority('');
      setDensityHint('');
    }
  };

  const handleAreaChange = (area) => {
    setSiteAreaM2(area);
  };

  const handlePolygonChange = (geoJSON) => {
    setPolygon(geoJSON);
  };

  const handleNext = () => {
    if (!postcode.trim()) {
      alert('Please enter a postcode');
      return;
    }
    
    if (siteAreaM2 <= 0) {
      alert('Please enter a site area greater than 0 or draw a boundary on the map');
      return;
    }

    try {
      updateProject(projectId, {
        postcode: postcode.trim(),
        siteAreaM2,
        constraintsNote: constraintsNote.trim(),
        localAuthority,
        densityHint,
        polygon
      });
      
      alert('Site phase data saved!');
      onNext();
    } catch (error) {
      alert('Error saving: ' + error.message);
    }
  };

  if (!project) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body">
            <p className="text-slate-300">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  const isReady = postcode.trim().length > 0 && siteAreaM2 > 0;

  return (
    <div className="container py-8 pb-24">
      <div className="card">
        <div className="card-header">
          <button onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="card-title">Site Phase: Define Your Land</h1>
            <p className="text-slate-400 text-sm mt-1">{project.name}</p>
          </div>
        </div>
        
        <div className="card-body space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Postcode *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., SW1A 1AA"
                value={postcode}
                onChange={(e) => handlePostcodeChange(e.target.value)}
                required
              />
              {localAuthority && (
                <div className="mt-2 text-sm text-slate-400">
                  <p>📍 LA: {localAuthority}</p>
                  <p>🏘️ {densityHint}</p>
                </div>
              )}
            </div>

            {/* Map Section */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Draw Site Boundary (Optional)
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Draw boundary on the map or use manual area input below. Use the polygon tool in the top-right corner.
              </p>
              <div className="leaflet-container h-[400px] rounded-xl border border-slate-700 overflow-hidden">
                <MapContainer
                  center={[55, -4]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapWithDraw 
                    onAreaChange={handleAreaChange}
                    onPolygonChange={handlePolygonChange}
                  />
                </MapContainer>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Site Area (m²) *
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="Enter site area or draw on map"
                value={siteAreaM2}
                onChange={(e) => setSiteAreaM2(parseFloat(e.target.value) || 0)}
                required
                min="1"
              />
              {siteAreaM2 > 0 && (
                <p className="text-sm text-slate-400 mt-1 kpi-value">
                  {siteAreaM2.toLocaleString()} m²
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Constraints Note
              </label>
              <textarea
                className="input-field input-field-lg"
                placeholder="e.g., Flood risk, existing trees, access issues..."
                value={constraintsNote}
                onChange={(e) => setConstraintsNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Summary Footer */}
          <div className="card bg-slate-700/30 border-slate-600">
            <div className="card-body">
              <div className="text-sm space-y-1">
                <p><strong>Postcode:</strong> {postcode || 'Not set'}</p>
                <p><strong>Area:</strong> {siteAreaM2 > 0 ? `${siteAreaM2.toLocaleString()} m²` : 'Not set'}</p>
                {densityHint && <p><strong>Density Hint:</strong> {densityHint}</p>}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className={`btn-ghost text-sm ${isReady ? 'text-green-400' : 'text-red-400'}`}>
                  {isReady ? '🟢 Ready—Proceed to Mix Stage' : '🔴 Add site area first'}
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!isReady}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Mix Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 z-50">
        <div className="container mx-auto">
          <ul className="grid grid-cols-4 max-w-md mx-auto">
            <li className="relative group">
              <button
                onClick={onBack}
                className="bottom-nav-button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <span className="nav-tooltip">Home</span>
            </li>
            <li className="relative group">
              <button className="bottom-nav-button active">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <span className="nav-tooltip">Site Phase</span>
            </li>
            <li className="relative group">
              <button
                onClick={onNext}
                disabled={!isReady}
                className="bottom-nav-button disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </button>
              <span className="nav-tooltip">Mix Phase</span>
            </li>
            <li className="relative group">
              <button className="bottom-nav-button opacity-30 cursor-not-allowed">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <span className="nav-tooltip">Viability Phase</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
