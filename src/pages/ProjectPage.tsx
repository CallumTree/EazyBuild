
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProject, setCurrentProject } = useProjectStore();

  useEffect(() => {
    if (id) {
      setCurrentProject(id);
    }
  }, [id, setCurrentProject]);

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <Link to="/" className="btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{currentProject.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* GPS Walk Card */}
        <Link to={`/project/${id}/map`} className="block">
          <div className="card hover:shadow-lg transition-all hover:border-brand-500/50">
            <div className="card-body">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold mb-2">GPS Walk</h3>
              <p className="text-slate-300 mb-4">
                Walk the site perimeter to auto-draw boundary and mark obstacles
              </p>
              <div className="text-sm text-slate-400">
                {currentProject.boundary ? 
                  `✅ Boundary mapped (${currentProject.boundary.length} points)` : 
                  '📍 Start mapping'
                }
              </div>
            </div>
          </div>
        </Link>

        {/* Layout Planning Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Layout</h3>
          <p className="text-gray-600 mb-4">
            Choose house type and estimate unit count
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">House Type</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={currentProject.houseType || ''}
                onChange={(e) => {
                  // This will be implemented with the store update
                }}
              >
                <option value="">Select type...</option>
                <option value="detached">Detached</option>
                <option value="semi-detached">Semi-detached</option>
                <option value="terraced">Terraced</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Units</label>
              <input 
                type="number" 
                min="2" 
                max="15" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={currentProject.estimatedUnits || ''}
                placeholder="2-15 units"
              />
            </div>
          </div>
        </div>

        {/* Finance Calculator Card */}
        <Link to={`/project/${id}/finance`} className="block">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Finance Calculator</h3>
            <p className="text-gray-600 mb-4">
              Calculate GDV, costs, and residual land value
            </p>
            <div className="text-sm text-gray-500">
              {currentProject.finance ? 
                `✅ RLV: £${currentProject.finance.residualLandValue.toLocaleString()}` : 
                '💰 Calculate financials'
              }
            </div>
          </div>
        </Link>

        {/* Offer Pack Export Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Offer Pack PDF</h3>
          <p className="text-gray-600 mb-4">
            Export site map and financials as PDF
          </p>
          <button 
            className="btn-success w-full"
            disabled={!currentProject.boundary || !currentProject.finance}
          >
            {currentProject.boundary && currentProject.finance ? 
              'Export PDF' : 
              'Complete mapping & finance first'
            }
          </button>
        </div>
      </div>
    </div>
  );
};
