
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, LayoutGrid, PoundSterling, FileText, Settings, Plus, Minus } from "lucide-react";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { MapCanvas } from "./components/MapCanvas";
import { InteractiveMap } from "./components/InteractiveMap";
import { AssumptionsDrawer } from "./components/AssumptionsDrawer";
import { ScenarioCompare } from "./components/ScenarioCompare";
import { UnitMixEditor } from "./components/UnitMixEditor";
import { StoreProvider, useStore } from "./store";
import { Toast, useToast } from "./components/Toast";
import { NumberInput } from "./components/NumberInput";
import { computeTotals, formatCurrency } from "./finance";
import MapShell from "./components/MapShell";
import "./index.css";

function SurveyPage() {
  const { project, updateProject } = useStore();
  const { toast, showToast, hideToast } = useToast();
  const [siteArea, setSiteArea] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'getting' | 'ok' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const handleUseGPS = () => {
    setShowMap(true);
    setGpsStatus('getting');
    
    if (!navigator.geolocation) {
      setGpsStatus('error');
      showToast('Geolocation not supported by this browser', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setGpsStatus('ok');
      },
      (error) => {
        setGpsStatus('error');
        let message = 'GPS error occurred';
        
        // Check if in iframe
        if (window.self !== window.top) {
          message = 'Your browser blocks GPS in this preview. Open in a new tab and try again.';
        } else {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Please allow location in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Couldn't read GPS, try again outside.";
              break;
            case error.TIMEOUT:
              message = 'Took too long, try again.';
              break;
          }
        }
        showToast(message, 'error');
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  const getGPSButtonText = () => {
    switch (gpsStatus) {
      case 'getting':
        return 'Getting GPS…';
      case 'ok':
        return 'Re-center to me';
      default:
        return 'Use GPS';
    }
  };
  
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

  const formatArea = (areaM2: number) => {
    const hectares = areaM2 / 10000;
    const acres = areaM2 * 0.000247105;
    return `${areaM2.toLocaleString()} m² • ${hectares.toFixed(2)} ha • ${acres.toFixed(2)} ac`;
  };

  const handleBoundaryChange = (boundary: Array<{ lat: number; lng: number }>) => {
    updateProject({ boundary });
  };

  const handleAreaChange = (areaM2: number) => {
    setSiteArea(areaM2);
    updateProject({ siteArea: areaM2 });
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
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project name</label>
                <input 
                  className="input-field" 
                  placeholder="Enter project name"
                  value={project.name}
                  onChange={(e) => updateProject({ name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Site efficiency (%)</label>
                <NumberInput 
                  className="input-field" 
                  value={project.efficiency || 65}
                  onChange={(value) => updateProject({ efficiency: parseFloat(value) || 65 })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleUseGPS}
                disabled={gpsStatus === 'getting'}
                className="btn-secondary"
              >
                📍 {getGPSButtonText()}
              </button>
              {window.self !== window.top && gpsStatus === 'error' && (
                <div className="text-sm text-amber-400 flex items-center">
                  Your browser blocks GPS in this preview. Open in a new tab and try again.
                </div>
              )}
            </div>

            {siteArea > 0 && (
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <div className="text-sm text-slate-400 mb-1">Site Area</div>
                <div className="font-semibold text-lg text-brand-400">
                  {formatArea(siteArea)}
                </div>
              </div>
            )}

            {showMap && (
              <div className="h-[420px] rounded-xl overflow-hidden border border-slate-700">
                <InteractiveMap
                  boundary={project.boundary}
                  onBoundaryChange={handleBoundaryChange}
                  onAreaChange={handleAreaChange}
                  userLocation={userLocation}
                  gpsStatus={gpsStatus}
                  className="h-full"
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary flex-1 sm:flex-none" onClick={handleSave}>
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
  return (
    <div className="container py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">🏠</span>
          <h2 className="card-title">Unit Mix & Layout</h2>
        </div>
        <div className="card-body">
          <UnitMixEditor />
        </div>
      </div>
    </div>
  );
}

function ModernFinancePage() {
  const { project, updateProject, duplicateScenario, scenarios, houseTypes } = useStore();
  const { toast, showToast, hideToast } = useToast();
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [sensitivityMode, setSensitivityMode] = useState<'sale' | 'build' | null>(null);
  const [sensitivityValue, setSensitivityValue] = useState(0);
  
  const finance = project.finance || {
    feesPct: '5',
    contPct: '10',
    financeRatePct: '8.5',
    financeMonths: '18',
    targetProfitPct: '20',
    landAcqCosts: '25000',
  };
  
  const results = computeTotals(project, finance, houseTypes);
  
  // Sensitivity analysis
  const getSensitivityResults = () => {
    if (!sensitivityMode) return results;
    
    const adjustedProject = { ...project };
    const adjustedHouseTypes = houseTypes.map(ht => {
      if (sensitivityMode === 'sale') {
        return { ...ht, saleValuePerSqm: ht.saleValuePerSqm * (1 + sensitivityValue / 100) };
      } else if (sensitivityMode === 'build') {
        return { ...ht, buildCostPerSqm: ht.buildCostPerSqm * (1 + sensitivityValue / 100) };
      }
      return ht;
    });
    
    return computeTotals(adjustedProject, finance, adjustedHouseTypes);
  };
  
  const sensitivityResults = getSensitivityResults();
  
  const updateFinance = (field: keyof typeof finance, value: string) => {
    updateProject({
      finance: { ...finance, [field]: value }
    });
  };
  
  const handleDuplicate = () => {
    duplicateScenario();
    showToast('Scenario duplicated', 'success');
  };
  
  const getViabilityStatus = () => {
    const targetProfitNum = parseFloat(finance.targetProfitPct) || 20;
    const actualProfitPct = sensitivityResults.actualProfitPct;
    const residual = sensitivityResults.residual;
    
    if (actualProfitPct >= targetProfitNum && residual >= 0) {
      return { status: 'Viable', color: 'bg-green-500', textColor: 'text-green-400' };
    } else if (actualProfitPct >= (targetProfitNum - 10) && residual >= 0) {
      return { status: 'At Risk', color: 'bg-amber-500', textColor: 'text-amber-400' };
    } else {
      return { status: 'Unviable', color: 'bg-red-500', textColor: 'text-red-400' };
    }
  };
  
  const viability = getViabilityStatus();
  
  const getKPIColor = (isPositive: boolean) => {
    return isPositive ? 'text-green-400' : 'text-red-400';
  };

  const targetProfitNum = parseFloat(finance.targetProfitPct) || 20;
  const isViableProfit = sensitivityResults.actualProfitPct >= targetProfitNum && sensitivityResults.residual >= 0;

  const handleSensitivityChange = (mode: 'sale' | 'build', delta: number) => {
    if (sensitivityMode === mode && sensitivityValue === delta) {
      // Reset if clicking the same button
      setSensitivityMode(null);
      setSensitivityValue(0);
    } else {
      setSensitivityMode(mode);
      setSensitivityValue(delta);
    }
  };

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
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${viability.color}`}>
                {viability.status}
              </span>
              <button 
                onClick={() => setShowAssumptions(true)}
                className="btn-ghost text-sm"
              >
                <Settings size={16} />
                Assumptions
              </button>
              <button onClick={handleDuplicate} className="btn-ghost text-sm">
                📋 Duplicate Scenario
              </button>
              {scenarios.length > 1 && (
                <button 
                  onClick={() => setShowCompare(true)}
                  className="btn-ghost text-sm"
                >
                  🔄 Compare
                </button>
              )}
            </div>
          </div>
          <div className="card-body space-y-6">
            
            {/* Sensitivity Analysis */}
            <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
              <h3 className="font-semibold mb-4 text-white">Sensitivity Analysis</h3>
              <div className="flex gap-4 mb-4">
                <div className="space-x-2">
                  <span className="text-sm text-slate-300">Sale Price:</span>
                  <button 
                    onClick={() => handleSensitivityChange('sale', -5)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      sensitivityMode === 'sale' && sensitivityValue === -5 
                        ? 'bg-red-500 text-white' 
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    <Minus size={12} className="inline mr-1" />
                    5%
                  </button>
                  <button 
                    onClick={() => handleSensitivityChange('sale', 5)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      sensitivityMode === 'sale' && sensitivityValue === 5 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    <Plus size={12} className="inline mr-1" />
                    5%
                  </button>
                </div>
                
                <div className="space-x-2">
                  <span className="text-sm text-slate-300">Build Cost:</span>
                  <button 
                    onClick={() => handleSensitivityChange('build', -5)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      sensitivityMode === 'build' && sensitivityValue === -5 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    <Minus size={12} className="inline mr-1" />
                    5%
                  </button>
                  <button 
                    onClick={() => handleSensitivityChange('build', 5)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      sensitivityMode === 'build' && sensitivityValue === 5 
                        ? 'bg-red-500 text-white' 
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    <Plus size={12} className="inline mr-1" />
                    5%
                  </button>
                </div>
              </div>
              
              {sensitivityMode && (
                <div className="text-sm text-slate-300">
                  Showing {sensitivityValue > 0 ? '+' : ''}{sensitivityValue}% change to {sensitivityMode === 'sale' ? 'sale prices' : 'build costs'}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Build cost £/m²</label>
                <NumberInput 
                  className="input-field" 
                  value={project.buildCostPerSqm || 1650}
                  onChange={(value) => updateProject({ buildCostPerSqm: parseFloat(value) || 1650 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Fees %</label>
                <NumberInput 
                  className="input-field" 
                  value={finance.feesPct}
                  onChange={(value) => updateFinance('feesPct', value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contingency %</label>
                <NumberInput 
                  className="input-field" 
                  value={finance.contPct}
                  onChange={(value) => updateFinance('contPct', value)}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Land acquisition costs (£)</label>
                <NumberInput 
                  className="input-field" 
                  value={finance.landAcqCosts}
                  onChange={(value) => updateFinance('landAcqCosts', value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Finance rate %</label>
                <NumberInput 
                  className="input-field" 
                  step="0.1"
                  value={finance.financeRatePct}
                  onChange={(value) => updateFinance('financeRatePct', value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target profit %</label>
                <NumberInput 
                  className="input-field" 
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
                    {sensitivityResults.actualProfitPct.toFixed(1)}% / {targetProfitNum}%
                  </span>
                </div>
                <div className="relative bg-slate-700 h-2 rounded">
                  <div 
                    className={`h-full rounded transition-all duration-300 ${
                      isViableProfit ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min((sensitivityResults.actualProfitPct / targetProfitNum) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Cost vs GDV</span>
                  <span className="text-slate-400">
                    {(sensitivityResults.totalCosts / sensitivityResults.gdv * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative bg-slate-700 h-2 rounded">
                  <div 
                    className="bg-amber-400 h-full rounded transition-all duration-300"
                    style={{ 
                      width: `${Math.min((sensitivityResults.totalCosts / sensitivityResults.gdv * 100), 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <div className="text-sm text-slate-400 mb-2">GDV</div>
                <div className="text-xl font-bold text-brand-400">
                  {formatCurrency(sensitivityResults.gdv)}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <div className="text-sm text-slate-400 mb-2">Build Cost</div>
                <div className="text-xl font-bold text-amber-400">
                  {formatCurrency(sensitivityResults.build)}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <div className="text-sm text-slate-400 mb-2">Total Cost</div>
                <div className="text-xl font-bold text-slate-300">
                  {formatCurrency(sensitivityResults.totalCosts)}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <div className="text-sm text-slate-400 mb-2">Profit %</div>
                <div className={`text-xl font-bold ${viability.textColor}`}>
                  {sensitivityResults.actualProfitPct.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className={`mt-8 p-6 rounded-2xl border ${
              sensitivityResults.residual >= 0 ? 
                'bg-green-500/10 border-green-500/20' : 
                'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="text-slate-300 mb-3 font-medium">Residual Land Value</div>
              <div className={`text-3xl font-bold ${getKPIColor(sensitivityResults.residual >= 0)}`}>
                {formatCurrency(sensitivityResults.residual)}
              </div>
              <div className="mt-3 text-sm text-slate-400 font-mono">
                Formula: GDV - Build Cost - Fees - Contingency - Finance Cost - Target Profit
              </div>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                {formatCurrency(sensitivityResults.gdv)} - {formatCurrency(sensitivityResults.build)} - {formatCurrency(sensitivityResults.fees)} - {formatCurrency(sensitivityResults.contingency)} - {formatCurrency(sensitivityResults.financeCost)} - {formatCurrency(sensitivityResults.targetProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AssumptionsDrawer 
        isOpen={showAssumptions} 
        onClose={() => setShowAssumptions(false)} 
      />
      
      {showCompare && scenarios.length > 1 && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">Select Scenario to Compare</h3>
            <div className="space-y-2 mb-4">
              {scenarios.filter(s => s.id !== project.id).map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedScenario === scenario.id 
                      ? 'bg-brand-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {scenario.name}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if (selectedScenario) {
                    const scenario = scenarios.find(s => s.id === selectedScenario);
                    if (scenario) {
                      // Show comparison - this would need to be implemented
                    }
                  }
                }}
                disabled={!selectedScenario}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare
              </button>
              <button onClick={() => setShowCompare(false)} className="btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
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
  const unitMix = project.unitMix || [];

  const getViabilityBadge = () => {
    const targetProfitNum = parseFloat(finance.targetProfitPct) || 20;
    const actualProfitPct = results.actualProfitPct;
    const residual = results.residual;
    
    if (actualProfitPct >= targetProfitNum && residual >= 0) {
      return { status: 'Viable', color: 'bg-green-500', textColor: 'text-green-400' };
    } else if (actualProfitPct >= (targetProfitNum - 10) && residual >= 0) {
      return { status: 'At Risk', color: 'bg-amber-500', textColor: 'text-amber-400' };
    } else {
      return { status: 'Unviable', color: 'bg-red-500', textColor: 'text-red-400' };
    }
  };

  const viability = getViabilityBadge();

  const hasRequiredData = () => {
    return project.name && 
           unitMix.length > 0 && 
           parseFloat(finance.targetProfitPct) > 0 &&
           parseFloat(finance.feesPct) > 0;
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">📄</span>
          <div className="flex-1">
            <h2 className="card-title">Offer Pack & PDF Export</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${viability.color}`}>
            {viability.status}
          </span>
        </div>
        <div className="card-body space-y-6">
          <p className="text-slate-300 leading-relaxed">
            Preview & export your one-page PDF appraisal ready for lenders and agents.
          </p>
          
          {!hasRequiredData() && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="text-amber-400 font-medium mb-2">Missing Required Data</div>
              <ul className="text-sm text-amber-300 space-y-1">
                {!project.name && <li>• Project name</li>}
                {unitMix.length === 0 && <li>• Unit mix (add house types in Layout)</li>}
                {parseFloat(finance.targetProfitPct) <= 0 && <li>• Target profit %</li>}
                {parseFloat(finance.feesPct) <= 0 && <li>• Fees %</li>}
              </ul>
            </div>
          )}

          {/* Project Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Total GDV</div>
              <div className="text-2xl font-bold text-brand-400">{formatCurrency(results.gdv)}</div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Residual Land Value</div>
              <div className={`text-2xl font-bold ${results.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(results.residual)}
              </div>
            </div>
          </div>

          {/* Unit Schedule */}
          {unitMix.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white">Unit Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-2 text-slate-300">Type</th>
                      <th className="text-right py-2 text-slate-300">Count</th>
                      <th className="text-right py-2 text-slate-300">Area (m²)</th>
                      <th className="text-right py-2 text-slate-300">Total Area</th>
                      <th className="text-right py-2 text-slate-300">Sale Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitMix.map(mix => {
                      const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
                      if (!houseType) return null;
                      const totalArea = houseType.floorAreaSqm * mix.count;
                      const totalValue = totalArea * houseType.saleValuePerSqm;
                      
                      return (
                        <tr key={mix.houseTypeId} className="border-b border-slate-700">
                          <td className="py-2 text-white">{houseType.name}</td>
                          <td className="text-right py-2 text-slate-300">{mix.count}</td>
                          <td className="text-right py-2 text-slate-300">{houseType.floorAreaSqm}</td>
                          <td className="text-right py-2 text-slate-300">{totalArea}</td>
                          <td className="text-right py-2 text-brand-400">{formatCurrency(totalValue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Assumptions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Key Assumptions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xs text-slate-400">Professional Fees</div>
                <div className="font-semibold text-white">{finance.feesPct}%</div>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xs text-slate-400">Contingency</div>
                <div className="font-semibold text-white">{finance.contPct}%</div>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xs text-slate-400">Finance Rate</div>
                <div className="font-semibold text-white">{finance.financeRatePct}%</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className={`btn-primary flex-1 sm:flex-none ${!hasRequiredData() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!hasRequiredData()}
            >
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
  
  const getViabilityStatus = () => {
    const targetProfitNum = parseFloat(finance.targetProfitPct) || 20;
    if (results.actualProfitPct >= targetProfitNum && results.residual >= 0) {
      return { status: 'Viable', color: 'bg-green-500/20 text-green-400' };
    } else if (results.actualProfitPct >= (targetProfitNum - 10) && results.residual >= 0) {
      return { status: 'At Risk', color: 'bg-amber-500/20 text-amber-400' };
    } else {
      return { status: 'Unviable', color: 'bg-red-500/20 text-red-400' };
    }
  };
  
  const viability = getViabilityStatus();
  
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
            <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Current Project</div>
              <div className="font-semibold text-lg text-white">{project.name}</div>
              <div className="text-sm text-slate-300 mt-1">
                {project.estimatedUnits} units • {formatCurrency(results.gdv)} GDV
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/survey" className="btn-primary flex-1 sm:flex-none">
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
            <h3 className="font-semibold mb-4 text-lg text-white">Project Overview</h3>
            {project.name ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Units:</span>
                  <span className="font-medium text-white">{project.estimatedUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">GDV:</span>
                  <span className="font-medium text-brand-400">{formatCurrency(results.gdv)}</span>
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
            <h3 className="font-semibold mb-4 text-lg text-white">Scenarios</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Total scenarios:</span>
                <span className="font-medium text-white">{scenarios.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Current status:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${viability.color}`}>
                  {viability.status}
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
  const location = useLocation();
  const navigate = useNavigate();

  const renderPage = () => {
    switch (location.pathname) {
      case '/':
        return <ModernHomePage />;
      case '/survey':
        return <SurveyPage />;
      case '/layout':
        return <LayoutPage />;
      case '/finance':
        return <ModernFinancePage />;
      case '/offer':
        return <OfferPage />;
      default:
        return <ModernHomePage />;
    }
  };

  return (
    <div className="app-shell">
      <Topbar />
      <div className="flex h-screen pt-14">
        <Sidebar />
        <div className="flex-1 p-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Shell />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
