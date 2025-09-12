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
    <main className="flex-1 p-6">
      {/* Map Card */}
      <div className="card h-full">
        <div className="card-header">
          <span className="text-2xl">🗺️</span>
          <h2 className="card-title">Site Map</h2>
        </div>
        <div className="card-body relative h-full">
          {/* Placeholder map area */}
          <div className="w-full h-96 bg-[var(--bg-tertiary)] rounded-lg border-2 border-dashed border-[var(--border-secondary)] flex items-center justify-center">
            <div className="text-center text-[var(--text-secondary)]">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="text-lg font-semibold text-[var(--text-primary)]">Interactive Map Coming Soon</p>
              <p className="text-sm mt-2">Leaflet integration with GPS tracking</p>
            </div>
          </div>

          {/* Floating control group */}
          <div className="absolute top-6 right-6 flex flex-col space-y-3">
            <button
              onClick={handleStart}
              className="btn-primary"
              title="Start GPS tracking"
            >
              Start Survey
            </button>

            <button
              onClick={handleAddPoint}
              className="btn-secondary"
              title="Add boundary point"
            >
              Add Point
            </button>

            <button
              onClick={handleObstacle}
              className="btn-secondary"
              title="Mark obstacle"
            >
              Add Obstacle
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};