
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, LayoutGrid, PoundSterling, FileText } from "lucide-react";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { MapCanvas } from "./components/MapCanvas";
import { StoreProvider, useStore } from "./store";
import { Toast, useToast } from "./components/Toast";
import { NumberInput } from "./components/NumberInput";
import { computeTotals, formatCurrency } from "./finance";
import "./index.css";

function SurveyPage() {
  const { project, updateProject } = useStore();
  const { toast, showToast, hideToast } = useToast();
  
  const handleSave = () => {
    if (!project.name.trim()) {
      showToast('Project name is required', 'error');
      return;
    }
    
    if (!project.boundary || project.boundary.length < 3) {
      showToast('Please draw a site boundary on the map', 'error');
      return;
    }
    
    showToast('Project saved successfully', 'success');
  };

  return (
    <>
      <div className="container py-8 space-y-8">
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">🗺️</span>
            <h2 className="card-title">Survey & GPS Walk</h2>
          </div>
          <div className="card-body space-y-6">
            <p className="text-slate-300 leading-relaxed">
              Interactive map goes here. Walk the site perimeter to auto-draw boundary and mark obstacles.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Project name</label>
                <input 
                  className="input" 
                  placeholder="Enter project name"
                  value={project.name}
                  onChange={(e) => updateProject({ name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Site efficiency (%)</label>
                <NumberInput 
                  className="input" 
                  value={project.efficiency || 65}
                  onChange={(value) => updateProject({ efficiency: parseFloat(value) || 65 })}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn flex-1 sm:flex-none" onClick={handleSave}>
                <span>💾</span>
                Save & Continue
              </button>
              <a href="/layout" className="btn-ghost flex-1 sm:flex-none text-center">
                Go to Layout
              </a>
            </div>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} />
    </>
  );
}

function LayoutPage() {
  const { project, updateProject, houseTypes, addHouseType, addToProjectMix, updateProjectMixCount, removeFromProjectMix } = useStore();
  const { toast, showToast, hideToast } = useToast();
  const [showDefaults, setShowDefaults] = useState(true);
  const [showMyLibrary, setShowMyLibrary] = useState(true);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newHouseType, setNewHouseType] = useState({
    name: '',
    beds: '3',
    floorAreaSqm: '120',
    buildCostPerSqm: '1650',
    saleValuePerSqm: '3200',
  });

  const defaultTypes = houseTypes.filter(ht => ht.isDefault);
  const userTypes = houseTypes.filter(ht => !ht.isDefault);
  const projectMix = project.unitMix || [];

  const handleAddCustomType = () => {
    if (!newHouseType.name.trim()) return;
    addHouseType({ 
      ...newHouseType, 
      beds: parseInt(newHouseType.beds) || 3,
      floorAreaSqm: parseFloat(newHouseType.floorAreaSqm) || 120,
      buildCostPerSqm: parseFloat(newHouseType.buildCostPerSqm) || 1650,
      saleValuePerSqm: parseFloat(newHouseType.saleValuePerSqm) || 3200,
      isDefault: false 
    });
    setNewHouseType({
      name: '',
      beds: '3',
      floorAreaSqm: '120',
      buildCostPerSqm: '1650',
      saleValuePerSqm: '3200',
    });
    setShowAddCustom(false);
    showToast('House type added to your library', 'success');
  };

  const handleCountChange = (houseTypeId: string, value: string) => {
    const count = parseInt(value) || 0;
    if (count <= 0) {
      removeFromProjectMix(houseTypeId);
    } else {
      updateProjectMixCount(houseTypeId, count);
    }
    showToast('Autosaved', 'success');
  };

  const getTotalUnits = () => {
    return projectMix.reduce((total, mix) => total + mix.count, 0);
  };

  return (
    <>
      <div className="container py-8 space-y-8">
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">🏠</span>
            <h2 className="card-title">Unit Mix & Layout</h2>
          </div>
          <div className="card-body space-y-8">
            
            {/* Current Project Mix */}
            {projectMix.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Current Project Mix ({getTotalUnits()} units)</h3>
                <div className="space-y-3">
                  {projectMix.map(mix => {
                    const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
                    if (!houseType) return null;
                    return (
                      <div key={mix.houseTypeId} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                        <div>
                          <div className="font-medium">{houseType.name}</div>
                          <div className="text-sm text-slate-400">
                            {houseType.beds} beds • {houseType.floorAreaSqm}m² • £{houseType.saleValuePerSqm}/m²
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <NumberInput 
                            className="input w-20" 
                            value={mix.count}
                            onChange={(value) => handleCountChange(mix.houseTypeId, value)}
                          />
                          <button 
                            onClick={() => removeFromProjectMix(mix.houseTypeId)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Default House Types */}
            <div>
              <button 
                onClick={() => setShowDefaults(!showDefaults)}
                className="flex items-center gap-2 font-semibold text-lg mb-4 hover:text-emerald-400 transition"
              >
                <span>{showDefaults ? '▼' : '▶'}</span>
                Default House Types
              </button>
              {showDefaults && (
                <div className="grid md:grid-cols-2 gap-4">
                  {defaultTypes.map(houseType => (
                    <div key={houseType.id} className="p-4 bg-slate-700/20 rounded-xl">
                      <div className="font-medium mb-2">{houseType.name}</div>
                      <div className="text-sm text-slate-300 mb-3">
                        {houseType.beds} beds • {houseType.floorAreaSqm}m² • Build: £{houseType.buildCostPerSqm}/m² • Sale: £{houseType.saleValuePerSqm}/m²
                      </div>
                      <button 
                        onClick={() => addToProjectMix(houseType.id)}
                        className="btn-ghost text-sm w-full"
                      >
                        ➕ Add to Project
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Library */}
            <div>
              <button 
                onClick={() => setShowMyLibrary(!showMyLibrary)}
                className="flex items-center gap-2 font-semibold text-lg mb-4 hover:text-emerald-400 transition"
              >
                <span>{showMyLibrary ? '▼' : '▶'}</span>
                My Library ({userTypes.length})
              </button>
              {showMyLibrary && (
                <div className="space-y-4">
                  {userTypes.length === 0 ? (
                    <p className="text-slate-400">No custom house types yet. Create your first one below.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {userTypes.map(houseType => (
                        <div key={houseType.id} className="p-4 bg-slate-700/20 rounded-xl">
                          <div className="font-medium mb-2">{houseType.name}</div>
                          <div className="text-sm text-slate-300 mb-3">
                            {houseType.beds} beds • {houseType.floorAreaSqm}m² • Build: £{houseType.buildCostPerSqm}/m² • Sale: £{houseType.saleValuePerSqm}/m²
                          </div>
                          <button 
                            onClick={() => addToProjectMix(houseType.id)}
                            className="btn-ghost text-sm w-full"
                          >
                            ➕ Add to Project
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Custom Type */}
                  {!showAddCustom ? (
                    <button 
                      onClick={() => setShowAddCustom(true)}
                      className="btn w-full"
                    >
                      ➕ Create New House Type
                    </button>
                  ) : (
                    <div className="p-4 bg-slate-700/30 rounded-xl">
                      <h4 className="font-medium mb-4">Create New House Type</h4>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="label">Name/Model</label>
                          <input 
                            className="input" 
                            value={newHouseType.name}
                            onChange={(e) => setNewHouseType(prev => ({...prev, name: e.target.value}))}
                            placeholder="e.g., Custom 4-bed"
                          />
                        </div>
                        <div>
                          <label className="label">Bedrooms</label>
                          <NumberInput 
                            className="input" 
                            value={newHouseType.beds}
                            onChange={(value) => setNewHouseType(prev => ({...prev, beds: value}))}
                          />
                        </div>
                        <div>
                          <label className="label">Floor area (m²)</label>
                          <NumberInput 
                            className="input" 
                            value={newHouseType.floorAreaSqm}
                            onChange={(value) => setNewHouseType(prev => ({...prev, floorAreaSqm: value}))}
                          />
                        </div>
                        <div>
                          <label className="label">Build cost £/m²</label>
                          <NumberInput 
                            className="input" 
                            value={newHouseType.buildCostPerSqm}
                            onChange={(value) => setNewHouseType(prev => ({...prev, buildCostPerSqm: value}))}
                          />
                        </div>
                        <div>
                          <label className="label">Sale value £/m²</label>
                          <NumberInput 
                            className="input" 
                            value={newHouseType.saleValuePerSqm}
                            onChange={(value) => setNewHouseType(prev => ({...prev, saleValuePerSqm: value}))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleAddCustomType} className="btn flex-1">
                          💾 Save to Library
                        </button>
                        <button 
                          onClick={() => setShowAddCustom(false)} 
                          className="btn-ghost flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} duration={1000} />
    </>
  );
}

function ModernFinancePage() {
  const { project, updateProject, duplicateScenario, houseTypes } = useStore();
  const { toast, showToast, hideToast } = useToast();
  
  const finance = project.finance || {
    feesPct: '5',
    contPct: '10',
    financeRatePct: '8.5',
    financeMonths: '18',
    targetProfitPct: '20',
    landAcqCosts: '25000',
  };
  
  const results = computeTotals(project, finance, houseTypes);
  
  const updateFinance = (field: keyof typeof finance, value: string) => {
    updateProject({
      finance: { ...finance, [field]: value }
    });
  };
  
  const handleDuplicate = () => {
    duplicateScenario();
    showToast('Scenario duplicated', 'success');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Viable': return 'bg-green-500';
      case 'At Risk': return 'bg-amber-500';
      case 'Unviable': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };
  
  const getKPIColor = (isPositive: boolean) => {
    return isPositive ? 'text-green-400' : 'text-red-400';
  };

  const targetProfitNum = parseFloat(finance.targetProfitPct) || 20;
  const isViableProfit = results.actualProfitPct >= targetProfitNum && results.residual >= 0;

  return (
    <>
      <div className="container py-8 space-y-8">
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">💰</span>
            <div className="flex-1">
              <h2 className="card-title">Finance & Appraisal</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(results.status)}`}>
                {results.status}
              </span>
              <button onClick={handleDuplicate} className="btn-ghost text-sm">
                📋 Duplicate Scenario
              </button>
            </div>
          </div>
          <div className="card-body space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="label">Build cost £/m²</label>
                <NumberInput 
                  className="input" 
                  value={project.buildCostPerSqm || 1650}
                  onChange={(value) => updateProject({ buildCostPerSqm: parseFloat(value) || 1650 })}
                />
              </div>
              <div>
                <label className="label">Fees %</label>
                <NumberInput 
                  className="input" 
                  value={finance.feesPct}
                  onChange={(value) => updateFinance('feesPct', value)}
                />
              </div>
              <div>
                <label className="label">Contingency %</label>
                <NumberInput 
                  className="input" 
                  value={finance.contPct}
                  onChange={(value) => updateFinance('contPct', value)}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="label">Land acquisition costs (£)</label>
                <NumberInput 
                  className="input" 
                  value={finance.landAcqCosts}
                  onChange={(value) => updateFinance('landAcqCosts', value)}
                />
              </div>
              <div>
                <label className="label">Finance rate %</label>
                <NumberInput 
                  className="input" 
                  step="0.1"
                  value={finance.financeRatePct}
                  onChange={(value) => updateFinance('financeRatePct', value)}
                />
              </div>
              <div>
                <label className="label">Target profit %</label>
                <NumberInput 
                  className="input" 
                  value={finance.targetProfitPct}
                  onChange={(value) => updateFinance('targetProfitPct', value)}
                />
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Profit vs Target</span>
                  <span className={getKPIColor(isViableProfit)}>
                    {results.actualProfitPct.toFixed(1)}% / {targetProfitNum}%
                  </span>
                </div>
                <div className="relative bg-slate-700 h-2 rounded">
                  <div 
                    className={`h-full rounded transition-all duration-300 ${
                      isViableProfit ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min((results.actualProfitPct / targetProfitNum) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Cost vs GDV</span>
                  <span className="text-slate-400">
                    {(results.totalCosts / results.gdv * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative bg-slate-700 h-2 rounded">
                  <div 
                    className="bg-amber-400 h-full rounded transition-all duration-300"
                    style={{ 
                      width: `${Math.min((results.totalCosts / results.gdv * 100), 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="text-sm text-slate-400 mb-2">GDV</div>
                <div className="text-xl font-bold text-emerald-400">
                  {formatCurrency(results.gdv)}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="text-sm text-slate-400 mb-2">Build Cost</div>
                <div className="text-xl font-bold text-amber-400">
                  {formatCurrency(results.build)}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="text-sm text-slate-400 mb-2">Total Cost</div>
                <div className="text-xl font-bold text-slate-300">
                  {formatCurrency(results.totalCosts)}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="text-sm text-slate-400 mb-2">Profit %</div>
                <div className={`text-xl font-bold ${getKPIColor(isViableProfit)}`}>
                  {results.actualProfitPct.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className={`mt-8 p-6 rounded-2xl border ${
              results.residual >= 0 ? 
                'bg-emerald-500/10 border-emerald-500/20' : 
                'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="text-slate-300 mb-3 font-medium">Residual Land Value</div>
              <div className={`kpi ${getKPIColor(results.residual >= 0)}`}>
                {formatCurrency(results.residual)}
              </div>
              <div className="mt-3 text-sm text-slate-400 font-mono">
                Formula: GDV - Build Cost - Fees - Contingency - Finance Cost - Target Profit
              </div>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                {formatCurrency(results.gdv)} - {formatCurrency(results.build)} - {formatCurrency(results.fees)} - {formatCurrency(results.contingency)} - {formatCurrency(results.financeCost)} - {formatCurrency(results.targetProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} />
    </>
  );
}

function OfferPage() {
  const { project, houseTypes } = useStore();
  const finance = project.finance || {
    feesPct: '5',
    contPct: '10',
    financeRatePct: '8.5',
    financeMonths: '18',
    targetProfitPct: '20',
    landAcqCosts: '25000',
  };
  const results = computeTotals(project, finance, houseTypes);

  return (
    <div className="container py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">📄</span>
          <h2 className="card-title">Offer Pack & PDF Export</h2>
        </div>
        <div className="card-body space-y-6">
          <p className="text-slate-300 leading-relaxed">
            Preview & export your one-page PDF appraisal ready for lenders and agents.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-700/50 rounded-xl">
              <div className="text-sm text-slate-400 mb-2">Total GDV</div>
              <div className="text-2xl font-bold text-emerald-400">{formatCurrency(results.gdv)}</div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl">
              <div className="text-sm text-slate-400 mb-2">Total Build Cost</div>
              <div className="text-2xl font-bold text-amber-400">{formatCurrency(results.build)}</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn flex-1 sm:flex-none">
              <span>📄</span>
              Export PDF
            </button>
            <button className="btn-ghost flex-1 sm:flex-none">
              <span>👁️</span>
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernHomePage() {
  const { project, scenarios, houseTypes } = useStore();
  const finance = project.finance || { targetProfitPct: '20', feesPct: '5', contPct: '10', financeRatePct: '8.5', financeMonths: '18', landAcqCosts: '25000' };
  const results = computeTotals(project, finance, houseTypes);
  
  return (
    <div className="container py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-3xl">🏗️</span>
          <div>
            <h1 className="card-title text-2xl">Welcome to LandSnap</h1>
            <p className="text-slate-400 mt-1">Property development made simple</p>
          </div>
        </div>
        <div className="card-body space-y-6">
          <p className="text-slate-300 leading-relaxed">
            Quick feasibility assessment for UK property developers (2-15 units). Draw your site, test a unit mix, and generate a lender-ready PDF appraisal.
          </p>
          
          {project.name && (
            <div className="p-4 bg-slate-700/30 rounded-xl">
              <div className="text-sm text-slate-400 mb-2">Current Project</div>
              <div className="font-semibold text-lg">{project.name}</div>
              <div className="text-sm text-slate-300 mt-1">
                {project.estimatedUnits} units • {formatCurrency(results.gdv)} GDV
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/survey" className="btn flex-1 sm:flex-none">
              <span>📍</span>
              Start a Survey
            </a>
            <a href="/offer" className="btn-ghost flex-1 sm:flex-none">
              <span>📄</span>
              View Offer Packs
            </a>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold mb-4 text-lg">Project Overview</h3>
            {project.name ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Units:</span>
                  <span className="font-medium">{project.estimatedUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">GDV:</span>
                  <span className="font-medium">{formatCurrency(results.gdv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Residual:</span>
                  <span className={`font-medium ${results.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(results.residual)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">No active project. Start with a survey above.</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold mb-4 text-lg">Scenarios</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Total scenarios:</span>
                <span className="font-medium">{scenarios.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Current status:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  results.status === 'Viable' ? 'bg-green-500/20 text-green-400' :
                  results.status === 'At Risk' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {results.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Shell() {
  return (
    <div className="app-shell">
      <Topbar />
      <div className="flex h-screen pt-14">
        <Sidebar />
        <div className="flex-1">
          <MapCanvas />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </StoreProvider>
  );
}
