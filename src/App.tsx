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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1">
          {tabs.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium text-sm rounded-t-lg
                transition-colors
                ${location.pathname === path
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Viability Badge Component
function ViabilityBadge({ status, className = "" }: { status: 'viable' | 'at-risk' | 'unviable'; className?: string }) {
  const config = {
    viable: { label: 'Viable', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    'at-risk': { label: 'At Risk', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    unviable: { label: 'Unviable', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  };

  const { label, bg, text, border } = config[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${bg} ${text} ${border} ${className}`}>
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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Project Survey</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                value={project.meta.name}
                onChange={(e) => updateProjectMeta({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Efficiency (%)</label>
              <NumberInput
                value={project.survey.efficiency}
                onChange={(value) => updateSurvey({ efficiency: value })}
                min={0}
                max={100}
                suffix="%"
                className="w-full"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Site Information</h3>
              <p className="text-sm text-gray-600">{formatArea(project.survey.siteAreaM2)}</p>
              {computedTotals.gdv > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  GDV: {formatCurrency(computedTotals.gdv)}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2">Site Boundary</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Unit Schedule</h2>
          <ViabilityBadge status={computedTotals.viabilityStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">House Types</h3>

            <div className="space-y-3">
              {project.layout.houseTypes.map((houseType) => (
                <div key={houseType.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{houseType.name}</h4>
                      <p className="text-sm text-gray-600">{houseType.beds} beds • {formatNumber(houseType.giaSqft)} sqft</p>
                    </div>
                    {!houseType.isDefault && (
                      <button
                        onClick={() => deleteHouseType(houseType.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">Build Cost (£/sqft)</label>
                      <NumberInput
                        value={houseType.buildCostPerSqft}
                        onChange={(value) => updateHouseType(houseType.id, { buildCostPerSqft: value })}
                        prefix="£"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Sale Price (£/sqft)</label>
                      <NumberInput
                        value={houseType.salePricePerSqft}
                        onChange={(value) => updateHouseType(houseType.id, { salePricePerSqft: value })}
                        prefix="£"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm font-medium">Units: {getUnitMixCount(houseType.id)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const currentCount = getUnitMixCount(houseType.id);
                          if (currentCount > 0) {
                            updateUnitMixCount(houseType.id, currentCount - 1);
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        onClick={() => addToUnitMix(houseType.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showAddHouseType ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add House Type</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="House type name"
                    value={newHouseType.name}
                    onChange={(e) => setNewHouseType({ ...newHouseType, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                      value={newHouseType.beds}
                      onChange={(value) => setNewHouseType({ ...newHouseType, beds: value })}
                      min={1}
                      className="w-full"
                      placeholder="Beds"
                    />
                    <NumberInput
                      value={newHouseType.giaSqft}
                      onChange={(value) => setNewHouseType({ ...newHouseType, giaSqft: value })}
                      min={1}
                      className="w-full"
                      placeholder="GIA sqft"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                      value={newHouseType.buildCostPerSqft}
                      onChange={(value) => setNewHouseType({ ...newHouseType, buildCostPerSqft: value })}
                      min={0}
                      prefix="£"
                      className="w-full"
                      placeholder="Build cost/sqft"
                    />
                    <NumberInput
                      value={newHouseType.salePricePerSqft}
                      onChange={(value) => setNewHouseType({ ...newHouseType, salePricePerSqft: value })}
                      min={0}
                      prefix="£"
                      className="w-full"
                      placeholder="Sale price/sqft"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddHouseType}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddHouseType(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddHouseType(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                <Plus className="mx-auto mb-2" size={24} />
                Add House Type
              </button>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-3">Project Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span>Total Units:</span>
                <span className="font-medium">
                  {project.layout.unitMix.reduce((sum, um) => sum + um.count, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GDV:</span>
                <span className="font-medium text-green-600">{formatCurrency(computedTotals.gdv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Build Cost:</span>
                <span className="font-medium">{formatCurrency(computedTotals.buildCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Residual:</span>
                <span className={`font-medium ${computedTotals.residual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(computedTotals.residual)}
                </span>
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Financial Appraisal</h2>
          <ViabilityBadge status={computedTotals.viabilityStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-4">Assumptions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fees (%)</label>
                <NumberInput
                  value={project.finance.feesPct}
                  onChange={(value) => updateFinance({ feesPct: value })}
                  min={0}
                  suffix="%"
                  decimals={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contingency (%)</label>
                <NumberInput
                  value={project.finance.contPct}
                  onChange={(value) => updateFinance({ contPct: value })}
                  min={0}
                  suffix="%"
                  decimals={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Profit (%)</label>
                <NumberInput
                  value={project.finance.targetProfitPct}
                  onChange={(value) => updateFinance({ targetProfitPct: value })}
                  min={0}
                  suffix="%"
                  decimals={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Finance Rate (%)</label>
                <NumberInput
                  value={project.finance.financeRatePct}
                  onChange={(value) => updateFinance({ financeRatePct: value })}
                  min={0}
                  suffix="%"
                  decimals={2}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Finance Period (months)</label>
                <NumberInput
                  value={project.finance.financeMonths}
                  onChange={(value) => updateFinance({ financeMonths: value })}
                  min={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Land Acquisition Costs</label>
                <NumberInput
                  value={project.finance.landAcqCosts}
                  onChange={(value) => updateFinance({ landAcqCosts: value })}
                  min={0}
                  prefix="£"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Results</h3>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-700 mb-1">Gross Development Value</div>
                <div className="text-2xl font-bold text-green-800">{formatCurrency(computedTotals.gdv)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Build Cost</div>
                  <div className="text-lg font-semibold">{formatCurrency(computedTotals.buildCost)}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Fees</div>
                  <div className="text-lg font-semibold">{formatCurrency(computedTotals.fees)}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Contingency</div>
                  <div className="text-lg font-semibold">{formatCurrency(computedTotals.contingency)}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Finance Cost</div>
                  <div className="text-lg font-semibold">{formatCurrency(computedTotals.financeCost)}</div>
                </div>
              </div>

              <div className={`rounded-lg p-4 ${computedTotals.residual >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-sm mb-1 ${computedTotals.residual >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  Residual Land Value
                </div>
                <div className={`text-2xl font-bold ${computedTotals.residual >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {formatCurrency(computedTotals.residual)}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-700 mb-1">Profit %</div>
                <div className="text-xl font-bold text-blue-800">{formatNumber(computedTotals.profitPct, 1)}%</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((computedTotals.profitPct / project.finance.targetProfitPct) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Target: {project.finance.targetProfitPct}%
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Market Evidence</h2>
          <div className="flex items-center gap-4">
            {project.market.derivedPricePerSqft && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Use market pricing:</label>
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
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-700 mb-1">Market-Derived Price per Sqft</div>
            <div className="text-xl font-bold text-blue-800">
              £{formatNumber(project.market.derivedPricePerSqft)}
            </div>
            {project.market.useMarketPricing && (
              <div className="text-xs text-blue-600 mt-1">
                Currently applied to GDV calculations
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {project.market.comps.map((comp) => (
            <div key={comp.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{comp.address}</h4>
                  <p className="text-sm text-gray-600">
                    {comp.beds} beds • {comp.propertyType} • {formatCurrency(comp.priceGBP)} • £{comp.pricePerSqft}/sqft
                  </p>
                </div>
                <button
                  onClick={() => deleteComp(comp.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <NumberInput
                  value={comp.priceGBP}
                  onChange={(value) => updateComp(comp.id, { priceGBP: value })}
                  prefix="£"
                  className="w-full"
                />
                <NumberInput
                  value={comp.giaSqft}
                  onChange={(value) => updateComp(comp.id, { giaSqft: value })}
                  suffix=" sqft"
                  className="w-full"
                />
                <input
                  type="date"
                  value={comp.date.split('T')[0]}
                  onChange={(e) => updateComp(comp.id, { date: e.target.value + 'T00:00:00.000Z' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="text-sm font-medium px-3 py-2 bg-gray-50 rounded-md">
                  £{comp.pricePerSqft}/sqft
                </div>
              </div>
            </div>
          ))}
        </div>

        {showAddComp ? (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mt-4">
            <h4 className="font-medium mb-3">Add Comparable</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Address"
                value={newComp.address}
                onChange={(e) => setNewComp({ ...newComp, address: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Postcode"
                value={newComp.postcode}
                onChange={(e) => setNewComp({ ...newComp, postcode: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <NumberInput
                value={newComp.beds}
                onChange={(value) => setNewComp({ ...newComp, beds: value })}
                min={1}
                placeholder="Beds"
                className="w-full"
              />
              <select
                value={newComp.propertyType}
                onChange={(e) => setNewComp({ ...newComp, propertyType: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md"
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
                className="w-full"
              />
              <NumberInput
                value={newComp.giaSqft}
                onChange={(value) => setNewComp({ ...newComp, giaSqft: value })}
                min={1}
                placeholder="GIA sqft"
                className="w-full"
              />
              <input
                type="date"
                value={newComp.date}
                onChange={(e) => setNewComp({ ...newComp, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddComp}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Comparable
              </button>
              <button
                onClick={() => setShowAddComp(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddComp(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 mt-4"
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Offer Summary</h2>
          <ViabilityBadge status={computedTotals.viabilityStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-4">Project Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Project:</span>
                <span className="font-medium">{project.meta.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Site Area:</span>
                <span className="font-medium">
                  {project.survey.siteAreaM2 > 0 
                    ? `${formatNumber(project.survey.siteAreaM2)} m²` 
                    : 'Not defined'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Efficiency:</span>
                <span className="font-medium">{project.survey.efficiency}%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Units:</span>
                <span className="font-medium">
                  {project.layout.unitMix.reduce((sum, um) => sum + um.count, 0)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>GDV:</span>
                <span className="font-medium text-green-600">{formatCurrency(computedTotals.gdv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Costs:</span>
                <span className="font-medium">{formatCurrency(computedTotals.totalCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Profit:</span>
                <span className="font-medium">{formatCurrency(computedTotals.targetProfit)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span>Residual Land Value:</span>
                <span className={`font-bold ${computedTotals.residual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(computedTotals.residual)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profit Margin:</span>
                <span className="font-medium">{formatNumber(computedTotals.profitPct, 1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Recommended Offer</h3>
              <p className="text-sm text-gray-600">
                Based on current assumptions and market conditions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(Math.max(0, computedTotals.residual))}
              </div>
              <div className="text-sm text-gray-600">Maximum bid</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export PDF
          </button>
          <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
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
    <div className="min-h-screen bg-gray-50">
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