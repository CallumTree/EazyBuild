
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const MapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to={`/project/${id}`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Project
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">GPS Walk & Mapping</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            This will include Leaflet map integration for GPS boundary walking and obstacle marking
          </p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>GPS location tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Auto-draw boundary from walk</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Mark trees, ponds, structures</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Calculate site area</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
