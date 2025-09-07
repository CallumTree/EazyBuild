
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const MapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container py-8 space-y-8">
      <div className="mb-6">
        <Link to={`/project/${id}`} className="text-emerald-400 hover:text-emerald-300 mb-4 inline-flex items-center gap-2 transition-colors">
          <span>←</span>
          <span>Back to Project</span>
        </Link>
        <h1 className="text-3xl font-bold">GPS Walk & Mapping</h1>
        <p className="text-slate-400 mt-2">Define boundaries and mark obstacles</p>
      </div>

      <div className="card">
        <div className="card-body text-center py-16">
          <div className="text-6xl mb-6">🗺️</div>
          <h3 className="text-2xl font-semibold mb-4">Interactive Map Coming Soon</h3>
          <p className="text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
            This will include Leaflet map integration for GPS boundary walking and obstacle marking
          </p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-xl">
              <span className="text-emerald-400 text-xl">✅</span>
              <span className="text-slate-300">GPS location tracking</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-xl">
              <span className="text-emerald-400 text-xl">✅</span>
              <span className="text-slate-300">Auto-draw boundary from walk</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-xl">
              <span className="text-emerald-400 text-xl">✅</span>
              <span className="text-slate-300">Mark trees, ponds, structures</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-xl">
              <span className="text-emerald-400 text-xl">✅</span>
              <span className="text-slate-300">Calculate site area</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
