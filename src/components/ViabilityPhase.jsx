
import React, { useState, useEffect } from 'react';
import { getProject, updateProject } from '../utils/storage';
import { calcViability, getStatusAndLevers } from '../utils/calculators';

export function ViabilityPhase({ projectId, onBack, onNext }) {
  const [project, setProject] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showScenario, setShowScenario] = useState(false);

  // Baseline costs
  const [landCost, setLandCost] = useState('');
  const [buildCost, setBuildCost] = useState('');
  const [infraCost, setInfraCost] = useState('');

  // Plot Surveys
  const [valuation, setValuation] = useState('500');
  const [topo, setTopo] = useState('800');
  const [structural, setStructural] = useState('1200');

  // LA Fees
  const [planningApp, setPlanningApp] = useState('1000');
  const [cil, setCil] = useState('100');
  const [s106Pct, setS106Pct] = useState('15');
  const [waiveS106, setWaiveS106] = useState(false);

  // Pro Fees
  const [architect, setArchitect] = useState('15000');
  const [ecology, setEcology] = useState('3000');
  const [engineers, setEngineers] = useState('7000');
  const [qspm, setQspm] = useState('15000');
  const [otherSurveys, setOtherSurveys] = useState('4000');

  // Site Prep
  const [demolition, setDemolition] = useState('30000');
  const [contamination, setContamination] = useState('20000');
  const [utilities, setUtilities] = useState('25000');
  const [highways, setHighways] = useState('10000');

  // Adders
  const [contingency, setContingency] = useState(10);
  const [lenderFee, setLenderFee] = useState(2);

  useEffect(() => {
    const proj = getProject(projectId);
    if (proj) {
      setProject(proj);
      
      // Pre-fill from project if available
      if (proj.costs) {
        setLandCost(proj.costs.land || '');
        setBuildCost(proj.costs.build || '');
        setInfraCost(proj.costs.infra || '');
      } else {
        // Default build cost estimate
        const totalAreaM2 = (proj.unitMix || []).reduce((sum, row) => {
          return sum + (parseInt(row.units) || 0) * (parseFloat(row.sizeM2) || 0);
        }, 0);
        setBuildCost(String(Math.round(totalAreaM2 * 1500)));
        
        // Default infra as 5% of GDV estimate
        const gdv = (proj.unitMix || []).reduce((sum, row) => {
          return sum + (parseInt(row.units) || 0) * (parseFloat(row.salesPrice) || 0);
        }, 0);
        setInfraCost(String(Math.round(gdv * 0.05)));
      }
    }
  }, [projectId]);

  if (!project) {
    return <div className="container py-8">Loading...</div>;
  }

  // Calculate GDV from mix
  const gdv = (project.unitMix || []).reduce((sum, row) => {
    return sum + (parseInt(row.units) || 0) * (parseFloat(row.salesPrice) || 0);
  }, 0);

  const totalUnits = (project.unitMix || []).reduce((sum, row) => {
    return sum + (parseInt(row.units) || 0);
  }, 0);

  const totalAreaM2 = (project.unitMix || []).reduce((sum, row) => {
    return sum + (parseInt(row.units) || 0) * (parseFloat(row.sizeM2) || 0);
  }, 0);

  // Calculate fees
  const surveysTotal = parseFloat(valuation) + parseFloat(topo) + parseFloat(structural);
  const cilTotal = parseFloat(cil) * (project.siteAreaM2 || 0);
  const s106Total = waiveS106 ? 0 : (gdv * parseFloat(s106Pct)) / 100;
  const laTotal = parseFloat(planningApp) + cilTotal + s106Total;
  const proTotal = parseFloat(architect) + parseFloat(ecology) + parseFloat(engineers) + parseFloat(qspm) + parseFloat(otherSurveys);
  const sitePrepTotal = parseFloat(demolition) + parseFloat(contamination) + parseFloat(utilities) + parseFloat(highways);
  const totalFees = surveysTotal + laTotal + proTotal + sitePrepTotal;

  // Build costs object
  const costsObj = {
    land: parseFloat(landCost) || 0,
    build: parseFloat(buildCost) || 0,
    infra: parseFloat(infraCost) || 0,
    fees: totalFees
  };

  const adders = {
    contingency: contingency / 100,
    lender: lenderFee / 100
  };

  // Calculate viability
  const results = calcViability(gdv, costsObj, adders, 20);
  const statusInfo = getStatusAndLevers(results, costsObj, s106Total, parseFloat(architect), parseFloat(landCost) || 0);

  // Scenario analysis (+10% sales, -10% costs)
  const scenarioGdv = gdv * 1.1;
  const scenarioCosts = {
    land: costsObj.land,
    build: costsObj.build * 0.9,
    infra: costsObj.infra * 0.9,
    fees: totalFees * 0.9
  };
  const scenarioResults = calcViability(scenarioGdv, scenarioCosts, adders, 20);

  const handleSave = () => {
    updateProject(projectId, {
      costs: {
        land: parseFloat(landCost) || 0,
        build: parseFloat(buildCost) || 0,
        infra: parseFloat(infraCost) || 0,
        fees: {
          surveys: { valuation: parseFloat(valuation), topo: parseFloat(topo), structural: parseFloat(structural) },
          la: { planningApp: parseFloat(planningApp), cil: cilTotal, s106: s106Total },
          pro: { architect: parseFloat(architect), ecology: parseFloat(ecology), engineers: parseFloat(engineers), qspm: parseFloat(qspm), other: parseFloat(otherSurveys) },
          sitePrep: { demolition: parseFloat(demolition), contamination: parseFloat(contamination), utilities: parseFloat(utilities), highways: parseFloat(highways) }
        }
      },
      adders: { contingency: contingency / 100, lender: lenderFee / 100 },
      derived: {
        profit: results.profit,
        pogdv: results.pogdv,
        poc: results.poc,
        residual: results.residual
      }
    });
    onNext();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="app-shell">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            <button onClick={onBack} className="btn-ghost text-sm">
              ← Back
            </button>
            <div className="flex-1">
              <h1 className="card-title text-2xl">💰 Viability Phase: Full Analysis</h1>
              <p className="text-slate-400 mt-1">{project.name}</p>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="kpi-card">
                <div className="kpi-label">Site Area</div>
                <div className="kpi-value text-lg">{(project.siteAreaM2 || 0).toLocaleString()} m²</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Total Units</div>
                <div className="kpi-value text-lg">{totalUnits}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Total Area</div>
                <div className="kpi-value text-lg">{totalAreaM2.toLocaleString()} m²</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">GDV</div>
                <div className="kpi-value text-lg text-green-400">{formatCurrency(gdv)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Baseline Costs */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Baseline Costs</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Land Cost (£)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Leave blank for residual"
                  value={landCost}
                  onChange={(e) => setLandCost(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Build Cost (£)</label>
                <input
                  type="number"
                  className="input-field"
                  value={buildCost}
                  onChange={(e) => setBuildCost(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">Default: £1,500/m²</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Infrastructure (£)</label>
                <input
                  type="number"
                  className="input-field"
                  value={infraCost}
                  onChange={(e) => setInfraCost(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">Roads, drainage, etc.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Fees Panels */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Fees & Additional Costs</h2>
            <button onClick={() => setShowBreakdown(!showBreakdown)} className="btn-ghost text-sm">
              {showBreakdown ? '▼' : '▶'} Show Breakdown
            </button>
          </div>
          <div className="card-body">
            <div className="kpi-card bg-slate-600/20">
              <div className="kpi-label">Total Fees</div>
              <div className="kpi-value text-xl text-amber-400">{formatCurrency(totalFees)}</div>
            </div>

            {showBreakdown && (
              <div className="mt-6 space-y-6">
                {/* Plot Surveys */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Plot Surveys (Total: {formatCurrency(surveysTotal)})</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Valuation (£)</label>
                      <input type="number" className="input-field input-field-sm" value={valuation} onChange={(e) => setValuation(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Topographical (£)</label>
                      <input type="number" className="input-field input-field-sm" value={topo} onChange={(e) => setTopo(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Structural (£)</label>
                      <input type="number" className="input-field input-field-sm" value={structural} onChange={(e) => setStructural(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* LA Fees */}
                <div className="pt-4 border-t border-slate-600">
                  <h3 className="font-semibold text-white mb-3">Local Authority Fees (Total: {formatCurrency(laTotal)})</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Planning App (£)</label>
                      <input type="number" className="input-field input-field-sm" value={planningApp} onChange={(e) => setPlanningApp(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">CIL (£/m²)</label>
                      <input type="number" className="input-field input-field-sm" value={cil} onChange={(e) => setCil(e.target.value)} />
                      <p className="text-xs text-slate-500 mt-1">Total: {formatCurrency(cilTotal)}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">S106 (% GDV)</label>
                      <div className="flex gap-2 items-center">
                        <input type="number" className="input-field input-field-sm" value={s106Pct} onChange={(e) => setS106Pct(e.target.value)} disabled={waiveS106} />
                        <label className="flex items-center gap-1 text-xs text-slate-400">
                          <input type="checkbox" checked={waiveS106} onChange={(e) => setWaiveS106(e.target.checked)} />
                          Waive
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Total: {formatCurrency(s106Total)}</p>
                    </div>
                  </div>
                </div>

                {/* Pro Fees */}
                <div className="pt-4 border-t border-slate-600">
                  <h3 className="font-semibold text-white mb-3">Professional Fees (Total: {formatCurrency(proTotal)})</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Architect (£)</label>
                      <input type="number" className="input-field input-field-sm" value={architect} onChange={(e) => setArchitect(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Ecology (£)</label>
                      <input type="number" className="input-field input-field-sm" value={ecology} onChange={(e) => setEcology(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Structural Engineers (£)</label>
                      <input type="number" className="input-field input-field-sm" value={engineers} onChange={(e) => setEngineers(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">QS/PM (£)</label>
                      <input type="number" className="input-field input-field-sm" value={qspm} onChange={(e) => setQspm(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Other Surveys (£)</label>
                      <input type="number" className="input-field input-field-sm" value={otherSurveys} onChange={(e) => setOtherSurveys(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Site Prep */}
                <div className="pt-4 border-t border-slate-600">
                  <h3 className="font-semibold text-white mb-3">Site Preparation (Total: {formatCurrency(sitePrepTotal)})</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Demolition (£)</label>
                      <input type="number" className="input-field input-field-sm" value={demolition} onChange={(e) => setDemolition(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Ground Contamination (£)</label>
                      <input type="number" className="input-field input-field-sm" value={contamination} onChange={(e) => setContamination(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Utilities Diversion (£)</label>
                      <input type="number" className="input-field input-field-sm" value={utilities} onChange={(e) => setUtilities(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Highways/Hoarding (£)</label>
                      <input type="number" className="input-field input-field-sm" value={highways} onChange={(e) => setHighways(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Adders */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">% Adders</h2>
          </div>
          <div className="card-body">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contingency (%)</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={contingency}
                  onChange={(e) => setContingency(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-400 mt-1">
                  <span>0%</span>
                  <span className="font-medium text-white">{contingency}%</span>
                  <span>20%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Lender Fee (%)</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={lenderFee}
                  onChange={(e) => setLenderFee(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-400 mt-1">
                  <span>0%</span>
                  <span className="font-medium text-white">{lenderFee}%</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Viability Outputs</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="kpi-card">
                <div className="kpi-label">Profit (£)</div>
                <div className={`kpi-value ${results.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(results.profit)}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Profit on GDV (%)</div>
                <div className={`kpi-value ${results.pogdv >= 20 ? 'text-green-400' : results.pogdv >= 15 ? 'text-amber-400' : 'text-red-400'}`}>
                  {results.pogdv.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500 mt-1">Target: 20%</p>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Profit on Cost (%)</div>
                <div className={`kpi-value ${results.poc >= 15 ? 'text-green-400' : results.poc >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                  {results.poc.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500 mt-1">Target: 15%</p>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Residual Land Value</div>
                <div className={`kpi-value ${results.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(results.residual)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Scenario: Sales +10% / Costs -10%</h2>
            <button onClick={() => setShowScenario(!showScenario)} className="btn-ghost text-sm">
              {showScenario ? '▼ Hide' : '▶ Show'}
            </button>
          </div>
          {showScenario && (
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="kpi-card bg-blue-500/10">
                  <div className="kpi-label">Profit (£)</div>
                  <div className="kpi-value text-blue-400">{formatCurrency(scenarioResults.profit)}</div>
                  <p className="text-xs text-green-400 mt-1">+{formatCurrency(scenarioResults.profit - results.profit)}</p>
                </div>
                <div className="kpi-card bg-blue-500/10">
                  <div className="kpi-label">Profit on GDV (%)</div>
                  <div className="kpi-value text-blue-400">{scenarioResults.pogdv.toFixed(1)}%</div>
                  <p className="text-xs text-green-400 mt-1">+{(scenarioResults.pogdv - results.pogdv).toFixed(1)}%</p>
                </div>
                <div className="kpi-card bg-blue-500/10">
                  <div className="kpi-label">Profit on Cost (%)</div>
                  <div className="kpi-value text-blue-400">{scenarioResults.poc.toFixed(1)}%</div>
                  <p className="text-xs text-green-400 mt-1">+{(scenarioResults.poc - results.poc).toFixed(1)}%</p>
                </div>
                <div className="kpi-card bg-blue-500/10">
                  <div className="kpi-label">Residual Land</div>
                  <div className="kpi-value text-blue-400">{formatCurrency(scenarioResults.residual)}</div>
                  <p className="text-xs text-green-400 mt-1">+{formatCurrency(scenarioResults.residual - results.residual)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4">💡 Adjusted for regional uplift</p>
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {statusInfo.status === 'viable' ? '🟢' : statusInfo.status === 'amber' ? '🟡' : '🔴'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-white mb-1">{statusInfo.message}</h3>
                {statusInfo.levers && statusInfo.levers.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {statusInfo.levers.map((lever, i) => (
                      <p key={i} className="text-sm text-slate-300">• {lever}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={onBack} className="btn-secondary">
                  ← Back
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary"
                  disabled={statusInfo.status === 'red'}
                >
                  Next: Report →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
