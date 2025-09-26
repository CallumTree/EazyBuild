
import React from 'react';
import { useStore } from '../store';

export const FinancePage: React.FC = () => {
  const { project, computedMetrics, updateProject } = useStore();

  const finance = project.finance || {
    feesPct: '5',
    contPct: '10',
    financeRatePct: '8.5',
    financeMonths: '18',
    targetProfitPct: '20',
    landAcqCosts: '25000',
  };

  // Financial calculations
  const totalGDV = computedMetrics.totalGDV;
  const buildCost = computedMetrics.totalBuildCost;
  const fees = (totalGDV * parseFloat(finance.feesPct)) / 100;
  const contingency = (buildCost * parseFloat(finance.contPct)) / 100;
  const landAcqCosts = parseFloat(finance.landAcqCosts) || 0;
  const totalCosts = buildCost + fees + contingency + landAcqCosts;
  const targetProfit = (totalGDV * parseFloat(finance.targetProfitPct)) / 100;
  const residualLandValue = totalGDV - buildCost - fees - contingency - targetProfit;
  const actualProfit = totalGDV - totalCosts;
  const actualProfitPct = totalGDV > 0 ? (actualProfit / totalGDV) * 100 : 0;

  const updateFinanceField = (field: keyof typeof finance, value: string) => {
    updateProject({
      finance: { ...finance, [field]: value }
    });
  };

  const formatCurrency = (amount: number) => {
    return `£${Math.round(amount).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Financial Appraisal</h1>
        <p className="text-slate-400">Comprehensive development viability analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Total GDV</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(totalGDV)}</div>
          <div className="text-sm text-slate-500 mt-1">{computedMetrics.totalUnits} units</div>
        </div>
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Total Costs</div>
          <div className="text-2xl font-bold text-orange-400">{formatCurrency(totalCosts)}</div>
          <div className="text-sm text-slate-500 mt-1">All development costs</div>
        </div>
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Residual Land Value</div>
          <div className={`text-2xl font-bold ${residualLandValue > 0 ? 'text-brand-400' : 'text-red-400'}`}>
            {formatCurrency(residualLandValue)}
          </div>
          <div className="text-sm text-slate-500 mt-1">At {finance.targetProfitPct}% target profit</div>
        </div>
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Actual Profit</div>
          <div className={`text-2xl font-bold ${actualProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(actualProfit)}
          </div>
          <div className="text-sm text-slate-500 mt-1">{actualProfitPct.toFixed(1)}% margin</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Assumptions */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Financial Assumptions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Professional Fees (%)</label>
              <input
                type="number"
                step="0.1"
                value={finance.feesPct}
                onChange={(e) => updateFinanceField('feesPct', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Contingency (%)</label>
              <input
                type="number"
                step="0.1"
                value={finance.contPct}
                onChange={(e) => updateFinanceField('contPct', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Finance Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={finance.financeRatePct}
                onChange={(e) => updateFinanceField('financeRatePct', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Finance Period (months)</label>
              <input
                type="number"
                value={finance.financeMonths}
                onChange={(e) => updateFinanceField('financeMonths', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Target Profit (%)</label>
              <input
                type="number"
                step="0.1"
                value={finance.targetProfitPct}
                onChange={(e) => updateFinanceField('targetProfitPct', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Land Acquisition Costs (£)</label>
              <input
                type="number"
                value={finance.landAcqCosts}
                onChange={(e) => updateFinanceField('landAcqCosts', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Build Costs</span>
              <span className="font-semibold text-white">{formatCurrency(buildCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Professional Fees ({finance.feesPct}%)</span>
              <span className="font-semibold text-white">{formatCurrency(fees)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Contingency ({finance.contPct}%)</span>
              <span className="font-semibold text-white">{formatCurrency(contingency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Land Acquisition</span>
              <span className="font-semibold text-white">{formatCurrency(landAcqCosts)}</span>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Total Development Costs</span>
                <span className="font-bold text-lg text-orange-400">{formatCurrency(totalCosts)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Target Profit ({finance.targetProfitPct}%)</span>
              <span className="font-semibold text-white">{formatCurrency(targetProfit)}</span>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Gross Development Value</span>
                <span className="font-bold text-lg text-green-400">{formatCurrency(totalGDV)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Viability Summary */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Development Viability</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-slate-400 mb-2">Viability Status</div>
            <div className={`text-lg font-bold ${actualProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {actualProfit > 0 ? '✅ Viable' : '❌ Not Viable'}
            </div>
            {actualProfit <= 0 && (
              <div className="text-sm text-red-300 mt-1">
                Project shows a loss of {formatCurrency(Math.abs(actualProfit))}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-2">Profit per Unit</div>
            <div className="text-lg font-bold text-white">
              {computedMetrics.totalUnits > 0 ? formatCurrency(actualProfit / computedMetrics.totalUnits) : '£0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
