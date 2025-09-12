
import React, { useState, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, LayoutGrid, PoundSterling, FileText, Settings, Plus, Minus } from "lucide-react";
import { GlobalStoreProvider, useGlobalStore, HouseType } from "./store/globalStore";
import { computeTotals, formatCurrency } from "./computeTotals";
import { NumberInput } from "./components/NumberInput";
import { InteractiveMap } from "./components/InteractiveMap";
import "./index.css";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Top Navigation Component
function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'survey', label: 'Survey', icon: Map, path: '/survey' },
    { id: 'layout', label: 'Layout', icon: LayoutGrid, path: '/layout' },
    { id: 'finance', label: 'Finance', icon: PoundSterling, path: '/finance' },
    { id: 'offer', label: 'Offer', icon: FileText, path: '/offer' }
  ];

  return (
    <nav className="top-nav">
      <div className="container mx-auto px-4 py-3 flex gap-2">
        {tabs.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`top-nav-tab ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function HomePage() {
  const { project } = useGlobalStore();
  const debouncedProject = useDebounce(project, 200);
  const totals = useMemo(() => computeTotals(debouncedProject), [debouncedProject]);
  
  const getViabilityStatus = () => {
    if (totals.residual >= 0 && totals.profitPct >= project.finance.targetProfitPct) {
      return { status: 'Viable', color: 'bg-green-500/20 text-green-400' };
    } else if (totals.residual >= 0 && totals.profitPct >= (project.finance.targetProfitPct - 10)) {
      return { status: 'At Risk', color: 'bg-amber-500/20 text-amber-400' };
    } else {
      return { status: 'Unviable', color: 'bg-red-500/20 text-red-400' };
    }
  };
  
  const viability = getViabilityStatus();
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
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
          
          {project.meta.name && (
            <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Current Project</div>
              <div className="font-semibold text-lg text-white">{project.meta.name}</div>
              <div className="text-sm text-slate-300 mt-1">
                {project.layout.unitMix.reduce((sum, mix) => sum + mix.count, 0)} units • {formatCurrency(totals.gdv)} GDV
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
            <h3 className="font-semibold mb-4 text-lg text-white">Project Overview</h3>
            {project.meta.name ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Units:</span>
                  <span className="font-medium text-white">{project.layout.unitMix.reduce((sum, mix) => sum + mix.count, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">GDV:</span>
                  <span className={`font-medium ${totals.residual >= 0 && totals.profitPct >= project.finance.targetProfitPct ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(totals.gdv)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Residual:</span>
                  <span className={`font-medium ${totals.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(totals.residual)}
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
            <h3 className="font-semibold mb-4 text-lg text-white">Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Current status:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${viability.color}`}>
                  {viability.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Profit %:</span>
                <span className={`font-medium ${totals.profitPct >= project.finance.targetProfitPct ? 'text-green-400' : 'text-red-400'}`}>
                  {totals.profitPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SurveyPage() {
  const { project, updateProject } = useGlobalStore();
  const debouncedProject = useDebounce(project, 200);
  const totals = useMemo(() => computeTotals(debouncedProject), [debouncedProject]);
  
  const handleNameChange = useCallback((name: string) => {
    updateProject({ meta: { ...project.meta, name } });
  }, [project.meta, updateProject]);

  const handleEfficiencyChange = useCallback((efficiency: number) => {
    updateProject({ survey: { ...project.survey, efficiency } });
  }, [project.survey, updateProject]);

  const handlePolygonChange = useCallback((geoJSON: any, areaM2: number) => {
    updateProject({ 
      survey: { 
        ...project.survey, 
        polygonGeoJSON: geoJSON, 
        siteAreaM2: areaM2 
      } 
    });
  }, [project.survey, updateProject]);

  const formatArea = (areaM2: number) => {
    const hectares = areaM2 / 10000;
    const acres = areaM2 * 0.000247105;
    return `${areaM2.toLocaleString()} m² • ${hectares.toFixed(2)} ha • ${acres.toFixed(2)} ac`;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">🗺️</span>
          <h2 className="card-title">Survey & GPS Walk</h2>
        </div>
        <div className="card-body space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="label">Project name</label>
              <input 
                className="input" 
                placeholder="Enter project name"
                value={project.meta.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Site efficiency (%)</label>
              <NumberInput 
                className="input" 
                value={project.survey.efficiency}
                onChange={handleEfficiencyChange}
              />
            </div>
          </div>

          {project.survey.siteAreaM2 > 0 && (
            <div className="p-4 bg-slate-700/30 rounded-xl">
              <div className="text-sm text-slate-400 mb-1">Site Area</div>
              <div className="font-semibold text-lg text-brand-400">
                {formatArea(project.survey.siteAreaM2)}
              </div>
            </div>
          )}

          <div className="h-96 rounded-xl overflow-hidden border border-slate-700">
            <InteractiveMap
              polygonGeoJSON={project.survey.polygonGeoJSON}
              onPolygonChange={handlePolygonChange}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutPage() {
  const { project, updateProject } = useGlobalStore();
  const debouncedProject = useDebounce(project, 200);
  const totals = useMemo(() => computeTotals(debouncedProject), [debouncedProject]);
  const [showDefaults, setShowDefaults] = useState(true);
  const [showMyLibrary, setShowMyLibrary] = useState(true);

  const addToMix = useCallback((houseTypeId: string) => {
    const existing = project.layout.unitMix.find(mix => mix.houseTypeId === houseTypeId);
    if (existing) {
      const newMix = project.layout.unitMix.map(mix =>
        mix.houseTypeId === houseTypeId ? { ...mix, count: mix.count + 1 } : mix
      );
      updateProject({ layout: { ...project.layout, unitMix: newMix } });
    } else {
      const newMix = [...project.layout.unitMix, { houseTypeId, count: 1 }];
      updateProject({ layout: { ...project.layout, unitMix: newMix } });
    }
  }, [project.layout, updateProject]);

  const updateMixCount = useCallback((houseTypeId: string, count: number) => {
    if (count <= 0) {
      const newMix = project.layout.unitMix.filter(mix => mix.houseTypeId !== houseTypeId);
      updateProject({ layout: { ...project.layout, unitMix: newMix } });
    } else {
      const newMix = project.layout.unitMix.map(mix =>
        mix.houseTypeId === houseTypeId ? { ...mix, count } : mix
      );
      updateProject({ layout: { ...project.layout, unitMix: newMix } });
    }
  }, [project.layout, updateProject]);

  const getTotalUnits = () => {
    return project.layout.unitMix.reduce((total, mix) => total + mix.count, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">🏠</span>
          <h2 className="card-title">Unit Mix & Layout</h2>
          <div className={`text-sm px-2 py-1 rounded ${totals.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            GDV: {formatCurrency(totals.gdv)}
          </div>
        </div>
        <div className="card-body space-y-8">
          
          {/* Current Project Mix */}
          {project.layout.unitMix.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Current Project Mix ({getTotalUnits()} units)</h3>
              <div className="space-y-3">
                {project.layout.unitMix.map(mix => {
                  const houseType = project.layout.houseTypes.find(ht => ht.id === mix.houseTypeId);
                  if (!houseType) return null;
                  return (
                    <div key={mix.houseTypeId} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                      <div>
                        <div className="font-medium text-white">{houseType.name}</div>
                        <div className="text-sm text-slate-300">
                          {houseType.beds} beds • {houseType.giaM2}m² • £{houseType.salePerM2}/m²
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <NumberInput 
                          className="input w-20" 
                          value={mix.count}
                          onChange={(value) => updateMixCount(mix.houseTypeId, value)}
                        />
                        <button 
                          onClick={() => updateMixCount(mix.houseTypeId, 0)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
              className="flex items-center gap-2 font-semibold text-lg mb-4 hover:text-brand-400 transition-colors"
            >
              <span>{showDefaults ? '▼' : '▶'}</span>
              Default House Types
            </button>
            {showDefaults && (
              <div className="grid md:grid-cols-2 gap-4">
                {project.library.defaults.map(houseType => (
                  <div key={houseType.id} className="p-4 bg-slate-700/20 rounded-xl border border-slate-700">
                    <div className="font-medium mb-2 text-white">{houseType.name}</div>
                    <div className="text-sm text-slate-300 mb-3">
                      {houseType.beds} beds • {houseType.giaM2}m² • Build: £{houseType.buildPerM2}/m² • Sale: £{houseType.salePerM2}/m²
                    </div>
                    <button 
                      onClick={() => addToMix(houseType.id)}
                      className="btn-ghost text-sm w-full"
                    >
                      ➕ Add to Project
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Library */}
          <div>
            <button 
              onClick={() => setShowMyLibrary(!showMyLibrary)}
              className="flex items-center gap-2 font-semibold text-lg mb-4 hover:text-brand-400 transition-colors"
            >
              <span>{showMyLibrary ? '▼' : '▶'}</span>
              My Library ({project.library.myTypes.length})
            </button>
            {showMyLibrary && (
              <div className="space-y-4">
                {project.library.myTypes.length === 0 ? (
                  <p className="text-slate-400">No custom house types yet. Create your first one below.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.library.myTypes.map(houseType => (
                      <div key={houseType.id} className="p-4 bg-slate-700/20 rounded-xl border border-slate-700">
                        <div className="font-medium mb-2 text-white">{houseType.name}</div>
                        <div className="text-sm text-slate-300 mb-3">
                          {houseType.beds} beds • {houseType.giaM2}m² • Build: £{houseType.buildPerM2}/m² • Sale: £{houseType.salePerM2}/m²
                        </div>
                        <button 
                          onClick={() => addToMix(houseType.id)}
                          className="btn-ghost text-sm w-full"
                        >
                          ➕ Add to Project
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancePage() {
  const { project, updateProject } = useGlobalStore();
  const debouncedProject = useDebounce(project, 200);
  const totals = useMemo(() => computeTotals(debouncedProject), [debouncedProject]);

  const updateFinance = useCallback((field: keyof typeof project.finance, value: number) => {
    updateProject({
      finance: { ...project.finance, [field]: value }
    });
  }, [project.finance, updateProject]);

  const getViabilityStatus = () => {
    if (totals.residual >= 0 && totals.profitPct >= project.finance.targetProfitPct) {
      return { status: 'Viable', color: 'bg-green-500', textColor: 'text-green-400' };
    } else if (totals.residual >= 0 && totals.profitPct >= (project.finance.targetProfitPct - 10)) {
      return { status: 'At Risk', color: 'bg-amber-500', textColor: 'text-amber-400' };
    } else {
      return { status: 'Unviable', color: 'bg-red-500', textColor: 'text-red-400' };
    }
  };

  const viability = getViabilityStatus();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
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
          </div>
        </div>
        <div className="card-body space-y-6">
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="label">Fees %</label>
              <NumberInput 
                className="input" 
                value={project.finance.feesPct}
                onChange={(value) => updateFinance('feesPct', value)}
              />
            </div>
            <div>
              <label className="label">Contingency %</label>
              <NumberInput 
                className="input" 
                value={project.finance.contPct}
                onChange={(value) => updateFinance('contPct', value)}
              />
            </div>
            <div>
              <label className="label">Target profit %</label>
              <NumberInput 
                className="input" 
                value={project.finance.targetProfitPct}
                onChange={(value) => updateFinance('targetProfitPct', value)}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="label">Land acquisition costs (£)</label>
              <NumberInput 
                className="input" 
                value={project.finance.landAcqCosts}
                onChange={(value) => updateFinance('landAcqCosts', value)}
              />
            </div>
            <div>
              <label className="label">Finance rate %</label>
              <NumberInput 
                className="input" 
                step="0.1"
                value={project.finance.financeRatePct}
                onChange={(value) => updateFinance('financeRatePct', value)}
              />
            </div>
            <div>
              <label className="label">Finance months</label>
              <NumberInput 
                className="input" 
                value={project.finance.financeMonths}
                onChange={(value) => updateFinance('financeMonths', value)}
              />
            </div>
          </div>
          
          {/* KPI Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">GDV</div>
              <div className={`kpi ${totals.residual >= 0 && totals.profitPct >= project.finance.targetProfitPct ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totals.gdv)}
              </div>
            </div>
            
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Build Cost</div>
              <div className="kpi text-amber-400">
                {formatCurrency(totals.build)}
              </div>
            </div>
            
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Total Cost</div>
              <div className="kpi text-slate-300">
                {formatCurrency(totals.build + totals.fees + totals.contingency + totals.financeCost + project.finance.landAcqCosts)}
              </div>
            </div>
            
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Profit %</div>
              <div className={`kpi ${viability.textColor}`}>
                {totals.profitPct.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className={`mt-8 p-6 rounded-2xl border ${
            totals.residual >= 0 ? 
              'bg-green-500/10 border-green-500/20' : 
              'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="text-slate-300 mb-3 font-medium">Residual Land Value</div>
            <div className={`text-3xl font-bold ${totals.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totals.residual)}
            </div>
            <div className="mt-3 text-sm text-slate-400 font-mono">
              Formula: GDV - Build Cost - Fees - Contingency - Finance Cost - Target Profit - Land Acq
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketPage() {
  const { project, updateProject } = useGlobalStore();
  const debouncedProject = useDebounce(project, 200);
  const totals = useMemo(() => computeTotals(debouncedProject), [debouncedProject]);

  const toggleMarketPrice = useCallback(() => {
    updateProject({
      market: {
        ...project.market,
        useMarketPrice: !project.market.useMarketPrice
      }
    });
  }, [project.market, updateProject]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">📊</span>
          <h2 className="card-title">Market Analysis</h2>
        </div>
        <div className="card-body space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={project.market.useMarketPrice}
                onChange={toggleMarketPrice}
                className="w-4 h-4"
              />
              <span className="text-white">Use market-derived price</span>
            </label>
            {project.market.pricePerSqftDerived && (
              <span className="text-sm text-slate-300">
                (£{project.market.pricePerSqftDerived}/sqft)
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-700/30 rounded-xl">
            <div className="text-sm text-slate-400 mb-2">Current GDV</div>
            <div className={`kpi ${totals.residual >= 0 && totals.profitPct >= project.finance.targetProfitPct ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totals.gdv)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {project.market.useMarketPrice ? 'Using market price' : 'Using house type prices'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferPage() {
  const { project } = useGlobalStore();
  const debouncedProject = useDebounce(project, 200);
  const totals = useMemo(() => computeTotals(debouncedProject), [debouncedProject]);

  const getViabilityBadge = () => {
    if (totals.residual >= 0 && totals.profitPct >= project.finance.targetProfitPct) {
      return { status: 'Viable', color: 'bg-green-500', textColor: 'text-green-400' };
    } else if (totals.residual >= 0 && totals.profitPct >= (project.finance.targetProfitPct - 10)) {
      return { status: 'At Risk', color: 'bg-amber-500', textColor: 'text-amber-400' };
    } else {
      return { status: 'Unviable', color: 'bg-red-500', textColor: 'text-red-400' };
    }
  };

  const viability = getViabilityBadge();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
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
          
          {/* Project Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Total GDV</div>
              <div className={`kvi ${totals.residual >= 0 && totals.profitPct >= project.finance.targetProfitPct ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totals.gdv)}
              </div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Residual Land Value</div>
              <div className={`kvi ${totals.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totals.residual)}
              </div>
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

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <TopNavigation />
      <main className="pt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/layout" element={<LayoutPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/offer" element={<OfferPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <GlobalStoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GlobalStoreProvider>
  );
}
