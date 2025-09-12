
import React from 'react';
import { X } from 'lucide-react';
import { Scenario, useStore } from '../store';
import { computeTotals, formatCurrency } from '../finance';

interface ScenarioCompareProps {
  isOpen: boolean;
  onClose: () => void;
  scenario1: Scenario;
  scenario2: Scenario;
}

export function ScenarioCompare({ isOpen, onClose, scenario1, scenario2 }: ScenarioCompareProps) {
  const { houseTypes } = useStore();

  if (!isOpen) return null;

  const results1 = computeTotals(scenario1.project, scenario1.project.finance || {}, houseTypes);
  const results2 = computeTotals(scenario2.project, scenario2.project.finance || {}, houseTypes);

  const getUnitMixSummary = (scenario: Scenario) => {
    const unitMix = scenario.project.unitMix || [];
    return unitMix.map(mix => {
      const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
      return houseType ? `${mix.count}x ${houseType.name}` : '';
    }).filter(Boolean).join(', ');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-4 bg-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white">Scenario Comparison</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
          <div className="grid grid-cols-2 gap-8">
            {/* Scenario Headers */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-brand-400">{scenario1.name}</h4>
              <p className="text-sm text-slate-400">Created: {new Date(scenario1.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-brand-400">{scenario2.name}</h4>
              <p className="text-sm text-slate-400">Created: {new Date(scenario2.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Unit Mix */}
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Unit Mix</h5>
              <p className="text-sm text-slate-300">{getUnitMixSummary(scenario1) || 'No units'}</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Unit Mix</h5>
              <p className="text-sm text-slate-300">{getUnitMixSummary(scenario2) || 'No units'}</p>
            </div>

            {/* GDV */}
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">GDV</h5>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(results1.gdv)}</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">GDV</h5>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(results2.gdv)}</p>
              {results2.gdv !== results1.gdv && (
                <p className={`text-sm ${results2.gdv > results1.gdv ? 'text-green-400' : 'text-red-400'}`}>
                  {results2.gdv > results1.gdv ? '↑' : '↓'} {formatCurrency(Math.abs(results2.gdv - results1.gdv))}
                </p>
              )}
            </div>

            {/* Build Cost */}
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Build Cost</h5>
              <p className="text-xl font-bold text-amber-400">{formatCurrency(results1.build)}</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Build Cost</h5>
              <p className="text-xl font-bold text-amber-400">{formatCurrency(results2.build)}</p>
              {results2.build !== results1.build && (
                <p className={`text-sm ${results2.build < results1.build ? 'text-green-400' : 'text-red-400'}`}>
                  {results2.build < results1.build ? '↓' : '↑'} {formatCurrency(Math.abs(results2.build - results1.build))}
                </p>
              )}
            </div>

            {/* Fees */}
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Fees</h5>
              <p className="text-lg font-semibold text-slate-300">{formatCurrency(results1.fees)}</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Fees</h5>
              <p className="text-lg font-semibold text-slate-300">{formatCurrency(results2.fees)}</p>
            </div>

            {/* Finance Cost */}
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Finance Cost</h5>
              <p className="text-lg font-semibold text-slate-300">{formatCurrency(results1.financeCost)}</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Finance Cost</h5>
              <p className="text-lg font-semibold text-slate-300">{formatCurrency(results2.financeCost)}</p>
            </div>

            {/* Profit % */}
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Profit %</h5>
              <p className={`text-xl font-bold ${results1.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {results1.actualProfitPct.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Profit %</h5>
              <p className={`text-xl font-bold ${results2.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {results2.actualProfitPct.toFixed(1)}%
              </p>
              {Math.abs(results2.actualProfitPct - results1.actualProfitPct) > 0.1 && (
                <p className={`text-sm ${results2.actualProfitPct > results1.actualProfitPct ? 'text-green-400' : 'text-red-400'}`}>
                  {results2.actualProfitPct > results1.actualProfitPct ? '↑' : '↓'} {Math.abs(results2.actualProfitPct - results1.actualProfitPct).toFixed(1)}%
                </p>
              )}
            </div>

            {/* Residual */}
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Residual Land Value</h5>
              <p className={`text-xl font-bold ${results1.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(results1.residual)}
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-slate-200">Residual Land Value</h5>
              <p className={`text-xl font-bold ${results2.residual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(results2.residual)}
              </p>
              {results2.residual !== results1.residual && (
                <p className={`text-sm ${results2.residual > results1.residual ? 'text-green-400' : 'text-red-400'}`}>
                  {results2.residual > results1.residual ? '↑' : '↓'} {formatCurrency(Math.abs(results2.residual - results1.residual))}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
