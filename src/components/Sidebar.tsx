import React, { useState } from 'react';

// Assuming Comparables and Project type are defined elsewhere and imported.
// For demonstration, let's mock them:

// Mock data types
type PropertyType = 'detached' | 'semi-detached' | 'terraced' | 'flat' | 'bungalow' | 'other';

interface Comp {
  id: string;
  address: string;
  postcode: string;
  beds: number | null;
  propertyType: PropertyType;
  date: string; // ISO string
  priceGBP: number;
  giaSqft: number;
  notes?: string;
  pricePerSqft?: number;
}

interface CompSettings {
  includeMonths: number;
  minBeds: number | null;
  maxBeds: number | null;
  iqrK: number;
}

interface Project {
  id: string;
  compsPostcode?: string;
  comps?: Comp[];
  compSettings?: CompSettings;
  // ... other project properties
}

// Mock Comparables component
const Comparables: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [comps, setComps] = useState<Comp[]>([]);
  const [settings, setSettings] = useState<CompSettings>({
    includeMonths: 18,
    minBeds: null,
    maxBeds: null,
    iqrK: 1.5,
  });
  const [postcode, setPostcode] = useState('');
  const [stats, setStats] = useState({
    countUsed: 0,
    median: 0,
    p25: 0,
    p75: 0,
    recommendedPerSqft: 0,
  });

  // Mock utility functions (these would be imported from comps.ts)
  const computePricePerSqft = (price: number, sqft: number): number => {
    if (sqft === 0) return 0;
    return Math.round(price / sqft);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatMonthYear = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toISOString().slice(0, 7); // YYYY-MM
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const addComp = () => {
    const newComp: Comp = {
      id: `comp-${Date.now()}`,
      address: '1 Test Street',
      postcode: 'SW1A 0AA',
      beds: 3,
      propertyType: 'semi-detached',
      date: new Date().toISOString(),
      priceGBP: 250000,
      giaSqft: 1000,
      notes: '',
    };
    setComps([...comps, newComp]);
    recomputeStats(); // Recompute after adding
  };

  const deleteComp = (id: string) => {
    setComps(comps.filter(c => c.id !== id));
    recomputeStats(); // Recompute after deleting
  };

  const updateComp = (id: string, field: keyof Comp, value: any) => {
    const updatedComps = comps.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    );
    // Ensure pricePerSqft is updated in real-time if price or sqft changes
    if (field === 'priceGBP' || field === 'giaSqft') {
      const compToUpdate = updatedComps.find(c => c.id === id);
      if (compToUpdate && compToUpdate.giaSqft !== undefined && compToUpdate.giaSqft > 0) {
        compToUpdate.pricePerSqft = computePricePerSqft(compToUpdate.priceGBP, compToUpdate.giaSqft);
      }
    }
    setComps(updatedComps as Comp[]);
    recomputeStats(); // Recompute after editing
  };

  const recomputeStats = () => {
    // Mock implementation of filtering, outlier rejection, and stats calculation
    let validComps = [...comps];

    // Filter by months
    const today = new Date();
    validComps = validComps.filter(c => {
      try {
        const compDate = new Date(c.date);
        const monthsDiff = (today.getFullYear() - compDate.getFullYear()) * 12 + (today.getMonth() - compDate.getMonth());
        return monthsDiff >= 0 && monthsDiff <= settings.includeMonths;
      } catch (e) {
        return false; // Invalid date
      }
    });

    // Filter by beds
    if (settings.minBeds !== null) {
      validComps = validComps.filter(c => c.beds !== null && c.beds >= settings.minBeds!);
    }
    if (settings.maxBeds !== null) {
      validComps = validComps.filter(c => c.beds !== null && c.beds <= settings.maxBeds!);
    }

    // Compute pricePerSqft for valid comps if not already done
    validComps = validComps.map(c => ({
      ...c,
      pricePerSqft: c.pricePerSqft !== undefined ? c.pricePerSqft : (c.giaSqft > 0 ? computePricePerSqft(c.priceGBP, c.giaSqft) : 0)
    })).filter(c => c.giaSqft > 0 && c.priceGBP > 0); // Ensure valid for price per sqft calculation

    // Outlier rejection
    const pricesPerSqft = validComps.map(c => c.pricePerSqft!).filter(p => p > 0);
    if (pricesPerSqft.length >= 3) {
      pricesPerSqft.sort((a, b) => a - b);
      const q1 = pricesPerSqft[Math.floor(pricesPerSqft.length / 4)];
      const q3 = pricesPerSqft[Math.ceil(pricesPerSqft.length * 3 / 4) - 1];
      const iqr = q3 - q1;
      const lowerBound = q1 - settings.iqrK * iqr;
      const upperBound = q3 + settings.iqrK * iqr;

      validComps = validComps.filter(c => c.pricePerSqft! >= lowerBound && c.pricePerSqft! <= upperBound);
    }

    // Fallback if fewer than 3 comps remain
    if (validComps.length < 3 && comps.length >= 3) {
      validComps = comps.map(c => ({
        ...c,
        pricePerSqft: c.pricePerSqft !== undefined ? c.pricePerSqft : (c.giaSqft > 0 ? computePricePerSqft(c.priceGBP, c.giaSqft) : 0)
      })).filter(c => c.giaSqft > 0 && c.priceGBP > 0);
    }


    const finalPricesPerSqft = validComps.map(c => c.pricePerSqft!).filter(p => p > 0);
    const count = finalPricesPerSqft.length;
    let median = 0, p25 = 0, p75 = 0;

    if (count > 0) {
      finalPricesPerSqft.sort((a, b) => a - b);
      median = finalPricesPerSqft[Math.floor(count / 2)];
      p25 = finalPricesPerSqft[Math.floor(count / 4)];
      p75 = finalPricesPerSqft[Math.ceil(count * 3 / 4) - 1];
    }

    setStats({
      countUsed: count,
      median: Math.round(median),
      p25: Math.round(p25),
      p75: Math.round(p75),
      recommendedPerSqft: Math.round(median), // Default to median
    });
  };

  const handleApplyToFinance = () => {
    console.log(`Applying £${stats.recommendedPerSqft} per sqft to finance for project ${projectId}`);
    // In a real app, this would dispatch an action or call an API to update the project's finance settings.
  };

  const handleSettingsChange = (field: keyof CompSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
    recomputeStats();
  };

  return (
    <div className=" Comparables-container p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Market Evidence</h3>
        <div className="flex space-x-2">
          <button onClick={addComp} className="btn-secondary">Add Comp</button>
          <button onClick={() => setComps([])} className="btn-ghost">Clear Comps</button>
          <button onClick={recomputeStats} className="btn-secondary">Recompute Stats</button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Postcode Context</label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="Enter postcode"
          className="input-field w-full md:w-1/2"
        />
      </div>

      {/* Comps Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beds</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GIA sqft</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">£ / sqft</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comps.map((comp) => (
              <tr key={comp.id}>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  <input
                    type="text"
                    value={comp.address}
                    onChange={(e) => updateComp(comp.id, 'address', e.target.value)}
                    className="input-field-sm"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="number"
                    value={comp.beds ?? ''}
                    onChange={(e) => updateComp(comp.id, 'beds', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                    className="input-field-sm"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={comp.propertyType}
                    onChange={(e) => updateComp(comp.id, 'propertyType', e.target.value as PropertyType)}
                    className="input-field-sm"
                  >
                    <option value="detached">Detached</option>
                    <option value="semi-detached">Semi-detached</option>
                    <option value="terraced">Terraced</option>
                    <option value="flat">Flat</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="other">Other</option>
                  </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text" // Using text for YYYY-MM format as requested for display
                    value={formatMonthYear(comp.date)}
                    onChange={(e) => {
                      const dateStr = e.target.value;
                      if (/^\d{4}-\d{2}$/.test(dateStr)) {
                        // Attempt to create a valid ISO date string
                        const newDate = new Date(`${dateStr}-01T00:00:00.000Z`);
                        if (!isNaN(newDate.getTime())) {
                          updateComp(comp.id, 'date', newDate.toISOString());
                        } else {
                           // Handle invalid date input, maybe revert or show error
                           console.error("Invalid date format input");
                        }
                      } else {
                         console.error("Invalid date format input");
                      }
                    }}
                    placeholder="YYYY-MM"
                    className="input-field-sm w-24"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="number"
                    value={comp.priceGBP}
                    onChange={(e) => updateComp(comp.id, 'priceGBP', parseInt(e.target.value, 10))}
                    className="input-field-sm"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="number"
                    value={comp.giaSqft}
                    onChange={(e) => updateComp(comp.id, 'giaSqft', parseInt(e.target.value, 10))}
                    className="input-field-sm"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                  {comp.pricePerSqft !== undefined ? formatCurrency(comp.pricePerSqft) : 'N/A'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <button onClick={() => deleteComp(comp.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settings and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="col-span-1 lg:col-span-2">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Include Last Months</label>
              <input
                type="number"
                value={settings.includeMonths}
                onChange={(e) => handleSettingsChange('includeMonths', parseInt(e.target.value, 10))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Beds</label>
              <input
                type="number"
                value={settings.minBeds ?? ''}
                onChange={(e) => handleSettingsChange('minBeds', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                placeholder="Any"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Beds</label>
              <input
                type="number"
                value={settings.maxBeds ?? ''}
                onChange={(e) => handleSettingsChange('maxBeds', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                placeholder="Any"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IQR Multiplier (k)</label>
              <input
                type="number"
                step="0.1"
                value={settings.iqrK}
                onChange={(e) => handleSettingsChange('iqrK', parseFloat(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md shadow-inner">
          <h4 className="text-md font-semibold text-blue-800 mb-3">Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Comps Used:</span>
              <span className="font-medium">{stats.countUsed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Median £/sqft:</span>
              <span className="font-medium">{formatCurrency(stats.median)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">P25 £/sqft:</span>
              <span className="font-medium">{formatCurrency(stats.p25)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">P75 £/sqft:</span>
              <span className="font-medium">{formatCurrency(stats.p75)}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recommended £/sqft</label>
            <input
              type="number"
              value={stats.recommendedPerSqft}
              onChange={(e) => setStats({ ...stats, recommendedPerSqft: parseInt(e.target.value, 10) })}
              className="input-field-lg w-full text-center font-bold"
            />
          </div>
          <button
            onClick={handleApplyToFinance}
            disabled={stats.countUsed === 0}
            className="mt-4 btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply to Finance
          </button>
        </div>
      </div>
    </div>
  );
};


type TabType = 'survey' | 'layout' | 'finance' | 'offer';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('survey');
  const [projectName, setProjectName] = useState('');
  const [isGPSActive, setIsGPSActive] = useState(false);
  const [houseType, setHouseType] = useState('terraced');
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);
  const [pricePerSqft, setPricePerSqft] = useState('');
  const [buildCostPerSqft, setBuildCostPerSqft] = useState('');
  const [feesPercent, setFeesPercent] = useState('');
  const [contingencyPercent, setContingencyPercent] = useState('');
  const [profitPercent, setProfitPercent] = useState('');
  
  // Mock data - in real app this would come from project store
  const estimatedUnits = 12;
  const avgUnitSize = 1200; // square feet
  const totalFloorArea = estimatedUnits * avgUnitSize;
  
  // Calculate live totals
  const calculateTotals = () => {
    const price = parseFloat(pricePerSqft) || 0;
    const buildCost = parseFloat(buildCostPerSqft) || 0;
    const fees = parseFloat(feesPercent) || 0;
    const contingency = parseFloat(contingencyPercent) || 0;
    const profit = parseFloat(profitPercent) || 0;
    
    // Calculate GDV (Gross Development Value)
    const gdv = price * totalFloorArea;
    
    // Calculate total build costs
    const totalBuildCosts = buildCost * totalFloorArea;
    
    // Calculate fees as percentage of build costs
    const totalFees = (totalBuildCosts * fees) / 100;
    
    // Calculate contingency as percentage of build costs
    const totalContingency = (totalBuildCosts * contingency) / 100;
    
    // Calculate total costs
    const totalCosts = totalBuildCosts + totalFees + totalContingency;
    
    // Calculate profit
    const totalProfit = (gdv * profit) / 100;
    
    // Calculate residual land value
    const residual = gdv - totalCosts - totalProfit;
    
    return {
      gdv,
      totalBuildCosts,
      totalFees,
      totalContingency,
      totalProfit,
      residual,
      totalCosts
    };
  };
  
  const totals = calculateTotals();
  
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(0)}K`;
    } else {
      return `£${amount.toFixed(0)}`;
    }
  };

  // Mock current project data
  const currentProject: Project | null = {
    id: 'current-project-123',
    compsPostcode: 'SW1A 0AA',
    comps: [
      {
        id: 'comp-1',
        address: '10 Downing Street',
        postcode: 'SW1A 2AA',
        beds: 5,
        propertyType: 'detached',
        date: '2023-01-15T00:00:00.000Z',
        priceGBP: 5000000,
        giaSqft: 5000,
        pricePerSqft: 1000,
      },
      {
        id: 'comp-2',
        address: '1 Parliament Street',
        postcode: 'SW1A 2AA',
        beds: 4,
        propertyType: 'terraced',
        date: '2023-03-20T00:00:00.000Z',
        priceGBP: 1500000,
        giaSqft: 1500,
        pricePerSqft: 1000,
      },
    ],
    compSettings: {
      includeMonths: 18,
      minBeds: 3,
      maxBeds: 5,
      iqrK: 1.5,
    },
  };


  const tabs = [
    { id: 'survey', label: 'Survey', icon: '📍' },
    { id: 'layout', label: 'Layout', icon: '🏠' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'offer', label: 'Offer', icon: '📄' },
  ];

  const handleGPSToggle = () => {
    setIsGPSActive(!isGPSActive);
  };

  const handleAddObstacle = () => {
    console.log('Add obstacle clicked');
  };

  const handleExportPDF = () => {
    console.log('Export PDF from offer panel');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'survey':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="input-field"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGPSToggle}
                className={isGPSActive ? 'btn-primary w-full' : 'btn-ghost w-full'}
              >
                {isGPSActive ? 'Stop GPS' : 'Start GPS'}
              </button>

              <button onClick={handleAddObstacle} className="btn-ghost w-full">
                Add Obstacle
              </button>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Site Area</div>
              <div className="kpi-value">2,450 m²</div>
            </div>
          </div>
        );

      case 'layout':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                House Type
              </label>
              <select
                value={houseType}
                onChange={(e) => setHouseType(e.target.value)}
                className="input-field"
              >
                <option value="terraced">Terraced</option>
                <option value="semi-detached">Semi-detached</option>
                <option value="detached">Detached</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Estimated Units</div>
              <div className="kpi-value">12</div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="layoutPreview"
                checked={showLayoutPreview}
                onChange={(e) => setShowLayoutPreview(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="layoutPreview" className="ml-2 block text-sm text-gray-700">
                Show layout preview
              </label>
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per sqft (£)
                </label>
                <input
                  type="number"
                  value={pricePerSqft}
                  onChange={(e) => setPricePerSqft(e.target.value)}
                  placeholder="500"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Build cost per sqft (£)
                </label>
                <input
                  type="number"
                  value={buildCostPerSqft}
                  onChange={(e) => setBuildCostPerSqft(e.target.value)}
                  placeholder="150"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fees (%)
                </label>
                <input
                  type="number"
                  value={feesPercent}
                  onChange={(e) => setFeesPercent(e.target.value)}
                  placeholder="5"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contingency (%)
                </label>
                <input
                  type="number"
                  value={contingencyPercent}
                  onChange={(e) => setContingencyPercent(e.target.value)}
                  placeholder="10"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profit (%)
                </label>
                <input
                  type="number"
                  value={profitPercent}
                  onChange={(e) => setProfitPercent(e.target.value)}
                  placeholder="20"
                  className="input-field"
                />
              </div>
            </div>

            {/* KPI Cards - Live Calculations */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="kpi-card">
                  <div className="kpi-label">GDV</div>
                  <div className="kpi-value text-primary-400">{formatCurrency(totals.gdv)}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Residual</div>
                  <div className={`kpi-value ${totals.residual > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(totals.residual)}
                  </div>
                </div>
              </div>
              
              {/* Additional KPIs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="kpi-card">
                  <div className="kpi-label">Build Costs</div>
                  <div className="kpi-value">{formatCurrency(totals.totalBuildCosts)}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Total Profit</div>
                  <div className="kpi-value text-primary-400">{formatCurrency(totals.totalProfit)}</div>
                </div>
              </div>
              
              {/* Project Details */}
              <div className="bg-dark-800/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Units:</span>
                  <span className="font-semibold">{estimatedUnits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Avg Unit Size:</span>
                  <span className="font-semibold">{avgUnitSize.toLocaleString()} sqft</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Total Floor Area:</span>
                  <span className="font-semibold">{totalFloorArea.toLocaleString()} sqft</span>
                </div>
                <div className="flex justify-between text-sm border-t border-dark-700 pt-2">
                  <span className="text-dark-300">Profit Margin:</span>
                  <span className={`font-semibold ${totals.gdv > 0 ? (totals.totalProfit / totals.gdv * 100 >= 20 ? 'text-emerald-400' : 'text-amber-400') : 'text-dark-400'}`}>
                    {totals.gdv > 0 ? `${(totals.totalProfit / totals.gdv * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparables Section */}
            <div className="border-t pt-6">
              {currentProject && <Comparables projectId={currentProject.id} />}
            </div>
          </div>
        );

      case 'offer':
        return (
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Project Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Site Area:</span>
                  <span className="font-medium">2,450 m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Units:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GDV:</span>
                  <span className="font-medium">{formatCurrency(totals.gdv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Residual Land Value:</span>
                  <span className={`font-medium ${totals.residual > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(totals.residual)}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={handleExportPDF} className="btn-primary w-full">
              Export PDF
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <aside className="w-80 bg-dark-950 border-r border-dark-800 flex flex-col">
      {/* Tab buttons */}
      <div className="flex border-b border-dark-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 px-3 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-400 bg-dark-900/50'
                : 'border-transparent text-dark-400 hover:text-white hover:border-dark-600'
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderTabContent()}
      </div>
    </aside>
  );
};