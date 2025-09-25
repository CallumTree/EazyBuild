
import React from 'react';
import { useGlobalStore } from '../store/globalStore';
import { NumberInput } from '../components/NumberInput';
import { InteractiveMap } from '../components/InteractiveMap';
import { MapPin, Maximize } from 'lucide-react';

export const SurveyPage: React.FC = () => {
  const { project, updateProject } = useGlobalStore();

  const handlePolygonChange = (geoJSON: any, area: number) => {
    updateProject({
      survey: {
        ...project.survey,
        polygonGeoJSON: geoJSON,
        siteAreaM2: area,
      }
    });
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <MapPin className="text-brand-400" size={24} />
          <h2 className="card-title">Site Survey</h2>
        </div>
        <div className="card-body">
          <p className="text-slate-400 mb-4">
            Define your site boundary by drawing on the map or importing a boundary file.
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="card">
        <div className="card-header">
          <Maximize className="text-brand-400" size={20} />
          <h3 className="card-title">Interactive Map</h3>
        </div>
        <div className="card-body">
          <InteractiveMap
            polygon={project.survey.polygonGeoJSON}
            onPolygonChange={handlePolygonChange}
          />
        </div>
      </div>

      {/* Site Details */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Site Details</h3>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Site Area (m²)</label>
            <NumberInput
              value={project.survey.siteAreaM2}
              onChange={(value) => updateProject({
                survey: { ...project.survey, siteAreaM2: value }
              })}
              placeholder="Auto-calculated from map"
              className="input"
            />
            <p className="text-sm text-slate-400 mt-1">
              {project.survey.siteAreaM2 > 0 && (
                <>
                  {(project.survey.siteAreaM2 / 10000).toFixed(2)} hectares • {' '}
                  {(project.survey.siteAreaM2 * 0.000247105).toFixed(2)} acres
                </>
              )}
            </p>
          </div>
          
          <div>
            <label className="label">Development Efficiency (%)</label>
            <NumberInput
              value={project.survey.efficiency}
              onChange={(value) => updateProject({
                survey: { ...project.survey, efficiency: value }
              })}
              placeholder="70"
              className="input"
              min={0}
              max={100}
            />
            <p className="text-sm text-slate-400 mt-1">
              Percentage of site area available for development after roads, landscaping, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
