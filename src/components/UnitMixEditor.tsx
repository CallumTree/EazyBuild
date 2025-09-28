
import React, { useState } from 'react';
import { useStore } from '../store';
import { CustomUnitTypeModal } from './CustomUnitTypeModal';

export function UnitMixEditor() {
  const { project, houseTypes, updateProject, addCustomHouseType } = useStore();
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const unitMix = project.unitMix || [];
  const totalUnits = unitMix.reduce((sum, mix) => sum + mix.count, 0);
  const activeTypes = unitMix.filter(mix => mix.count > 0);
  const availableTypes = houseTypes.filter(ht => 
    !unitMix.find(mix => mix.houseTypeId === ht.id && mix.count > 0)
  );

  const handleAddType = () => {
    if (selectedTypeId === 'custom') {
      setShowCustomModal(true);
      setSelectedTypeId('');
    } else if (selectedTypeId) {
      const newUnitMix = [...unitMix];
      const existingIndex = newUnitMix.findIndex(mix => mix.houseTypeId === selectedTypeId);
      
      if (existingIndex >= 0) {
        newUnitMix[existingIndex].count = 1;
      } else {
        newUnitMix.push({ houseTypeId: selectedTypeId, count: 1 });
      }
      
      updateProject({ unitMix: newUnitMix });
      setSelectedTypeId('');
    }
  };

  const handleCustomUnitAdd = (
    unitTypeData: {
      name: string;
      category: 'house' | 'bungalow' | 'apartment';
      floorAreaSqm: number;
      floors: number;
      buildCostPerSqm: number;
      saleValuePerSqm: number;
    },
    saveToPresets: boolean
  ) => {
    const newHouseType = addCustomHouseType({
      ...unitTypeData,
      isCustom: true,
    });

    // Add to mix immediately
    const newUnitMix = [...unitMix, { houseTypeId: newHouseType.id, count: 1 }];
    updateProject({ unitMix: newUnitMix });

    // Save to presets if requested
    if (saveToPresets) {
      try {
        const existing = localStorage.getItem('eazybuild:customUnitTypes');
        const customTypes = existing ? JSON.parse(existing) : [];
        customTypes.push({ ...unitTypeData, id: crypto.randomUUID(), isCustom: true });
        localStorage.setItem('eazybuild:customUnitTypes', JSON.stringify(customTypes));
      } catch (error) {
        console.warn('Failed to save custom unit type:', error);
      }
    }
  };

  const handleUpdateCount = (houseTypeId: string, count: number) => {
    const newUnitMix = unitMix.map(mix => 
      mix.houseTypeId === houseTypeId 
        ? { ...mix, count: Math.max(0, count) }
        : mix
    ).filter(mix => mix.count > 0);

    updateProject({ unitMix: newUnitMix });
  };

  const handleRemoveType = (houseTypeId: string) => {
    const newUnitMix = unitMix.filter(mix => mix.houseTypeId !== houseTypeId);
    updateProject({ unitMix: newUnitMix });
  };

  const getHouseTypeDetails = (houseTypeId: string) => {
    return houseTypes.find(ht => ht.id === houseTypeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Unit Mix</h3>
        <div className="text-sm text-slate-300">
          Total Units: <span className="font-semibold text-brand-400">{totalUnits}</span>
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
                {type.name} - {type.floorAreaSqm}m² ({type.floors === 1 ? 'Bungalow' : 'House'})
                {type.isCustom ? ' (Custom)' : ''}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          <button
            onClick={handleAddType}
            disabled={!selectedTypeId}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {selectedTypeId === 'custom' ? 'Custom...' : 'Add'}
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
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Total Value</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800/30">
              {activeTypes.map((mix) => {
                const houseType = getHouseTypeDetails(mix.houseTypeId);
                if (!houseType) return null;
                
                const totalArea = houseType.floorAreaSqm * mix.count;
                const totalValue = totalArea * houseType.saleValuePerSqm;

                return (
                  <tr key={mix.houseTypeId} className="border-t border-slate-700">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{houseType.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-slate-400">
                        {houseType.floorAreaSqm}m² • {houseType.floors === 1 ? 'Bungalow' : 'House'}
                      </div>
                      <div className="text-sm text-slate-500">
                        £{houseType.buildCostPerSqm.toLocaleString()}/m² build • £{houseType.saleValuePerSqm.toLocaleString()}/m² sale
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={mix.count}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 0;
                          handleUpdateCount(mix.houseTypeId, count);
                        }}
                        className="w-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-4 px-4 text-center text-slate-300">
                      {totalArea.toLocaleString()}m²
                    </td>
                    <td className="py-4 px-4 text-center text-brand-400 font-medium">
                      £{totalValue.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleRemoveType(mix.houseTypeId)}
                        className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove from mix"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
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
              {activeTypes.reduce((sum, mix) => {
                const houseType = getHouseTypeDetails(mix.houseTypeId);
                return sum + (houseType ? mix.count * houseType.floorAreaSqm : 0);
              }, 0).toLocaleString()}m²
            </div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-xl">
            <div className="text-sm text-slate-400 mb-1">Estimated GDV</div>
            <div className="text-xl font-bold text-green-400">
              £{activeTypes.reduce((sum, mix) => {
                const houseType = getHouseTypeDetails(mix.houseTypeId);
                return sum + (houseType ? mix.count * houseType.floorAreaSqm * houseType.saleValuePerSqm : 0);
              }, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <CustomUnitTypeModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onAddToMix={handleCustomUnitAdd}
      />
    </div>
  );
}
