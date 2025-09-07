
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const MapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container py-6 space-y-6">
      <div className="mb-6">
        <Link to={`/project/${id}`} className="text-brand-400 hover:text-brand-300 mb-4 inline-block">
          ← Back to Project
        </Link>
        <h1 className="text-3xl font-bold">GPS Walk & Mapping</h1>
      </div>

      <div className="card">
        <div className="card-body text-center py-12">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold mb-2">Interactive Map Coming Soon</h3>
          <p className="text-slate-300 mb-6">
            This will include Leaflet map integration for GPS boundary walking and obstacle marking
          </p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3">
              <span className="text-brand-400">✅</span>
              <span className="text-slate-300">GPS location tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-brand-400">✅</span>
              <span className="text-slate-300">Auto-draw boundary from walk</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-brand-400">✅</span>
              <span className="text-slate-300">Mark trees, ponds, structures</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-brand-400">✅</span>
              <span className="text-slate-300">Calculate site area</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
