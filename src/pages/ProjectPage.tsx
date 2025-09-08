
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjectStore();
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-semibold mb-4">Project Not Found</h2>
            <p className="text-slate-400 mb-8">The project you're looking for doesn't exist.</p>
            <Link to="/" className="btn">
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="mb-6">
        <Link to="/" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-flex items-center gap-2 transition-colors">
          <span>←</span>
          <span>Back to Projects</span>
        </Link>
        <h1 className="text-3xl font-bold text-white">{project.name}</h1>
        <p className="text-slate-400 mt-2">Project overview and management</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">🗺️</span>
            <h3 className="card-title">Survey & Map</h3>
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
            <h3 className="card-title">Unit Mix</h3>
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
            <h3 className="card-title">Finance</h3>
          </div>
          <div className="card-body">
            <p className="text-slate-300 mb-6">
              Set costs, rates, and calculate land value
            </p>
            <Link to="/finance" className="btn w-full">
              View Appraisal
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="text-2xl">📊</span>
          <h3 className="card-title">Project Summary</h3>
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
