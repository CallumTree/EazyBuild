
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./index.css";

function HomePage() {
  const navigate = useNavigate();
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
            <button onClick={() => navigate("/survey")} className="btn">
              <span>📍</span>
              Start Survey
            </button>
            <button onClick={() => navigate("/offer")} className="btn-ghost">
              <span>📄</span>
              View Offer Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          <button className="btn">
            <span>💾</span>
            Save & Continue
          </button>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300">House Type</th>
                  <th className="text-left py-3 px-4 text-slate-300">Count</th>
                  <th className="text-left py-3 px-4 text-slate-300">Floor area (m²)</th>
                  <th className="text-left py-3 px-4 text-slate-300">GDV per unit (£)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4">4-bed detached</td>
                  <td className="py-3 px-4">
                    <input className="input w-20" type="number" defaultValue={2}/>
                  </td>
                  <td className="py-3 px-4">120</td>
                  <td className="py-3 px-4">£350,000</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4">3-bed semi</td>
                  <td className="py-3 px-4">
                    <input className="input w-20" type="number" defaultValue={4}/>
                  </td>
                  <td className="py-3 px-4">95</td>
                  <td className="py-3 px-4">£280,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="btn">
            <span>➕</span>
            Add House Type
          </button>
        </div>
      </div>
    </div>
  );
}

function FinancePage() {
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
              <label className="label">Fees %</label>
              <input className="input" type="number" defaultValue={5}/>
            </div>
            <div>
              <label className="label">Contingency %</label>
              <input className="input" type="number" defaultValue={10}/>
            </div>
            <div>
              <label className="label">Target Profit %</label>
              <input className="input" type="number" defaultValue={20}/>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="label">Land Acquisition Costs (£)</label>
              <input className="input" type="number" defaultValue={25000}/>
            </div>
            <div>
              <label className="label">Finance Rate %</label>
              <input className="input" type="number" defaultValue={8.5}/>
            </div>
            <div>
              <label className="label">Finance Duration (months)</label>
              <input className="input" type="number" defaultValue={18}/>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">📊</span>
          <h2 className="card-title">Development Appraisal</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <div className="text-slate-300 mb-2 text-sm">GDV</div>
              <div className="kpi">£1,820,000</div>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div className="text-slate-300 mb-2 text-sm">Build Cost</div>
              <div className="kpi text-amber-300">£945,000</div>
            </div>
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="text-slate-300 mb-2 text-sm">Finance Cost</div>
              <div className="kpi text-red-300">£95,000</div>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="text-slate-300 mb-2 text-sm">Residual Land Value</div>
              <div className="kpi text-emerald-300">£416,000</div>
            </div>
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
              <div className="text-2xl font-bold text-sky-400">£1,820,000</div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl">
              <div className="text-sm text-slate-400 mb-2">Residual Land Value</div>
              <div className="text-2xl font-bold text-emerald-400">£416,000</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn">
              <span>📄</span>
              Export PDF
            </button>
            <button className="btn-ghost">
              <span>👁️</span>
              Preview
            </button>
          </div>
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

function Shell() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/survey" element={<SurveyPage/>} />
        <Route path="/layout" element={<LayoutPage/>} />
        <Route path="/finance" element={<FinancePage/>} />
        <Route path="/offer" element={<OfferPage/>} />
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
