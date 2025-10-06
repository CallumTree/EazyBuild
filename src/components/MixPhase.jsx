
import React, { useState, useEffect } from 'react';
import { getProject, updateProject } from '../utils/storage';
import { estSize, estBaseSales, applyMultiplier, calcGDV } from '../utils/calculators';

const UNIT_TYPES = [
  '2-bed Semi/Terrace',
  '2-bed Detached',
  '3-bed Semi',
  '3-bed Detached',
  '4-bed Detached',
  '2-bed Bungalow',
  '3-bed Bungalow',
  'Custom'
];

export function MixPhase({ projectId, onBack, onNext }) {
  const [project, setProject] = useState(null);
  const [mixRows, setMixRows] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inputsExpanded, setInputsExpanded] = useState(true);
  const [derivedExpanded, setDerivedExpanded] = useState(false);
  const [totalsExpanded, setTotalsExpanded] = useState(true);
  const [editingRowId, setEditingRowId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const multiplier = project?.multiplier || 1.0;

  useEffect(() => {
    if (projectId) {
      const projectData = getProject(projectId);
      if (projectData) {
        setProject(projectData);

        if (projectData.unitMix && projectData.unitMix.length > 0) {
          setMixRows(projectData.unitMix);
        } else {
          setMixRows([createEmptyRow()]);
        }
      }
    }
  }, [projectId]);

  useEffect(() => {
    if (showAdvanced) {
      setDerivedExpanded(true);
    }
  }, [showAdvanced]);

  function createEmptyRow() {
    const type = '2-bed Semi/Terrace';
    const sizeM2 = estSize(type);
    const baseSales = estBaseSales(type, false);
    return {
      id: crypto.randomUUID(),
      type,
      units: 0,
      sizeM2,
      garage: false,
      baseSalesPrice: baseSales,
      salesPrice: applyMultiplier(baseSales, multiplier),
      buildCostPerM2: null
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

        if (field === 'type') {
          updated.sizeM2 = estSize(value);
          updated.baseSalesPrice = estBaseSales(value, row.garage);
          updated.salesPrice = applyMultiplier(updated.baseSalesPrice, multiplier);
          updated.buildCostPerM2 = null;
        }

        if (field === 'garage') {
          const sizeAdjust = value ? 15 : (row.garage ? -15 : 0);
          updated.sizeM2 = row.sizeM2 + sizeAdjust;
          updated.baseSalesPrice = estBaseSales(row.type, value);
          updated.salesPrice = applyMultiplier(updated.baseSalesPrice, multiplier);
        }

        return updated;
      }
      return row;
    }));
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

  const calcBuildCost = (row) => {
    if (row.buildCostPerM2 && row.buildCostPerM2 > 0) {
      return row.buildCostPerM2;
    }
    
    const buildCostMap = {
      '2-bed Semi/Terrace': 1450, '2-bed Detached': 1500, '3-bed Semi': 1500,
      '3-bed Detached': 1550, '4-bed Detached': 1600, '2-bed Bungalow': 1550,
      '3-bed Bungalow': 1600, 'Custom': 1500
    };
    return buildCostMap[row.type] || 1500;
  };

  const calcBuildCostTotal = (row) => {
    const baseBuildCostPerM2 = calcBuildCost(row);
    const garageCostPerM2 = 1200;
    let totalBuildCost = 0;
    if (row.garage) {
      const mainAreaM2 = row.sizeM2 - 15;
      const garageCost = 15 * garageCostPerM2;
      const mainCost = mainAreaM2 * baseBuildCostPerM2;
      totalBuildCost = mainCost + garageCost;
    } else {
      totalBuildCost = row.sizeM2 * baseBuildCostPerM2;
    }
    return totalBuildCost;
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

  const filteredRows = mixRows.filter(row => 
    row.type.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalUnits = mixRows.reduce((sum, row) => sum + (parseInt(row.units) || 0), 0);
  const totalGDV = calcGDV(mixRows, multiplier);
  const totalGIA = mixRows.reduce((sum, row) => sum + (row.sizeM2 * (row.units || 0)), 0);
  const totalBuildCostSum = mixRows.reduce((sum, row) => sum + (calcBuildCostTotal(row) * (row.units || 0)), 0);
  const totalProfit = totalGDV - totalBuildCostSum;
  const profitOnGDV = totalGDV > 0 ? (totalProfit / totalGDV) * 100 : 0;
  const profitOnCost = totalBuildCostSum > 0 ? (totalProfit / totalBuildCostSum) * 100 : 0;

  const siteAreaM2 = project.siteAreaM2 || 0;
  const siteAreaHa = siteAreaM2 / 10000;
  const estDensity = siteAreaHa > 0 ? (totalUnits / siteAreaHa).toFixed(1) : 0;
  const laAvgDensity = 50;
  const densityHigh = estDensity > laAvgDensity;

  const isReady = totalUnits > 0;

  const getStatusChip = () => {
    if (profitOnGDV >= 20) return { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'GREEN • Viable', icon: '🟢' };
    if (profitOnGDV >= 15) return { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', text: 'AMBER • Marginal', icon: '🟡' };
    return { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'RED • Review', icon: '🔴' };
  };

  const statusChip = getStatusChip();

  const suggestions = [
    {
      name: 'Balanced Mix',
      description: '40% semis, 30% bungalows',
      baseGdv: 5400000,
      mix: [
        { id: crypto.randomUUID(), type: '2-bed Semi/Terrace', units: 10, sizeM2: 70, garage: false, baseSalesPrice: 240000, salesPrice: applyMultiplier(240000, multiplier) },
        { id: crypto.randomUUID(), type: '3-bed Detached', units: 8, sizeM2: 125, garage: true, baseSalesPrice: 400000, salesPrice: applyMultiplier(400000, multiplier) },
        { id: crypto.randomUUID(), type: '2-bed Bungalow', units: 7, sizeM2: 60, garage: false, baseSalesPrice: 260000, salesPrice: applyMultiplier(260000, multiplier) },
      ]
    },
    {
      name: 'Family Focus',
      description: '50% 3-bed+, high value',
      baseGdv: 9440000,
      mix: [
        { id: crypto.randomUUID(), type: '3-bed Detached', units: 12, sizeM2: 125, garage: true, baseSalesPrice: 400000, salesPrice: applyMultiplier(400000, multiplier) },
        { id: crypto.randomUUID(), type: '4-bed Detached', units: 8, sizeM2: 150, garage: true, baseSalesPrice: 472000, salesPrice: applyMultiplier(472000, multiplier) },
        { id: crypto.randomUUID(), type: '2-bed Semi/Terrace', units: 5, sizeM2: 70, garage: false, baseSalesPrice: 240000, salesPrice: applyMultiplier(240000, multiplier) },
      ]
    },
    {
      name: 'Retirement Ready',
      description: '60% bungalows, accessible',
      baseGdv: 4100000,
      mix: [
        { id: crypto.randomUUID(), type: '2-bed Bungalow', units: 7, sizeM2: 60, garage: false, baseSalesPrice: 260000, salesPrice: applyMultiplier(260000, multiplier) },
        { id: crypto.randomUUID(), type: '3-bed Bungalow', units: 4, sizeM2: 95, garage: true, baseSalesPrice: 350000, salesPrice: applyMultiplier(350000, multiplier) },
        { id: crypto.randomUUID(), type: '2-bed Semi/Terrace', units: 2, sizeM2: 70, garage: false, baseSalesPrice: 240000, salesPrice: applyMultiplier(240000, multiplier) },
      ]
    }
  ];

  return (
    <div className="container py-8 pb-32">
      {/* Header */}
      <div className="card mb-6">
        <div className="card-header">
          <button onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="card-title">Unit Mix Phase</h1>
            <p className="text-slate-400 text-sm mt-1">
              {project.name} • {siteAreaM2.toLocaleString()} m²
            </p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`btn-ghost text-sm ${showAdvanced ? 'bg-slate-700' : ''}`}
            title="Toggle advanced columns"
          >
            ⚙️ {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Density Banner */}
          {totalUnits > 0 && (
            <div className={`p-4 rounded-xl border ${densityHigh ? 'bg-amber-500/10 border-amber-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
              <div className="flex items-center gap-2 text-sm">
                <span>{densityHigh ? '🟡' : '🟢'}</span>
                <strong>Estimated density:</strong> {estDensity} dph
                <span className="text-slate-400 ml-2">LA typical: {laAvgDensity} dph</span>
              </div>
            </div>
          )}

          {/* Section A: Inputs */}
          <div className="card">
            <button
              onClick={() => setInputsExpanded(!inputsExpanded)}
              className="card-header w-full text-left hover:bg-slate-700/30 transition-colors cursor-pointer"
              aria-label={inputsExpanded ? 'Collapse Inputs' : 'Expand Inputs'}
            >
              <span className="text-2xl">📝</span>
              <h2 className="card-title">Inputs</h2>
              <span className="ml-auto text-slate-400">{inputsExpanded ? '▼' : '▶'}</span>
            </button>

            {inputsExpanded && (
              <div className="card-body space-y-4">
                {/* Controls */}
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Search unit types..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="input-field input-field-sm flex-1"
                  />
                  <button
                    onClick={handleAddRow}
                    disabled={mixRows.length >= 10}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Row
                  </button>
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="btn-ghost"
                    title="AI Mix Suggestions"
                  >
                    💡
                  </button>
                </div>

                {/* Table */}
                {filteredRows.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No unit types added yet. Click "Add Row" or "💡" for suggestions.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700/50 sticky top-0 z-10">
                        <tr>
                          <th className="text-left py-3 px-3 text-slate-300 font-medium" title="Type: Unit type">Type</th>
                          <th className="text-right py-3 px-3 text-slate-300 font-medium" title="Units: Number of units">Units</th>
                          <th className="text-right py-3 px-3 text-slate-300 font-medium" title="Size (m²): Floor area">Size (m²)</th>
                          {showAdvanced && (
                            <th className="text-right py-3 px-3 text-slate-300 font-medium" title="Size (ft²): Floor area in square feet">Size (ft²)</th>
                          )}
                          <th className="text-right py-3 px-3 text-slate-300 font-medium" title="Sales £/unit: Market sale price per dwelling">Sales £/unit</th>
                          {showAdvanced && (
                            <th className="text-right py-3 px-3 text-slate-300 font-medium" title="Build Cost/m²: Construction cost per square meter">Build £/m²</th>
                          )}
                          <th className="text-center py-3 px-3 text-slate-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-800/30">
                        {filteredRows.map((row, idx) => (
                          <tr key={row.id} className={`border-t border-slate-700 hover:bg-slate-700/20 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/10' : ''}`}>
                            <td className="py-4 px-3">
                              <select
                                value={row.type}
                                onChange={(e) => handleRowChange(row.id, 'type', e.target.value)}
                                className="input-field input-field-sm w-full font-medium"
                              >
                                {UNIT_TYPES.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                              {row.garage && <div className="text-xs text-slate-500 mt-1">+ Garage (15m²)</div>}
                            </td>
                            <td className="py-4 px-3 text-right">
                              <input
                                type="number"
                                value={row.units}
                                onChange={(e) => handleRowChange(row.id, 'units', parseInt(e.target.value) || 0)}
                                className="input-field input-field-sm w-20 text-right font-mono font-semibold ml-auto"
                                min="0"
                              />
                            </td>
                            <td className="py-4 px-3 text-right">
                              <input
                                type="number"
                                value={row.sizeM2}
                                onChange={(e) => handleRowChange(row.id, 'sizeM2', parseInt(e.target.value) || 0)}
                                className="input-field input-field-sm w-24 text-right font-mono ml-auto"
                                min="0"
                              />
                            </td>
                            {showAdvanced && (
                              <td className="py-4 px-3 text-right">
                                <span className="font-mono text-slate-400">{Math.round(row.sizeM2 * 10.764)}</span>
                              </td>
                            )}
                            <td className="py-4 px-3 text-right">
                              <input
                                type="number"
                                value={row.salesPrice}
                                onChange={(e) => handleRowChange(row.id, 'salesPrice', parseInt(e.target.value) || 0)}
                                className="input-field input-field-sm w-32 text-right font-mono ml-auto"
                                min="0"
                                step="1000"
                              />
                            </td>
                            {showAdvanced && (
                              <td className="py-4 px-3 text-right">
                                <input
                                  type="number"
                                  value={row.buildCostPerM2 || calcBuildCost(row)}
                                  onChange={(e) => handleRowChange(row.id, 'buildCostPerM2', parseFloat(e.target.value) || null)}
                                  className="input-field input-field-sm w-24 text-right font-mono ml-auto"
                                  placeholder={calcBuildCost(row).toString()}
                                />
                              </td>
                            )}
                            <td className="py-4 px-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleRowChange(row.id, 'garage', !row.garage)}
                                  className={`text-sm ${row.garage ? 'text-blue-400 hover:text-blue-300' : 'text-slate-400 hover:text-slate-300'}`}
                                  title={row.garage ? 'Remove garage' : 'Add garage (+15m²)'}
                                >
                                  🚗
                                </button>
                                <button
                                  onClick={() => setEditingRowId(row.id)}
                                  className="text-slate-400 hover:text-slate-300 text-sm"
                                  title="Edit row"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleRemoveRow(row.id)}
                                  disabled={mixRows.length === 1}
                                  className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Delete row"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section B: Derived */}
          <div className="card">
            <button
              onClick={() => setDerivedExpanded(!derivedExpanded)}
              className="card-header w-full text-left hover:bg-slate-700/30 transition-colors cursor-pointer"
              aria-label={derivedExpanded ? 'Collapse Derived' : 'Expand Derived'}
            >
              <span className="text-2xl">📊</span>
              <h2 className="card-title">Derived</h2>
              <span className="ml-auto text-slate-400">{derivedExpanded ? '▼' : '▶'}</span>
            </button>

            {derivedExpanded && (
              <div className="card-body">
                {totalUnits === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    Populate Units to calculate.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700/50 sticky top-0 z-10">
                        <tr>
                          <th className="text-left py-3 px-3 text-slate-300 font-medium">Type</th>
                          <th className="text-right py-3 px-3 text-slate-300 font-medium">GIA (m²)</th>
                          <th className="text-right py-3 px-3 text-slate-300 font-medium">GDV</th>
                          <th className="text-right py-3 px-3 text-slate-300 font-medium">Build Cost</th>
                          <th className="text-right py-3 px-3 text-slate-300 font-medium">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-800/30">
                        {mixRows.filter(r => r.units > 0).map((row, idx) => {
                          const gia = row.sizeM2 * row.units;
                          const gdv = row.salesPrice * row.units;
                          const buildCost = calcBuildCostTotal(row) * row.units;
                          const profit = gdv - buildCost;
                          return (
                            <tr key={row.id} className={`border-t border-slate-700 ${idx % 2 === 0 ? 'bg-slate-800/10' : ''}`}>
                              <td className="py-4 px-3">{row.type} {row.garage && '+ Garage'}</td>
                              <td className="py-4 px-3 text-right font-mono">{gia.toLocaleString()}</td>
                              <td className="py-4 px-3 text-right font-mono text-brand-400">£{gdv.toLocaleString()}</td>
                              <td className="py-4 px-3 text-right font-mono text-amber-400">£{buildCost.toLocaleString()}</td>
                              <td className={`py-4 px-3 text-right font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                £{profit.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section C: Totals */}
          <div className="card">
            <button
              onClick={() => setTotalsExpanded(!totalsExpanded)}
              className="card-header w-full text-left hover:bg-slate-700/30 transition-colors cursor-pointer"
              aria-label={totalsExpanded ? 'Collapse Totals' : 'Expand Totals'}
            >
              <span className="text-2xl">💰</span>
              <h2 className="card-title">Totals</h2>
              <span className="ml-auto text-slate-400">{totalsExpanded ? '▼' : '▶'}</span>
            </button>

            {totalsExpanded && (
              <div className="card-body">
                {totalUnits === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    Populate Units to calculate.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Total Units</div>
                        <div className="text-2xl font-bold font-mono text-white">{totalUnits}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Total GIA</div>
                        <div className="text-2xl font-bold font-mono text-white">{totalGIA.toLocaleString()} m²</div>
                        <div className="text-xs text-slate-500">{Math.round(totalGIA * 10.764).toLocaleString()} ft²</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Total GDV</div>
                        <div className="text-2xl font-bold font-mono text-brand-400">£{totalGDV.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Total Build Cost</div>
                        <div className="text-2xl font-bold font-mono text-amber-400">£{totalBuildCostSum.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Profit</div>
                      <div className={`text-3xl font-bold font-mono ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        £{totalProfit.toLocaleString()}
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-slate-400">PoGDV:</span>
                          <span className="ml-2 font-mono font-semibold">{profitOnGDV.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">PoC:</span>
                          <span className="ml-2 font-mono font-semibold">{profitOnCost.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                      <div className="text-xs text-slate-400 mb-2">Residual Land Value</div>
                      <div className="text-xl font-bold font-mono text-purple-400">
                        {totalProfit > 0 ? `£${totalProfit.toLocaleString()}` : '—'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {totalProfit > 0 ? 'Max land value (profit target not set)' : 'Will populate when profit target is set'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="card">
              <div className="card-header">
                <span className="text-2xl">💡</span>
                <h3 className="card-title">Suggested Mixes</h3>
                <button onClick={() => setShowSuggestions(false)} className="ml-auto text-slate-400 hover:text-slate-300">✕</button>
              </div>
              <div className="card-body space-y-3">
                {suggestions.map((suggestion, idx) => {
                  const adjustedGDV = calcGDV(suggestion.mix, multiplier);
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-700/30 rounded-xl border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
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
                          <p className="font-semibold text-brand-400 font-mono">£{(adjustedGDV / 1000000).toFixed(1)}m</p>
                          <p className="text-xs text-slate-500">GDV</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary Panel (Fixed on desktop) */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            <div className="card">
              <div className="card-header">
                <span className="text-2xl">📈</span>
                <h3 className="card-title">Summary</h3>
              </div>
              <div className="card-body space-y-4">
                {totalUnits === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Add units to see summary
                  </div>
                ) : (
                  <>
                    <div className={`p-3 rounded-xl border ${statusChip.color}`}>
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{statusChip.icon}</span>
                        <span>{statusChip.text}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400 text-sm">GDV</span>
                        <span className="font-bold font-mono text-brand-400">£{(totalGDV / 1000000).toFixed(2)}m</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400 text-sm">Total Costs</span>
                        <span className="font-bold font-mono text-amber-400">£{(totalBuildCostSum / 1000000).toFixed(2)}m</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400 text-sm">Profit</span>
                        <span className={`font-bold font-mono ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          £{(totalProfit / 1000000).toFixed(2)}m
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400 text-sm">PoGDV %</span>
                        <span className="font-bold font-mono text-white">{profitOnGDV.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">PoC %</span>
                        <span className="font-bold font-mono text-white">{profitOnCost.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700">
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>• Profit target: 20% PoGDV</p>
                        <p>• Land cost: Unknown → residual mode</p>
                        <p>• Regional uplift: {((multiplier - 1) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row Edit Modal */}
      {editingRowId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingRowId(null)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <span className="text-2xl">✏️</span>
              <h3 className="card-title">Edit Unit</h3>
              <button onClick={() => setEditingRowId(null)} className="ml-auto text-slate-400 hover:text-slate-300">✕</button>
            </div>
            <div className="card-body space-y-4">
              {mixRows.filter(r => r.id === editingRowId).map(row => (
                <div key={row.id} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Type</label>
                    <select
                      value={row.type}
                      onChange={(e) => handleRowChange(row.id, 'type', e.target.value)}
                      className="input-field w-full"
                    >
                      {UNIT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Units</label>
                      <input
                        type="number"
                        value={row.units}
                        onChange={(e) => handleRowChange(row.id, 'units', parseInt(e.target.value) || 0)}
                        className="input-field w-full"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Size (m²)</label>
                      <input
                        type="number"
                        value={row.sizeM2}
                        onChange={(e) => handleRowChange(row.id, 'sizeM2', parseInt(e.target.value) || 0)}
                        className="input-field w-full"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Sales £/unit</label>
                    <input
                      type="number"
                      value={row.salesPrice}
                      onChange={(e) => handleRowChange(row.id, 'salesPrice', parseInt(e.target.value) || 0)}
                      className="input-field w-full"
                      min="0"
                      step="1000"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/30 p-3 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={row.garage}
                      onChange={(e) => handleRowChange(row.id, 'garage', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-brand-500"
                    />
                    <span className="text-sm text-slate-300">Include Garage (+15m² / +£20k)</span>
                  </label>
                  <button
                    onClick={() => setEditingRowId(null)}
                    className="btn-primary w-full"
                  >
                    Done
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      </div>
  );
}
