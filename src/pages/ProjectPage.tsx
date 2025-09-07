
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const project = {
    id: id || '1',
    name: `Project ${id}`,
    status: 'draft',
    gdv: 1500000,
    units: 8,
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏗️</span>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-slate-400">Project Overview</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <div className="card-header">
                <span className="text-2xl">🗺️</span>
                <h3 className="text-xl font-semibold">Survey & Map</h3>
              </div>
              <div className="card-body">
                <p className="text-slate-300 mb-6">
                  Define site boundaries and mark obstacles using GPS walking
                </p>
                <Link 
                  to={`/project/${id}/map`} 
                  className="btn w-full"
                >
                  Open Map
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="text-2xl">🏠</span>
                <h3 className="text-xl font-semibold">Unit Mix</h3>
              </div>
              <div className="card-body">
                <p className="text-slate-300 mb-6">
                  Configure house types, counts, and floor areas
                </p>
                <Link to="/layout" className="btn w-full">
                  Configure Mix
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="text-2xl">💰</span>
                <h3 className="text-xl font-semibold">Finance</h3>
              </div>
              <div className="card-body">
                <p className="text-slate-300 mb-6">
                  Calculate build costs, GDV, and profit margins
                </p>
                <Link to="/finance" className="btn w-full">
                  Open Finance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="text-2xl">📊</span>
          <h3 className="text-xl font-semibold">Project Summary</h3>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-700/50 rounded-xl text-center">
              <div className="text-sm text-slate-400 mb-2">Status</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                project.status === 'draft' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {project.status}
              </div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl text-center">
              <div className="text-sm text-slate-400 mb-2">GDV</div>
              <div className="text-xl font-semibold text-emerald-400">
                {project.gdv ? `£${project.gdv.toLocaleString()}` : 'Not set'}
              </div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl text-center">
              <div className="text-sm text-slate-400 mb-2">Units</div>
              <div className="text-xl font-semibold">
                {project.units || 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
