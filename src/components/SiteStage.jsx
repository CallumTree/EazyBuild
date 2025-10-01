import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { getProjects, updateProject } from '../utils/storage';
import { calcSiteArea } from '../utils/calculators';

// Fix for default markers (JS version, no TypeScript)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

function MapWithDraw({ onAreaChange, onPolygonChange }) {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Oh snap!<strong> you can\'t draw that!'
          },
          shapeOptions: {
            color: '#22c55e',
            fillOpacity: 0.2
          }
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
      const layer = e.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);

      // Get coordinates and calculate area
      const coords = layer.getLatLngs()[0];
      const geoJSON = layer.toGeoJSON();
      
      // Convert to our format
      const polygon = coords.map(coord => ({
        lat: coord.lat,
        lng: coord.lng
      }));

      const area = calcSiteArea(geoJSON);
      onAreaChange(area);
      onPolygonChange(polygon);
    });

    map.on(L.Draw.Event.DELETED, function () {
      onAreaChange(0);
      onPolygonChange([]);
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, onAreaChange, onPolygonChange]);

  return null;
}

export function SiteStage({ projectId, onBack, onNext }) {
  console.log('Rendering SiteStage with ID:', projectId);
  const [project, setProject] = useState(null);
  const [postcode, setPostcode] = useState('');
  const [localAuthority, setLocalAuthority] = useState('');
  const [densityHint, setDensityHint] = useState('');
  const [siteAreaM2, setSiteAreaM2] = useState(0);
  const [manualArea, setManualArea] = useState('');
  const [constraintsNote, setConstraintsNote] = useState('');
  const [polygon, setPolygon] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      const projects = getProjects();
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        // Pre-fill existing data
        setPostcode(foundProject.postcode || '');
        setLocalAuthority(foundProject.localAuthority || '');
        setDensityHint(foundProject.densityHint || '');
        setSiteAreaM2(foundProject.siteAreaM2 || 0);
        setManualArea(foundProject.siteAreaM2 || '');
        setConstraintsNote(foundProject.constraintsNote || '');
        setPolygon(foundProject.polygon || []);
      }
    }
  }, [projectId]);

  const handlePostcodeChange = async (e) => {
    const value = e.target.value.toUpperCase();
    setPostcode(value);

    // Mock lookup for now
    if (value.length >= 5) {
      setLocalAuthority('London Borough of Example');
      setDensityHint('Avg 50-100 units/ha');
    } else {
      setLocalAuthority('');
      setDensityHint('');
    }
  };

  const handleAreaChange = (area) => {
    setSiteAreaM2(area);
    setManualArea(area.toString());
  };

  const handleManualAreaChange = (e) => {
    const value = e.target.value;
    setManualArea(value);
    const numValue = parseFloat(value) || 0;
    setSiteAreaM2(numValue);
  };

  const handlePolygonChange = (newPolygon) => {
    setPolygon(newPolygon);
  };

  const handleNext = async () => {
    if (siteAreaM2 <= 0) {
      alert('Please add a site area before proceeding');
      return;
    }

    if (!postcode.trim()) {
      alert('Please enter a postcode');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        postcode,
        localAuthority,
        densityHint,
        siteAreaM2,
        polygon,
        constraintsNote,
        updatedAt: new Date().toISOString()
      };

      await updateProject(projectId, updates);
      onNext();
    } catch (error) {
      alert('Failed to save site data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatArea = (areaM2) => {
    if (areaM2 <= 0) return '0 m²';
    const hectares = areaM2 / 10000;
    const acres = areaM2 * 0.000247105;
    return `${areaM2.toLocaleString()} m² (${hectares.toFixed(2)} ha, ${acres.toFixed(2)} ac)`;
  };

  const getStatusColor = () => {
    return siteAreaM2 > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getStatusEmoji = () => {
    return siteAreaM2 > 0 ? '🟢' : '🔴';
  };

  const getStatusText = () => {
    return siteAreaM2 > 0 ? 'Ready—Proceed to Mix Stage' : 'Add site area first';
  };

  if (!project) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center">
            <p className="text-slate-400">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            <button onClick={onBack} className="btn-secondary">
              ← Back to Dashboard
            </button>
            <div>
              <h1 className="card-title">Site Stage: Define Your Land</h1>
              <p className="text-slate-400 mt-1">Project: {project.name}</p>
            </div>
          </div>
        </div>

        {/* Main Site Definition Card */}
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">🗺️</span>
            <h2 className="card-title">Site Definition</h2>
          </div>
          <div className="card-body space-y-6">
            {/* Postcode Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Postcode *
              </label>
              <input
                type="text"
                value={postcode}
                onChange={handlePostcodeChange}
                className="input-field"
                placeholder="e.g. SW1A 1AA"
                required
              />
              {localAuthority && (
                <p className="text-sm text-slate-400 mt-2">
                  Local Authority: {localAuthority} • {densityHint}
                </p>
              )}
            </div>

            {/* Interactive Map */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Draw Site Boundary</h3>
              <div className="leaflet-container h-[400px] rounded-xl overflow-hidden border border-slate-700">
                <MapContainer
                  center={[55.0, -4.0]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  doubleClickZoom={false}
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
              <p className="text-sm text-slate-400">
                Use the polygon tool (top right) to draw your site boundary. Area will be calculated automatically.
              </p>
            </div>

            {/* Site Area Display & Override */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Calculated Site Area
                </label>
                <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                  <div className="kpi-value text-accent-primary">
                    {formatArea(siteAreaM2)}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Manual Override (m²)
                </label>
                <input
                  type="number"
                  value={manualArea}
                  onChange={handleManualAreaChange}
                  className="input-field"
                  placeholder="Enter manual area"
                  min="0"
                />
              </div>
            </div>

            {/* Constraints Note */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Site Constraints & Notes
              </label>
              <textarea
                value={constraintsNote}
                onChange={(e) => setConstraintsNote(e.target.value)}
                className="input-field"
                rows="4"
                placeholder="e.g. Flood risk, access issues, trees, existing structures..."
              />
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-slate-300">
                <strong>Postcode:</strong> {postcode || 'Not set'} | 
                <strong> Area:</strong> {formatArea(siteAreaM2)} | 
                <strong> Density Hint:</strong> {densityHint || 'Not available'}
              </div>
              <div className="flex items-center gap-4">
                <span className={`btn-ghost text-sm ${getStatusColor()}`}>
                  {getStatusEmoji()} {getStatusText()}
                </span>
                <button
                  onClick={handleNext}
                  disabled={siteAreaM2 <= 0 || !postcode.trim() || loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Next: Mix Stage →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}