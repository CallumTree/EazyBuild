
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const MapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <Link to={`/project/${id}`} className="text-sky-400 hover:text-sky-300">
          ← Back to Project
        </Link>
      </div>
      
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">🗺️</span>
          <h1 className="text-2xl font-bold">Site Map</h1>
        </div>
        <div className="card-body">
          <div className="bg-slate-700 rounded-xl h-64 flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <p className="text-slate-300">Map integration coming soon</p>
              <p className="text-sm text-slate-400">GPS walking and boundary mapping</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="btn w-full">
              Start GPS Walking
            </button>
            <button className="btn-ghost w-full">
              Add Obstacle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
