
import React, { useState, useEffect } from 'react';
import { getProject, updateProject } from '../utils/storage';
import { estSales, adjustGarage, getDefaultSize } from '../utils/calculators';

const UNIT_TYPES = [
  '2-bed Semi/Terrace',
  '3-bed Semi/Detached',
  '4-bed Detached',
  '2-bed Bungalow',
  '3-bed Bungalow',
  'Custom/Other'
];

const PRESETS = {
  'Starter Suburb': [
    { type: '2-bed Semi/Terrace', units: 6, sizeM2: 70, garage: false },
    { type: '3-bed Semi/Detached', units: 5, sizeM2: 90, garage: true },
    { type: '2-bed Bungalow', units: 3, sizeM2: 85, garage: false },
  ],
  'Family Mix': [
    { type: '3-bed Semi/Detached', units: 7, sizeM2: 90, garage: true },
    { type: '4-bed Detached', units: 4, sizeM2: 120, garage: true },
    { type: '2-bed Bungalow', units: 2, sizeM2: 85, garage: false },
  ],
  'Balanced': [
    { type: '2-bed Semi/Terrace', units: 5, sizeM2: 70, garage: false },
    { type: '3-bed Semi/Detached', units: 6, sizeM2: 90, garage: true },
    { type: '3-bed Bungalow', units: 3, sizeM2: 110, garage: false },
  ]
};

export function MixPhase({ projectId, onBack, onNext }) {
  const [project, setProject] = useState(null);
  const [mixRows, setMixRows] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (projectId) {
      const projectData = getProject(projectId);
      if (projectData) {
        setProject(projectData);
        
        // Load existing mix if available
        if (projectData.unitMix && projectData.unitMix.length > 0) {
          setMixRows(projectData.unitMix);
        } else {
          // Start with one empty row
          setMixRows([createEmptyRow()]);
        }
      }
    }
  }, [projectId]);

  function createEmptyRow() {
    return {
      id: crypto.randomUUID(),
      type: '2-bed Semi/Terrace',
      units: 0,
      sizeM2: 70,
      garage: false,
      salesPrice: 250000
    };
  }

  const handleAddRow = () => {
    if (mixRows.length < 10) {
      setMixRows([...mixRows, createEmptyRow()]);
    }
  };

  const handleRemoveRow = (id) => {
    if (mixRows.length > 1) {
      setMixRows(mixRows.filter(row => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    setMixRows(mixRows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        
        // Update defaults when type changes
        if (field === 'type') {
          updated.sizeM2 = getDefaultSize(value);
          updated.salesPrice = estSales(value);
        }
        
        // Adjust for garage
        if (field === 'garage') {
          updated.sizeM2 = adjustGarage(row.sizeM2, value, row.garage);
          updated.salesPrice = estSales(row.type, value);
        }
        
        return updated;
      }
      return row;
    }));
  };

  const handleLoadPreset = (presetName) => {
    const preset = PRESETS[presetName];
    if (preset) {
      const loaded = preset.map(p => ({
        ...p,
        id: crypto.randomUUID(),
        salesPrice: estSales(p.type, p.garage)
      }));
      setMixRows(loaded);
    }
  };

  const handleLoadSuggestion = (suggestion) => {
    setMixRows(suggestion.mix);
    setShowSuggestions(false);
  };

  const handleNext = () => {
    if (totalUnits === 0) {
      alert('Please add at least one unit to the mix');
      return;
    }

    try {
      updateProject(projectId, {
        unitMix: mixRows
      });
      
      alert('Unit mix saved!');
      onNext();
    } catch (error) {
      alert('Error saving: ' + error.message);
    }
  };

  if (!project) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body">
            <p className="text-slate-300">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalUnits = mixRows.reduce((sum, row) => sum + (parseInt(row.units) || 0), 0);
  const totalGDV = mixRows.reduce((sum, row) => 
    sum + ((parseInt(row.units) || 0) * (parseFloat(row.salesPrice) || 0)), 0
  );
  
  const siteAreaM2 = project.siteAreaM2 || 0;
  const siteAreaHa = siteAreaM2 / 10000;
  const estDensity = siteAreaHa > 0 ? (totalUnits / siteAreaHa).toFixed(1) : 0;
  const laAvgDensity = 50;
  const densityHigh = estDensity > laAvgDensity;

  const isReady = totalUnits > 0;

  // Mock suggestions
  const suggestions = [
    {
      name: 'Balanced Mix',
      description: '40% semis, 30% bungalows',
      gdv: '£5.2m',
      mix: [
        { id: crypto.randomUUID(), type: '2-bed Semi/Terrace', units: 6, sizeM2: 70, garage: false, salesPrice: 250000 },
        { id: crypto.randomUUID(), type: '3-bed Semi/Detached', units: 4, sizeM2: 90, garage: true, salesPrice: 310000 },
        { id: crypto.randomUUID(), type: '2-bed Bungalow', units: 3, sizeM2: 85, garage: false, salesPrice: 270000 },
      ]
    },
    {
      name: 'Family Focus',
      description: '50% 3-bed+, high value',
      gdv: '£6.8m',
      mix: [
        { id: crypto.randomUUID(), type: '3-bed Semi/Detached', units: 7, sizeM2: 90, garage: true, salesPrice: 310000 },
        { id: crypto.randomUUID(), type: '4-bed Detached', units: 5, sizeM2: 120, garage: true, salesPrice: 420000 },
        { id: crypto.randomUUID(), type: '2-bed Semi/Terrace', units: 3, sizeM2: 70, garage: false, salesPrice: 250000 },
      ]
    },
    {
      name: 'Retirement Ready',
      description: '60% bungalows, accessible',
      gdv: '£4.9m',
      mix: [
        { id: crypto.randomUUID(), type: '2-bed Bungalow', units: 7, sizeM2: 85, garage: false, salesPrice: 270000 },
        { id: crypto.randomUUID(), type: '3-bed Bungalow', units: 4, sizeM2: 110, garage: true, salesPrice: 385000 },
        { id: crypto.randomUUID(), type: '2-bed Semi/Terrace', units: 2, sizeM2: 70, garage: false, salesPrice: 250000 },
      ]
    }
  ];

  return (
    <div className="container py-8 pb-32">
      <div className="card">
        <div className="card-header">
          <button onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="card-title">Mix Phase: Optimal Unit Mix</h1>
            <p className="text-slate-400 text-sm mt-1">
              {project.name} • Site: {siteAreaM2.toLocaleString()} m²
            </p>
          </div>
        </div>
        
        <div className="card-body space-y-6">
          {/* Presets */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-slate-300 self-center">Quick Presets:</span>
            {Object.keys(PRESETS).map(preset => (
              <button
                key={preset}
                onClick={() => handleLoadPreset(preset)}
                className="btn-ghost text-sm"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Mobile: Card Stack - Desktop: Table */}
          <div className="space-y-3">
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left py-3 px-3 text-slate-300 w-[40%]">Type</th>
                    <th className="text-center py-3 px-3 text-slate-300">Units</th>
                    <th className="text-left py-3 px-3 text-slate-300">Details</th>
                    <th className="text-right py-3 px-3 text-slate-300 w-[20%]">Sales £/unit</th>
                    <th className="text-center py-3 px-3 text-slate-300 w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30">
                  {mixRows.map(row => {
                    const displayType = row.garage ? `${row.type} (w/ Garage)` : row.type;
                    return (
                      <tr key={row.id} className="border-t border-slate-700">
                        <td className="py-2 px-3 w-[40%]">
                          <select
                            value={row.type}
                            onChange={(e) => handleRowChange(row.id, 'type', e.target.value)}
                            className="input-field input-field-sm w-full text-xs"
                          >
                            {UNIT_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <div className="text-xs text-slate-400 mt-1" title={displayType}>
                            {displayType}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={row.units}
                            onChange={(e) => handleRowChange(row.id, 'units', parseInt(e.target.value) || 0)}
                            className="input-field input-field-sm w-20 text-center"
                            min="0"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={row.sizeM2}
                              onChange={(e) => handleRowChange(row.id, 'sizeM2', parseInt(e.target.value) || 0)}
                              className="input-field input-field-sm w-20"
                              min="0"
                            />
                            <span className="text-xs text-slate-400">m²</span>
                            <label className="flex items-center gap-1 text-xs text-slate-400 ml-2">
                              <input
                                type="checkbox"
                                checked={row.garage}
                                onChange={(e) => handleRowChange(row.id, 'garage', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-brand-500"
                              />
                              Garage
                            </label>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-brand-400 font-medium">
                          £{(row.salesPrice || 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleRemoveRow(row.id)}
                            disabled={mixRows.length === 1}
                            className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-slate-600 bg-slate-700/30 font-semibold">
                    <td className="py-3 px-3 text-white">Total</td>
                    <td className="py-3 px-3 text-center text-brand-400">{totalUnits}</td>
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-3 text-right text-brand-400">£{totalGDV.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile: Card Stack (hidden on desktop) */}
            <div className="md:hidden space-y-3">
              {mixRows.map(row => {
                const displayType = row.garage ? `${row.type} (w/ Garage)` : row.type;
                return (
                  <div key={row.id} className="card bg-slate-800/50 border-slate-600">
                    <div className="card-body p-4 space-y-3">
                      {/* Type Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <select
                            value={row.type}
                            onChange={(e) => handleRowChange(row.id, 'type', e.target.value)}
                            className="input-field input-field-sm w-full mb-2"
                          >
                            {UNIT_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <div className="font-semibold text-white text-sm">
                            {displayType}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveRow(row.id)}
                          disabled={mixRows.length === 1}
                          className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Inputs */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Units</label>
                          <input
                            type="number"
                            value={row.units}
                            onChange={(e) => handleRowChange(row.id, 'units', parseInt(e.target.value) || 0)}
                            className="input-field input-field-sm w-full"
                            min="0"
                          />
                        </div>

                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="text-xs text-slate-400 mb-1 block">Size (m²)</label>
                            <input
                              type="number"
                              value={row.sizeM2}
                              onChange={(e) => handleRowChange(row.id, 'sizeM2', parseInt(e.target.value) || 0)}
                              className="input-field input-field-sm w-full"
                              min="0"
                            />
                          </div>
                          <label className="flex items-center gap-2 pb-2">
                            <input
                              type="checkbox"
                              checked={row.garage}
                              onChange={(e) => handleRowChange(row.id, 'garage', e.target.checked)}
                              className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-brand-500"
                            />
                            <span className="text-xs text-slate-300">Garage<br/>(+15m²/£5k)</span>
                          </label>
                        </div>

                        <div className="pt-2 border-t border-slate-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Sales Price</span>
                            <span className="text-lg font-semibold text-brand-400">
                              £{(row.salesPrice || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Mobile Total Card */}
              <div className="card bg-slate-700/50 border-slate-500">
                <div className="card-body p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400">Total Units</div>
                      <div className="text-xl font-bold text-brand-400">{totalUnits}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total GDV</div>
                      <div className="text-xl font-bold text-brand-400">£{totalGDV.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Density Check */}
          <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className={densityHigh ? 'text-amber-400' : 'text-green-400'}>
                  {densityHigh ? '🟡' : '🟢'}
                </span>
                <strong>Est. Density:</strong> {estDensity} units/ha
              </div>
              {densityHigh && (
                <p className="text-slate-500 text-xs">
                  Tip: Swap to bungalows for balance?
                </p>
              )}
            </div>
          </div>

          {/* Suggestions Modal */}
          {showSuggestions && (
            <div className="space-y-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600">
              <h3 className="font-semibold text-white">Suggested Mixes:</h3>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                  onClick={() => {
                    if (confirm(`Load "${suggestion.name}"? This will replace your current mix.`)) {
                      handleLoadSuggestion(suggestion);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">{suggestion.name}</h4>
                      <p className="text-sm text-slate-400">{suggestion.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-brand-400">{suggestion.gdv}</p>
                      <p className="text-xs text-slate-500">GDV</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowSuggestions(false)}
                className="btn-ghost text-sm w-full"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={handleAddRow}
        disabled={mixRows.length >= 10}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ zIndex: 40 }}
      >
        +
      </button>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-4" style={{ zIndex: 50 }}>
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleNext}
              disabled={!isReady}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Viability
            </button>
            <div className={`text-xs ${isReady ? 'text-green-400' : 'text-red-400'}`}>
              {isReady ? '🟢 Ready' : '🔴 Add units'}
            </div>
          </div>
          
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="btn-ghost text-xs px-3 py-2"
            title="AI Ideas"
          >
            💡
          </button>
        </div>
      </div>
    </div>
  );
}
