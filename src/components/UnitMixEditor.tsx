
import React, { useState } from 'react';
import { useViability } from '../store/viability';

export function UnitMixEditor() {
  const { unitTypes, updateUnitCount } = useViability();
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');

  const totalUnits = unitTypes.reduce((sum, type) => sum + type.count, 0);
  const activeTypes = unitTypes.filter(type => type.count > 0);
  const availableTypes = unitTypes.filter(type => type.count === 0);

  const handleAddType = () => {
    if (selectedTypeId) {
      updateUnitCount(selectedTypeId, 1);
      setSelectedTypeId('');
    }
  };

  const handleRemoveType = (typeId: string) => {
    updateUnitCount(typeId, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Unit Mix</h3>
        <div className="text-sm text-slate-300">
          Estimated Units: <span className="font-semibold text-brand-400">{totalUnits}</span>
        </div>
      </div>

      {/* House Type Selector */}
      <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Add House Type</h4>
        <div className="flex gap-3">
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Select a house type...</option>
            {availableTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label} - {type.areaM2}m² ({type.floors === 1 ? 'Bungalow' : 'House'})
              </option>
            ))}
          </select>
          <button
            onClick={handleAddType}
            disabled={!selectedTypeId}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Unit Mix Table */}
      {activeTypes.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-600">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">House Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Details</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Units</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Total Area</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800/30">
              {activeTypes.map((type) => (
                <tr key={type.id} className="border-t border-slate-700">
                  <td className="py-4 px-4">
                    <div className="font-medium text-white">{type.label}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-400">
                      {type.areaM2}m² • {type.floors === 1 ? 'Bungalow' : 'House'}
                    </div>
                    <div className="text-sm text-slate-500">
                      £{type.buildCostPerM2.toLocaleString()}/m²
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
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
                  </td>
                  <td className="py-4 px-4 text-center text-slate-300">
                    {(type.count * type.areaM2).toLocaleString()}m²
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleRemoveType(type.id)}
                      className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Remove from mix"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <div className="text-lg mb-2">No house types selected</div>
          <div className="text-sm">Use the selector above to add house types to your mix</div>
        </div>
      )}

      {/* Summary */}
      {activeTypes.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-xl">
            <div className="text-sm text-slate-400 mb-1">Total Units</div>
            <div className="text-xl font-bold text-brand-400">{totalUnits}</div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-xl">
            <div className="text-sm text-slate-400 mb-1">Total Floor Area</div>
            <div className="text-xl font-bold text-white">
              {activeTypes.reduce((sum, type) => sum + (type.count * type.areaM2), 0).toLocaleString()}m²
            </div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-xl">
            <div className="text-sm text-slate-400 mb-1">House Types</div>
            <div className="text-xl font-bold text-slate-300">{activeTypes.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
