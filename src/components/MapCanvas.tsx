
import React from 'react';

export const MapCanvas: React.FC = () => {
  const handleStart = () => {
    console.log('Start clicked');
  };

  const handleAddPoint = () => {
    console.log('Add Point clicked');
  };

  const handleObstacle = () => {
    console.log('Obstacle clicked');
  };

  return (
    <div className="flex-1 p-4">
      <div className="card h-full relative overflow-hidden">
        {/* Placeholder map area */}
        <div className="w-full h-full map-placeholder flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Interactive Map
            </h3>
            <p className="text-gray-500">
              Leaflet map will be integrated here
            </p>
          </div>
        </div>

        {/* Floating control buttons */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleStart}
            className="btn-primary shadow-lg"
            title="Start GPS tracking"
          >
            Start
          </button>
          
          <button
            onClick={handleAddPoint}
            className="btn-ghost shadow-lg"
            title="Add boundary point"
          >
            Add Point
          </button>
          
          <button
            onClick={handleObstacle}
            className="btn-ghost shadow-lg"
            title="Mark obstacle"
          >
            Obstacle
          </button>
        </div>
      </div>
    </div>
  );
};
