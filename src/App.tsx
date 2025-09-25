import React from 'react';
import TotalsHeader from './components/TotalsHeader';
import MapPolygon from './components/MapPolygon';
import UnitMixEditor from './components/UnitMixEditor';
import { useViability } from './store/viability';
import './index.css';

export default function App() {
  const { totals } = useViability();

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">LandSnap</h1>
          <p className="text-neutral-400">Quick Development Feasibility Tool</p>
        </div>

        {/* Totals Header */}
        <TotalsHeader />

        {/* Map Section */}
        <div className="bg-neutral-900 rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-4">Site Boundary</h2>
          <MapPolygon />
        </div>

        {/* Unit Mix Editor */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Unit Mix & Controls</h2>
          <UnitMixEditor />
        </div>

        {/* Results Summary */}
        {totals && (
          <div className="bg-neutral-900 rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-800 rounded-xl p-4">
                <div className="text-sm opacity-70">GDV</div>
                <div className="text-2xl font-bold text-emerald-400">
                  £{totals.gdv?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="bg-neutral-800 rounded-xl p-4">
                <div className="text-sm opacity-70">Build Costs</div>
                <div className="text-2xl font-bold text-amber-400">
                  £{totals.buildCosts?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="bg-neutral-800 rounded-xl p-4">
                <div className="text-sm opacity-70">Profit</div>
                <div className={`text-2xl font-bold ${(totals.profit || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  £{totals.profit?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}