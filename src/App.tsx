
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, LayoutGrid, PoundSterling, FileText } from "lucide-react";
import { HomePage } from "./pages/HomePage";
import { MapPage } from "./pages/MapPage";
import { ProjectPage } from "./pages/ProjectPage";
import { FinancePage } from "./pages/FinancePage";
import { StoreProvider, useStore } from "./store";
import { Toast, useToast } from "./components/Toast";
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
                <input 
                  className="input" 
                  type="number" 
                  value={project.efficiency || 65}
                  onChange={(e) => updateProject({ efficiency: parseFloat(e.target.value) || 65 })}
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
  const { project, updateProject } = useStore();
  const { toast, showToast, hideToast } = useToast();
  
  const handleChange = (field: string, value: any) => {
    updateProject({ [field]: value });
    showToast('Autosaved', 'success');
  };

  return (
    <>
      <div className="container py-8 space-y-8">
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">🏠</span>
            <h2 className="card-title">Unit Mix & Layout</h2>
          </div>
          <div className="card-body space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">House Type</label>
                <select 
                  className="select"
                  value={project.houseType || 'detached'}
                  onChange={(e) => handleChange('houseType', e.target.value)}
                >
                  <option value="detached">4-bed detached</option>
                  <option value="semi-detached">3-bed detached</option>
                  <option value="terraced">3-bed semi</option>
                  <option value="apartment">2-bed semi</option>
                </select>
              </div>
              <div>
                <label className="label">Count</label>
                <input 
                  className="input" 
                  type="number" 
                  value={project.estimatedUnits || 4}
                  onChange={(e) => handleChange('estimatedUnits', parseInt(e.target.value) || 4)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Floor area (m²)</label>
                <input 
                  className="input" 
                  type="number" 
                  value={project.floorAreaPerUnit || 120}
                  onChange={(e) => handleChange('floorAreaPerUnit', parseFloat(e.target.value) || 120)}
                />
              </div>
              <div>
                <label className="label">GDV per unit (£)</label>
                <input 
                  className="input" 
                  type="number" 
                  value={project.gdvPerUnit || 350000}
                  onChange={(e) => handleChange('gdvPerUnit', parseFloat(e.target.value) || 350000)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} duration={1000} />
    </>
  );
}

function ModernFinancePage() {
  const { project, updateProject, duplicateScenario } = useStore();
  const { toast, showToast, hideToast } = useToast();
  
  const finance = project.finance || {
    feesPct: 5,
    contPct: 10,
    financeRatePct: 8.5,
    financeMonths: 18,
    targetProfitPct: 20,
    landAcqCosts: 25000,
  };
  
  const results = computeTotals(project, finance);
  
  const updateFinance = (field: keyof typeof finance, value: number) => {
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
                <input 
                  className="input" 
                  type="number" 
                  value={project.buildCostPerSqm || 1650}
                  onChange={(e) => updateProject({ buildCostPerSqm: parseFloat(e.target.value) || 1650 })}
                />
              </div>
              <div>
                <label className="label">Fees %</label>
                <input 
                  className="input" 
                  type="number" 
                  value={finance.feesPct}
                  onChange={(e) => updateFinance('feesPct', parseFloat(e.target.value) || 5)}
                />
              </div>
              <div>
                <label className="label">Contingency %</label>
                <input 
                  className="input" 
                  type="number" 
                  value={finance.contPct}
                  onChange={(e) => updateFinance('contPct', parseFloat(e.target.value) || 10)}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="label">Land acquisition costs (£)</label>
                <input 
                  className="input" 
                  type="number" 
                  value={finance.landAcqCosts}
                  onChange={(e) => updateFinance('landAcqCosts', parseFloat(e.target.value) || 25000)}
                />
              </div>
              <div>
                <label className="label">Finance rate %</label>
                <input 
                  className="input" 
                  type="number" 
                  step="0.1"
                  value={finance.financeRatePct}
                  onChange={(e) => updateFinance('financeRatePct', parseFloat(e.target.value) || 8.5)}
                />
              </div>
              <div>
                <label className="label">Target profit %</label>
                <input 
                  className="input" 
                  type="number" 
                  value={finance.targetProfitPct}
                  onChange={(e) => updateFinance('targetProfitPct', parseFloat(e.target.value) || 20)}
                />
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Profit vs Target</span>
                  <span className={getKPIColor(results.actualProfitPct >= finance.targetProfitPct)}>
                    {results.actualProfitPct.toFixed(1)}% / {finance.targetProfitPct}%
                  </span>
                </div>
                <div className="relative bg-slate-700 h-2 rounded">
                  <div 
                    className={`h-full rounded transition-all duration-300 ${
                      results.actualProfitPct >= finance.targetProfitPct ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min((results.actualProfitPct / finance.targetProfitPct) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Cost vs GDV</span>
                  <span className="text-slate-400">
                    {((results.build + results.fees + results.contingency + results.financeCost + finance.landAcqCosts) / results.gdv * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative bg-slate-700 h-2 rounded">
                  <div 
                    className="bg-amber-400 h-full rounded transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((results.build + results.fees + results.contingency + results.financeCost + finance.landAcqCosts) / results.gdv * 100), 100)}%` 
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
                  {formatCurrency(results.build + results.fees + results.contingency + results.financeCost + finance.landAcqCosts)}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="text-sm text-slate-400 mb-2">Profit %</div>
                <div className={`text-xl font-bold ${getKPIColor(results.actualProfitPct >= finance.targetProfitPct)}`}>
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
            </div>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} />
    </>
  );
}

function OfferPage() {
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
              <div className="text-2xl font-bold text-emerald-400">£1,400,000</div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl">
              <div className="text-sm text-slate-400 mb-2">Total Build Cost</div>
              <div className="text-2xl font-bold text-amber-400">£792,000</div>
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
  const { project, scenarios } = useStore();
  const finance = project.finance || { targetProfitPct: 20, feesPct: 5, contPct: 10, financeRatePct: 8.5, financeMonths: 18, landAcqCosts: 25000 };
  const results = computeTotals(project, finance);
  
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

function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  
  const item = (path: string, Icon: any, label: string) => (
    <button 
      onClick={() => nav(path)} 
      className={`${pathname === path ? "active" : ""} flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition`}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
  
  return (
    <nav className="bottom-nav">
      <ul className="px-2">
        <li className="contents">
          {item("/", Home, "Home")}
          {item("/survey", Map, "Survey")}
          {item("/layout", LayoutGrid, "Layout")}
          {item("/finance", PoundSterling, "Finance")}
          {item("/offer", FileText, "Offer")}
        </li>
      </ul>
    </nav>
  );
}

function Shell() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<ModernHomePage/>} />
        <Route path="/survey" element={<SurveyPage/>} />
        <Route path="/layout" element={<LayoutPage/>} />
        <Route path="/finance" element={<ModernFinancePage/>} />
        <Route path="/offer" element={<OfferPage/>} />
        <Route path="/project/:id" element={<ProjectPage/>} />
        <Route path="/project/:id/map" element={<MapPage/>} />
      </Routes>
      <BottomNav />
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
