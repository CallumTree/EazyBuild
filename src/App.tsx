
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ProjectPage } from "./pages/ProjectPage";
import "./index.css";

function WelcomePage() {
  const nav = useNavigate();
  
  return (
    <div className="p-4 pb-20">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold">Welcome to LandSnap</h1>
        </div>
        <div className="card-body">
          <p className="text-slate-300 mb-6">
            Quick feasibility assessment for UK property developers
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => nav("/survey")} 
              className="btn w-full"
            >
              Start Survey
            </button>
            <button 
              onClick={() => nav("/offer")} 
              className="btn-ghost w-full"
            >
              View Offer Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SurveyPage() {
  const [projectName, setProjectName] = useState("");
  const [efficiency, setEfficiency] = useState("");

  return (
    <div className="p-4 pb-20">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold">Project Survey</h1>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Project Name</label>
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input w-full"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="label">Efficiency %</label>
            <input 
              type="number" 
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              className="input w-full"
              placeholder="Enter efficiency"
            />
          </div>
          <button className="btn w-full">Save</button>
        </div>
      </div>
    </div>
  );
}

function LayoutPage() {
  const [units, setUnits] = useState({ onebed: 0, twobed: 0, threbed: 0 });

  return (
    <div className="p-4 pb-20">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold">Unit Layout</h1>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">1 Bed</label>
                <input 
                  type="number" 
                  value={units.onebed}
                  onChange={(e) => setUnits({...units, onebed: parseInt(e.target.value) || 0})}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">2 Bed</label>
                <input 
                  type="number" 
                  value={units.twobed}
                  onChange={(e) => setUnits({...units, twobed: parseInt(e.target.value) || 0})}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">3 Bed</label>
                <input 
                  type="number" 
                  value={units.threbed}
                  onChange={(e) => setUnits({...units, threbed: parseInt(e.target.value) || 0})}
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancePage() {
  const [fees, setFees] = useState(10);
  const [contingency, setContingency] = useState(5);
  const [profit, setProfit] = useState(20);
  const [landCost, setLandCost] = useState(0);
  const [financeRate, setFinanceRate] = useState(6);
  const [financeDuration, setFinanceDuration] = useState(18);

  const gdv = 1500000;
  const buildCost = 800000;
  const financeCost = (buildCost + landCost) * (financeRate / 100) * (financeDuration / 12);
  const residual = gdv - buildCost - (buildCost * fees / 100) - (buildCost * contingency / 100) - financeCost - (gdv * profit / 100);

  return (
    <div className="p-4 pb-20">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold">Financial Analysis</h1>
        </div>
        <div className="card-body space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fees %</label>
              <input 
                type="number" 
                value={fees}
                onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Contingency %</label>
              <input 
                type="number" 
                value={contingency}
                onChange={(e) => setContingency(parseFloat(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Target Profit %</label>
              <input 
                type="number" 
                value={profit}
                onChange={(e) => setProfit(parseFloat(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Land Acquisition</label>
              <input 
                type="number" 
                value={landCost}
                onChange={(e) => setLandCost(parseFloat(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Finance Rate %</label>
              <input 
                type="number" 
                value={financeRate}
                onChange={(e) => setFinanceRate(parseFloat(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Finance Duration (months)</label>
              <input 
                type="number" 
                value={financeDuration}
                onChange={(e) => setFinanceDuration(parseFloat(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="card bg-slate-800/50">
              <div className="p-4">
                <h3 className="text-sm text-slate-400">GDV</h3>
                <p className="kpi">£{gdv.toLocaleString()}</p>
              </div>
            </div>
            <div className="card bg-slate-800/50">
              <div className="p-4">
                <h3 className="text-sm text-slate-400">Build Cost</h3>
                <p className="kpi">£{buildCost.toLocaleString()}</p>
              </div>
            </div>
            <div className="card bg-slate-800/50">
              <div className="p-4">
                <h3 className="text-sm text-slate-400">Finance Cost</h3>
                <p className="kpi">£{Math.round(financeCost).toLocaleString()}</p>
              </div>
            </div>
            <div className="card bg-slate-800/50">
              <div className="p-4">
                <h3 className="text-sm text-slate-400">Residual</h3>
                <p className="kpi">£{Math.round(residual).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferPage() {
  return (
    <div className="p-4 pb-20">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold">Offer Pack</h1>
        </div>
        <div className="card-body">
          <p className="text-slate-300 mb-6">
            Generate professional offer documentation
          </p>
          <button className="btn w-full">Export PDF</button>
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  
  const item = (path: string, icon: string, label: string) => (
    <button 
      onClick={() => nav(path)} 
      className={`${pathname === path ? "active" : ""} flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <nav className="bottom-nav">
      <ul className="px-2">
        <li className="contents">
          {item("/", "🏠", "Home")}
          {item("/survey", "🗺️", "Survey")}
          {item("/layout", "🏗️", "Layout")}
          {item("/finance", "💰", "Finance")}
          {item("/offer", "📄", "Offer")}
        </li>
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/layout" element={<LayoutPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/offer" element={<OfferPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
