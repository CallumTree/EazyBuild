
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
  const laAvgDensity = 50; // Mock LA average
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
    <div className="container py-8">
      <div className="card">
        <div className="card-header">
          <button onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="card-title">Mix Phase: Optimal Unit Mix</h1>
            <p className="text-slate-400 text-sm mt-1">
              {project.name} • Site: {siteAreaM2.toLocaleString()} m² | {project.densityHint || 'Avg density 50/ha'}
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

          {/* Unit Mix Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-3 text-slate-300">Type</th>
                  <th className="text-center py-3 px-3 text-slate-300">Units</th>
                  <th className="text-center py-3 px-3 text-slate-300">Size (m²)</th>
                  <th className="text-center py-3 px-3 text-slate-300">Garage?</th>
                  <th className="text-right py-3 px-3 text-slate-300">Sales £/unit</th>
                  <th className="text-center py-3 px-3 text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/30">
                {mixRows.map(row => (
                  <tr key={row.id} className="border-t border-slate-700">
                    <td className="py-2 px-3">
                      <select
                        value={row.type}
                        onChange={(e) => handleRowChange(row.id, 'type', e.target.value)}
                        className="input-field input-field-sm w-full"
                      >
                        {UNIT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
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
                      <input
                        type="number"
                        value={row.sizeM2}
                        onChange={(e) => handleRowChange(row.id, 'sizeM2', parseInt(e.target.value) || 0)}
                        className="input-field input-field-sm w-20 text-center"
                        min="0"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.garage}
                        onChange={(e) => handleRowChange(row.id, 'garage', e.target.checked)}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-brand-500 focus:ring-brand-500"
                      />
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
                ))}
                <tr className="border-t-2 border-slate-600 bg-slate-700/30 font-semibold">
                  <td className="py-3 px-3 text-white">Total</td>
                  <td className="py-3 px-3 text-center text-brand-400">{totalUnits}</td>
                  <td colSpan="2" className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-right text-brand-400">£{totalGDV.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <button
            onClick={handleAddRow}
            disabled={mixRows.length >= 10}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Row
          </button>

          {/* Density Check */}
          <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
            <div className="text-sm space-y-2">
              <p>
                <strong>Est. Density:</strong> {estDensity} units/ha
              </p>
              {densityHigh && (
                <p className="text-amber-400">
                  ⚠️ High—consider adding bungalows for balance
                </p>
              )}
            </div>
          </div>

          {/* Suggest Mix Button */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="btn-primary"
          >
            💡 Suggest Mix
          </button>

          {/* Suggestions Modal */}
          {showSuggestions && (
            <div className="space-y-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600">
              <h3 className="font-semibold text-white">Suggested Mixes:</h3>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                  onClick={() => handleLoadSuggestion(suggestion)}
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

          {/* Footer */}
          <div className="card bg-slate-700/30 border-slate-600">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className={`btn-ghost text-sm ${isReady ? 'text-green-400' : 'text-red-400'}`}>
                  {isReady ? '🟢 Ready—Proceed to Viability' : '🔴 Add units first'}
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!isReady}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Viability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
