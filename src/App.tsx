import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, LayoutGrid, PoundSterling, FileText, Plus, Minus, TrendingUp } from "lucide-react";
import { InteractiveMap } from "./components/InteractiveMap";
import { NumberInput, formatCurrency, formatNumber } from "./components/NumberInput";
import { useGlobalStore, HouseType, Comp } from "./store/globalStore";
import "./index.css";

// Navigation component
function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'survey', label: 'Survey', icon: Map, path: '/' },
    { id: 'layout', label: 'Layout', icon: LayoutGrid, path: '/layout' },
    { id: 'finance', label: 'Finance', icon: PoundSterling, path: '/finance' },
    { id: 'market', label: 'Market', icon: TrendingUp, path: '/market' },
    { id: 'offer', label: 'Offer', icon: FileText, path: '/offer' },
  ];

  return (
    <nav className="bottom-nav">
      <ul>
        {tabs.map(({ id, label, icon: Icon, path }) => (
          <li key={id}>
            <button
              onClick={() => navigate(path)}
              className={`${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Viability Badge Component
function ViabilityBadge({ status, className = "" }: { status: 'viable' | 'at-risk' | 'unviable'; className?: string }) {
  const config = {
    viable: { label: 'Viable', bg: 'bg-green-500', text: 'text-white' },
    'at-risk': { label: 'At Risk', bg: 'bg-amber-500', text: 'text-white' },
    unviable: { label: 'Unviable', bg: 'bg-red-500', text: 'text-white' },
  };

  const { label, bg, text } = config[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bg} ${text} ${className}`}>
      {label}
    </span>
  );
}

// Survey Page
function SurveyPage() {
  const { project, updateProjectMeta, updateSurvey, updateBoundary, computedTotals } = useGlobalStore();

  const formatArea = (areaM2: number) => {
    if (areaM2 === 0) return "No boundary drawn";
    const hectares = areaM2 / 10000;
    const acres = areaM2 * 0.000247105;
    return `${areaM2.toLocaleString()} m² • ${hectares.toFixed(2)} ha • ${acres.toFixed(2)} ac`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Project Survey</h2>
        </div>

        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="label">Project Name</label>
                <input
                  type="text"
                  value={project.meta.name}
                  onChange={(e) => updateProjectMeta({ name: e.target.value })}
                  className="input"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="label">Efficiency (%)</label>
                <NumberInput
                  value={project.survey.efficiency}
                  onChange={(value) => updateSurvey({ efficiency: value })}
                  min={0}
                  max={100}
                  suffix="%"
                  className="input"
                />
              </div>

              <div className="p-4 bg-slate-800 rounded-2xl">
                <h3 className="font-medium text-slate-200 mb-2">Site Information</h3>
                <p className="text-sm text-slate-300">{formatArea(project.survey.siteAreaM2)}</p>
                {computedTotals.gdv > 0 && (
                  <p className="text-sm text-green-400 mt-2 kpi">
                    GDV: {formatCurrency(computedTotals.gdv)}
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="label">Site Boundary</label>
              <InteractiveMap
                boundary={project.survey.boundary}
                onBoundaryChange={updateBoundary}
                onAreaChange={() => {}} // Area is calculated in updateBoundary
                className="h-96"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Layout Page
function LayoutPage() {
  const { 
    project, 
    computedTotals,
    addHouseType, 
    updateHouseType, 
    deleteHouseType,
    addToUnitMix,
    updateUnitMixCount,
    removeFromUnitMix
  } = useGlobalStore();

  const [showAddHouseType, setShowAddHouseType] = useState(false);
  const [newHouseType, setNewHouseType] = useState({
    name: '', beds: 2, giaSqft: 1000, buildCostPerSqft: 150, salePricePerSqft: 300
  });

  const handleAddHouseType = () => {
    if (!newHouseType.name.trim()) return;
    addHouseType({ ...newHouseType, isDefault: false });
    setNewHouseType({ name: '', beds: 2, giaSqft: 1000, buildCostPerSqft: 150, salePricePerSqft: 300 });
    setShowAddHouseType(false);
  };

  const getUnitMixCount = (houseTypeId: string) => {
    return project.layout.unitMix.find(um => um.houseTypeId === houseTypeId)?.count || 0;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Unit Schedule</h2>
          <ViabilityBadge status={computedTotals.viabilityStatus} />
        </div>

        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-lg text-slate-200 mb-3">House Types</h3>

              <div className="space-y-3">
                {project.layout.houseTypes.map((houseType) => (
                  <div key={houseType.id} className="card-body border border-slate-700 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-slate-100">{houseType.name}</h4>
                        <p className="text-sm text-slate-300">{houseType.beds} beds • {formatNumber(houseType.giaSqft)} sqft</p>
                      </div>
                      {!houseType.isDefault && (
                        <button
                          onClick={() => deleteHouseType(houseType.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="label">Build Cost (£/sqft)</label>
                        <NumberInput
                          value={houseType.buildCostPerSqft}
                          onChange={(value) => updateHouseType(houseType.id, { buildCostPerSqft: value })}
                          prefix="£"
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Sale Price (£/sqft)</label>
                        <NumberInput
                          value={houseType.salePricePerSqft}
                          onChange={(value) => updateHouseType(houseType.id, { salePricePerSqft: value })}
                          prefix="£"
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                      <span className="text-sm font-medium text-slate-200">Units: {getUnitMixCount(houseType.id)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const currentCount = getUnitMixCount(houseType.id);
                            if (currentCount > 0) {
                              updateUnitMixCount(houseType.id, currentCount - 1);
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded"
                        >
                          <Minus size={16} className="text-slate-300" />
                        </button>
                        <button
                          onClick={() => addToUnitMix(houseType.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-brand-500 hover:bg-brand-600 rounded"
                        >
                          <Plus size={16} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showAddHouseType ? (
                <div className="border border-slate-700 rounded-2xl p-4 bg-slate-800">
                  <h4 className="font-medium text-slate-100 mb-3">Add House Type</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="House type name"
                      value={newHouseType.name}
                      onChange={(e) => setNewHouseType({ ...newHouseType, name: e.target.value })}
                      className="input"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <NumberInput
                        value={newHouseType.beds}
                        onChange={(value) => setNewHouseType({ ...newHouseType, beds: value })}
                        min={1}
                        className="input"
                        placeholder="Beds"
                      />
                      <NumberInput
                        value={newHouseType.giaSqft}
                        onChange={(value) => setNewHouseType({ ...newHouseType, giaSqft: value })}
                        min={1}
                        className="input"
                        placeholder="GIA sqft"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberInput
                        value={newHouseType.buildCostPerSqft}
                        onChange={(value) => setNewHouseType({ ...newHouseType, buildCostPerSqft: value })}
                        min={0}
                        prefix="£"
                        className="input"
                        placeholder="Build cost/sqft"
                      />
                      <NumberInput
                        value={newHouseType.salePricePerSqft}
                        onChange={(value) => setNewHouseType({ ...newHouseType, salePricePerSqft: value })}
                        min={0}
                        prefix="£"
                        className="input"
                        placeholder="Sale price/sqft"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddHouseType}
                        className="btn"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddHouseType(false)}
                        className="btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddHouseType(true)}
                  className="w-full p-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-400 hover:border-slate-600 hover:text-slate-300"
                >
                  <Plus className="mx-auto mb-2" size={24} />
                  Add House Type
                </button>
              )}
            </div>

            <div>
              <h3 className="font-medium text-lg text-slate-200 mb-3">Project Summary</h3>
              <div className="card-body space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Units:</span>
                  <span className="font-medium text-slate-100">
                    {project.layout.unitMix.reduce((sum, um) => sum + um.count, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">GDV:</span>
                  <span className="font-medium text-green-400 kpi"> {formatCurrency(computedTotals.gdv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Build Cost:</span>
                  <span className="font-medium text-slate-100">{formatCurrency(computedTotals.buildCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Residual:</span>
                  <span className={`font-medium ${computedTotals.residual >= 0 ? 'text-green-400' : 'text-red-400'} kpi`}>
                    {formatCurrency(computedTotals.residual)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Finance Page
function FinancePage() {
  const { project, updateFinance, computedTotals } = useGlobalStore();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Financial Appraisal</h2>
          <ViabilityBadge status={computedTotals.viabilityStatus} />
        </div>

        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-lg text-slate-200 mb-4">Assumptions</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Fees (%)</label>
                  <NumberInput
                    value={project.finance.feesPct}
                    onChange={(value) => updateFinance({ feesPct: value })}
                    min={0}
                    suffix="%"
                    decimals={1}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Contingency (%)</label>
                  <NumberInput
                    value={project.finance.contPct}
                    onChange={(value) => updateFinance({ contPct: value })}
                    min={0}
                    suffix="%"
                    decimals={1}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Target Profit (%)</label>
                  <NumberInput
                    value={project.finance.targetProfitPct}
                    onChange={(value) => updateFinance({ targetProfitPct: value })}
                    min={0}
                    suffix="%"
                    decimals={1}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Finance Rate (%)</label>
                  <NumberInput
                    value={project.finance.financeRatePct}
                    onChange={(value) => updateFinance({ financeRatePct: value })}
                    min={0}
                    suffix="%"
                    decimals={2}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Finance Period (months)</label>
                  <NumberInput
                    value={project.finance.financeMonths}
                    onChange={(value) => updateFinance({ financeMonths: value })}
                    min={1}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Land Acquisition Costs</label>
                  <NumberInput
                    value={project.finance.landAcqCosts}
                    onChange={(value) => updateFinance({ landAcqCosts: value })}
                    min={0}
                    prefix="£"
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg text-slate-200 mb-4">Results</h3>
              <div className="space-y-4">
                <div className="bg-green-500 rounded-2xl p-4">
                  <div className="text-sm text-white mb-1">Gross Development Value</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(computedTotals.gdv)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="card-body">
                    <div className="text-sm text-slate-300 mb-1">Build Cost</div>
                    <div className="text-lg font-semibold text-slate-100">{formatCurrency(computedTotals.buildCost)}</div>
                  </div>

                  <div className="card-body">
                    <div className="text-sm text-slate-300 mb-1">Fees</div>
                    <div className="text-lg font-semibold text-slate-100">{formatCurrency(computedTotals.fees)}</div>
                  </div>

                  <div className="card-body">
                    <div className="text-sm text-slate-300 mb-1">Contingency</div>
                    <div className="text-lg font-semibold text-slate-100">{formatCurrency(computedTotals.contingency)}</div>
                  </div>

                  <div className="card-body">
                    <div className="text-sm text-slate-300 mb-1">Finance Cost</div>
                    <div className="text-lg font-semibold text-slate-100">{formatCurrency(computedTotals.financeCost)}</div>
                  </div>
                </div>

                <div className={`rounded-2xl p-4 ${computedTotals.residual >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  <div className={`text-sm mb-1 ${computedTotals.residual >= 0 ? 'text-white' : 'text-white'}`}>
                    Residual Land Value
                  </div>
                  <div className={`text-2xl font-bold ${computedTotals.residual >= 0 ? 'text-white' : 'text-white'}`}>
                    {formatCurrency(computedTotals.residual)}
                  </div>
                </div>

                <div className="bg-brand-500 rounded-2xl p-4">
                  <div className="text-sm text-white mb-1">Profit %</div>
                  <div className="text-xl font-bold text-white">{formatNumber(computedTotals.profitPct, 1)}%</div>
                  <div className="w-full bg-brand-400 rounded-full h-2 mt-2">
                    <div 
                      className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((computedTotals.profitPct / project.finance.targetProfitPct) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-brand-300 mt-1">
                    Target: {project.finance.targetProfitPct}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Market Evidence Page
function MarketPage() {
  const { project, updateMarket, addComp, updateComp, deleteComp, computedTotals } = useGlobalStore();
  const [showAddComp, setShowAddComp] = useState(false);
  const [newComp, setNewComp] = useState({
    address: '', postcode: '', beds: 3, propertyType: 'detached' as const, 
    date: new Date().toISOString().split('T')[0], priceGBP: 0, giaSqft: 0, notes: ''
  });

  const handleAddComp = () => {
    if (!newComp.address.trim() || newComp.priceGBP === 0 || newComp.giaSqft === 0) return;
    addComp(newComp);
    setNewComp({
      address: '', postcode: '', beds: 3, propertyType: 'detached',
      date: new Date().toISOString().split('T')[0], priceGBP: 0, giaSqft: 0, notes: ''
    });
    setShowAddComp(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Market Evidence</h2>
          <div className="flex items-center gap-4">
            {project.market.derivedPricePerSqft && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-200">Use market pricing:</label>
                <input
                  type="checkbox"
                  checked={project.market.useMarketPricing}
                  onChange={(e) => updateMarket({ useMarketPricing: e.target.checked })}
                  className="rounded"
                />
              </div>
            )}
            <ViabilityBadge status={computedTotals.viabilityStatus} />
          </div>
        </div>

        {project.market.derivedPricePerSqft && (
          <div className="bg-brand-500 rounded-2xl p-4 mb-6">
            <div className="text-sm text-white mb-1">Market-Derived Price per Sqft</div>
            <div className="text-xl font-bold text-white">
              £{formatNumber(project.market.derivedPricePerSqft)}
            </div>
            {project.market.useMarketPricing && (
              <div className="text-xs text-brand-300 mt-1">
                Currently applied to GDV calculations
              </div>
            )}
          </div>
        )}

        <div className="card-body space-y-4">
          {project.market.comps.map((comp) => (
            <div key={comp.id} className="card-body border border-slate-700 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-slate-100">{comp.address}</h4>
                  <p className="text-sm text-slate-300">
                    {comp.beds} beds • {comp.propertyType} • {formatCurrency(comp.priceGBP)} • £{comp.pricePerSqft}/sqft
                  </p>
                </div>
                <button
                  onClick={() => deleteComp(comp.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <NumberInput
                  value={comp.priceGBP}
                  onChange={(value) => updateComp(comp.id, { priceGBP: value })}
                  prefix="£"
                  className="input"
                />
                <NumberInput
                  value={comp.giaSqft}
                  onChange={(value) => updateComp(comp.id, { giaSqft: value })}
                  suffix=" sqft"
                  className="input"
                />
                <input
                  type="date"
                  value={comp.date.split('T')[0]}
                  onChange={(e) => updateComp(comp.id, { date: e.target.value + 'T00:00:00.000Z' })}
                  className="input"
                />
                <div className="text-sm font-medium px-3 py-2 bg-slate-800 rounded-xl text-slate-100">
                  £{comp.pricePerSqft}/sqft
                </div>
              </div>
            </div>
          ))}
        </div>

        {showAddComp ? (
          <div className="border border-slate-700 rounded-2xl p-4 bg-slate-800 mt-4">
            <h4 className="font-medium text-slate-100 mb-3">Add Comparable</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Address"
                value={newComp.address}
                onChange={(e) => setNewComp({ ...newComp, address: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Postcode"
                value={newComp.postcode}
                onChange={(e) => setNewComp({ ...newComp, postcode: e.target.value })}
                className="input"
              />
              <NumberInput
                value={newComp.beds}
                onChange={(value) => setNewComp({ ...newComp, beds: value })}
                min={1}
                placeholder="Beds"
                className="input"
              />
              <select
                value={newComp.propertyType}
                onChange={(e) => setNewComp({ ...newComp, propertyType: e.target.value as any })}
                className="input"
              >
                <option value="detached">Detached</option>
                <option value="semi">Semi-detached</option>
                <option value="terraced">Terraced</option>
                <option value="flat">Flat</option>
                <option value="bungalow">Bungalow</option>
                <option value="other">Other</option>
              </select>
              <NumberInput
                value={newComp.priceGBP}
                onChange={(value) => setNewComp({ ...newComp, priceGBP: value })}
                min={0}
                prefix="£"
                placeholder="Sale price"
                className="input"
              />
              <NumberInput
                value={newComp.giaSqft}
                onChange={(value) => setNewComp({ ...newComp, giaSqft: value })}
                min={1}
                placeholder="GIA sqft"
                className="input"
              />
              <input
                type="date"
                value={newComp.date}
                onChange={(e) => setNewComp({ ...newComp, date: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddComp}
                className="btn"
              >
                Add Comparable
              </button>
              <button
                onClick={() => setShowAddComp(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddComp(true)}
            className="w-full p-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-400 hover:border-slate-600 hover:text-slate-300 mt-4"
          >
            <Plus className="mx-auto mb-2" size={24} />
            Add Comparable
          </button>
        )}
      </div>
    </div>
  );
}

// Offer Page
function OfferPage() {
  const { project, computedTotals } = useGlobalStore();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Offer Summary</h2>
          <ViabilityBadge status={computedTotals.viabilityStatus} />
        </div>

        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-lg text-slate-200 mb-4">Project Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Project:</span>
                  <span className="font-medium text-slate-100">{project.meta.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Site Area:</span>
                  <span className="font-medium text-slate-100">
                    {project.survey.siteAreaM2 > 0 
                      ? `${formatNumber(project.survey.siteAreaM2)} m²` 
                      : 'Not defined'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Efficiency:</span>
                  <span className="font-medium text-slate-100">{project.survey.efficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Units:</span>
                  <span className="font-medium text-slate-100">
                    {project.layout.unitMix.reduce((sum, um) => sum + um.count, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg text-slate-200 mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">GDV:</span>
                  <span className="font-medium text-green-400 kpi">{formatCurrency(computedTotals.gdv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Costs:</span>
                  <span className="font-medium text-slate-100">{formatCurrency(computedTotals.totalCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Target Profit:</span>
                  <span className="font-medium text-slate-100">{formatCurrency(computedTotals.targetProfit)}</span>
                </div>
                <hr className="border-slate-700" />
                <div className="flex justify-between text-lg">
                  <span className="text-slate-200">Residual Land Value:</span>
                  <span className={`font-bold ${computedTotals.residual >= 0 ? 'text-green-400' : 'text-red-400'} kpi`}>
                    {formatCurrency(computedTotals.residual)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Profit Margin:</span>
                  <span className="font-medium text-slate-100">{formatNumber(computedTotals.profitPct, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-slate-100">Recommended Offer</h3>
              <p className="text-sm text-slate-400">
                Based on current assumptions and market conditions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand-500">
                {formatCurrency(Math.max(0, computedTotals.residual))}
              </div>
              <div className="text-sm text-slate-400">Maximum bid</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="btn">
            Export PDF
          </button>
          <button className="btn-ghost">
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function AppContent() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<SurveyPage />} />
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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}