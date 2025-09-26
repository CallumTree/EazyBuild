
import React from 'react';
import { useStore } from '../store';
import { UnitMixEditor } from '../components/UnitMixEditor';

export const LayoutPage: React.FC = () => {
  const { project, computedMetrics, updateEfficiency, updateInfraAllowance } = useStore();

  const formatArea = (sqm: number) => {
    return `${sqm.toLocaleString()}m²`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Layout & Development</h1>
        <p className="text-slate-400">Configure your unit mix and development parameters</p>
      </div>

      {/* Site Information */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Site Area</div>
          <div className="text-2xl font-bold text-brand-400">
            {project.siteAreaSqm ? formatArea(project.siteAreaSqm) : 'Not set'}
          </div>
          <div className="text-sm text-slate-500 mt-1">From survey boundary</div>
        </div>
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Net Developable Area</div>
          <div className="text-2xl font-bold text-white">
            {formatArea(computedMetrics.netDevelopableAreaSqm)}
          </div>
          <div className="text-sm text-slate-500 mt-1">After infrastructure</div>
        </div>
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Development Density</div>
          <div className="text-2xl font-bold text-slate-300">
            {computedMetrics.netDevelopableAreaSqm > 0 
              ? Math.round((computedMetrics.totalUnits / computedMetrics.netDevelopableAreaSqm) * 10000) 
              : 0
            }
          </div>
          <div className="text-sm text-slate-500 mt-1">units per hectare</div>
        </div>
      </div>

      {/* Development Parameters */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Development Parameters</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Site Efficiency (%) - How much of the site can be developed
            </label>
            <input
              type="number"
              min="30"
              max="90"
              step="5"
              value={project.efficiency || 65}
              onChange={(e) => updateEfficiency(parseInt(e.target.value) || 65)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="text-xs text-slate-500 mt-1">
              Typical range: 60-80% (accounts for roads, parking, gardens)
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Infrastructure Allowance (%) - Roads, utilities, open space
            </label>
            <input
              type="number"
              min="10"
              max="50"
              step="5"
              value={Math.round((project.infraAllowancePct || 0.25) * 100)}
              onChange={(e) => updateInfraAllowance((parseInt(e.target.value) || 25) / 100)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="text-xs text-slate-500 mt-1">
              Typical range: 20-35% of total site area
            </div>
          </div>
        </div>
      </div>

      {/* Unit Mix Editor */}
      <UnitMixEditor />

      {/* Quick Stats */}
      {computedMetrics.totalUnits > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Development Summary</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">{computedMetrics.totalUnits}</div>
              <div className="text-sm text-slate-400">Total Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(computedMetrics.totalFloorAreaSqm).toLocaleString()}m²
              </div>
              <div className="text-sm text-slate-400">Total Floor Area</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                £{Math.round(computedMetrics.totalBuildCost / 1000)}k
              </div>
              <div className="text-sm text-slate-400">Build Costs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                £{Math.round(computedMetrics.totalGDV / 1000)}k
              </div>
              <div className="text-sm text-slate-400">Total GDV</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
