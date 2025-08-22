
import React, { useState } from 'react';

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

            <div className="grid grid-cols-1 gap-3">
              <div className="kpi-card">
                <div className="kpi-label">GDV</div>
                <div className="kpi-value">£2.4M</div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-label">Residual Land Value</div>
                <div className="kpi-value">£480K</div>
              </div>
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
                  <span className="font-medium">£2.4M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Residual Land Value:</span>
                  <span className="font-medium text-green-600">£480K</span>
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
    <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-primary text-brand-primary bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      <div className="flex-1 p-4 overflow-y-auto">
        {renderTabContent()}
      </div>
    </aside>
  );
};
