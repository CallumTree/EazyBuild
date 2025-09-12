
import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store';
import { NumberInput } from './NumberInput';

interface AssumptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssumptionsDrawer({ isOpen, onClose }: AssumptionsDrawerProps) {
  const { project, updateProject, houseTypes } = useStore();
  
  const finance = project.finance || {
    feesPct: '5',
    contPct: '10',
    financeRatePct: '8.5',
    financeMonths: '18',
    targetProfitPct: '20',
    landAcqCosts: '25000',
  };

  const updateFinance = (field: keyof typeof finance, value: string) => {
    updateProject({
      finance: { ...finance, [field]: value }
    });
  };

  const getAverageSalePrice = () => {
    const unitMix = project.unitMix || [];
    if (unitMix.length === 0) return 0;
    
    const totalValue = unitMix.reduce((sum, mix) => {
      const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
      if (!houseType) return sum;
      const unitValue = houseType.floorAreaSqm * houseType.saleValuePerSqm;
      return sum + (unitValue * mix.count);
    }, 0);
    
    const totalUnits = unitMix.reduce((sum, mix) => sum + mix.count, 0);
    const totalArea = unitMix.reduce((sum, mix) => {
      const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
      if (!houseType) return sum;
      return sum + (houseType.floorAreaSqm * mix.count);
    }, 0);
    
    return totalArea > 0 ? totalValue / totalArea : 0;
  };

  const getAverageBuildCost = () => {
    const unitMix = project.unitMix || [];
    if (unitMix.length === 0) return project.buildCostPerSqm || 1650;
    
    const totalCost = unitMix.reduce((sum, mix) => {
      const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
      if (!houseType) return sum;
      const unitCost = houseType.floorAreaSqm * houseType.buildCostPerSqm;
      return sum + (unitCost * mix.count);
    }, 0);
    
    const totalArea = unitMix.reduce((sum, mix) => {
      const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
      if (!houseType) return sum;
      return sum + (houseType.floorAreaSqm * mix.count);
    }, 0);
    
    return totalArea > 0 ? totalCost / totalArea : project.buildCostPerSqm || 1650;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-96 bg-slate-900 shadow-xl border-l border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Key Assumptions</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-200 border-b border-slate-700 pb-2">Sales Prices</h4>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Average Sale Price £/m²</label>
              <div className="text-lg font-semibold text-brand-400">
                £{getAverageSalePrice().toFixed(0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Calculated from unit mix</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-200 border-b border-slate-700 pb-2">Build Costs</h4>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Average Build Cost £/m²</label>
              <div className="text-lg font-semibold text-amber-400">
                £{getAverageBuildCost().toFixed(0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Calculated from unit mix</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-200 border-b border-slate-700 pb-2">Professional Fees</h4>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Fees %</label>
              <NumberInput
                value={finance.feesPct}
                onChange={(value) => updateFinance('feesPct', value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Contingency %</label>
              <NumberInput
                value={finance.contPct}
                onChange={(value) => updateFinance('contPct', value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-200 border-b border-slate-700 pb-2">Finance</h4>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Finance Rate %</label>
              <NumberInput
                value={finance.financeRatePct}
                onChange={(value) => updateFinance('financeRatePct', value)}
                className="input w-full"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Finance Period (months)</label>
              <NumberInput
                value={finance.financeMonths}
                onChange={(value) => updateFinance('financeMonths', value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Land Acquisition Costs £</label>
              <NumberInput
                value={finance.landAcqCosts}
                onChange={(value) => updateFinance('landAcqCosts', value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-200 border-b border-slate-700 pb-2">Targets</h4>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Target Profit %</label>
              <NumberInput
                value={finance.targetProfitPct}
                onChange={(value) => updateFinance('targetProfitPct', value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-200 border-b border-slate-700 pb-2">Site</h4>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Site Efficiency %</label>
              <NumberInput
                value={project.efficiency || 65}
                onChange={(value) => updateProject({ efficiency: parseFloat(value) || 65 })}
                className="input w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
