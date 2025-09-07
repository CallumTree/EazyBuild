
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, LayoutGrid, PoundSterling, FileText } from "lucide-react";
import { HomePage } from "./pages/HomePage";
import { MapPage } from "./pages/MapPage";
import { ProjectPage } from "./pages/ProjectPage";
import { FinancePage } from "./pages/FinancePage";
import "./index.css";

function SurveyPage() {
  return (
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
              <input className="input" placeholder="Enter project name"/>
            </div>
            <div>
              <label className="label">Site efficiency (%)</label>
              <input className="input" type="number" defaultValue={65}/>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn flex-1 sm:flex-none">
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
        <div className="card-body space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">House Type</label>
              <select className="select">
                <option>4-bed detached</option>
                <option>3-bed detached</option>
                <option>3-bed semi</option>
                <option>2-bed semi</option>
              </select>
            </div>
            <div>
              <label className="label">Count</label>
              <input className="input" type="number" defaultValue={4}/>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">Floor area (m²)</label>
              <input className="input" type="number" defaultValue={120}/>
            </div>
            <div>
              <label className="label">GDV per unit (£)</label>
              <input className="input" type="number" defaultValue={350000}/>
            </div>
          </div>
          <button className="btn">
            <span>➕</span>
            Add to Mix
          </button>
        </div>
      </div>
    </div>
  );
}

function ModernFinancePage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">💰</span>
          <h2 className="card-title">Finance & Appraisal</h2>
        </div>
        <div className="card-body space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="label">Build cost £/m²</label>
              <input className="input" type="number" defaultValue={1650}/>
            </div>
            <div>
              <label className="label">Fees %</label>
              <input className="input" type="number" defaultValue={5}/>
            </div>
            <div>
              <label className="label">Contingency %</label>
              <input className="input" type="number" defaultValue={10}/>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">Land acquisition costs (£)</label>
              <input className="input" type="number" defaultValue={25000}/>
            </div>
            <div>
              <label className="label">Finance rate %</label>
              <input className="input" type="number" defaultValue={8.5}/>
            </div>
          </div>
          <div className="mt-8 p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <div className="text-slate-300 mb-3 font-medium">Residual Land Value</div>
            <div className="kpi">£480,000</div>
          </div>
        </div>
      </div>
    </div>
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
            <h3 className="font-semibold mb-4 text-lg">Recent Projects</h3>
            <p className="text-slate-400">No projects yet. Create your first project above.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold mb-4 text-lg">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Total projects:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Avg. margin:</span>
                <span className="font-medium">N/A</span>
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
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
