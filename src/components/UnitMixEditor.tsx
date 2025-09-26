
import React from 'react';
import { useViability } from '../store/viability';

export function UnitMixEditor() {
  const { unitTypes, updateUnitCount } = useViability();

  const totalUnits = unitTypes.reduce((sum, type) => sum + type.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Unit Mix</h3>
        <div className="text-sm text-slate-300">
          Estimated Units: <span className="font-semibold text-brand-400">{totalUnits}</span>
        </div>
      </div>

      <div className="space-y-3">
        {unitTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600"
          >
            <div className="flex-1">
              <div className="font-medium text-white">{type.label}</div>
              <div className="text-sm text-slate-400">
                {type.areaM2}m² • {type.floors === 1 ? 'Bungalow' : 'House'} • £{type.buildCostPerM2.toLocaleString()}/m²
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">Count:</label>
              <input
                type="number"
                min="0"
                max="99"
                value={type.count}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 0;
                  updateUnitCount(type.id, count);
                }}
                className="w-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
        ))}
      </div>

      {totalUnits === 0 && (
        <div className="text-center py-8 text-slate-400">
          Set counts above to build your unit mix
        </div>
      )}
    </div>
  );
}
