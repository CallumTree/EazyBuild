
import React from 'react';
import { useGlobalStore } from '../store/globalStore';
import { NumberInput } from '../components/NumberInput';
import { Calculator } from 'lucide-react';

export const FinancePage: React.FC = () => {
  const { project, updateProject } = useGlobalStore();

  const updateFinance = (updates: any) => {
    updateProject({
      finance: { ...project.finance, ...updates }
    });
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <Calculator className="text-brand-400" size={24} />
          <h2 className="card-title">Financial Assumptions</h2>
        </div>
        <div className="card-body">
          <p className="text-slate-400 mb-4">
            Configure financial parameters for the development appraisal.
          </p>
        </div>
      </div>

      {/* Financial Inputs */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Cost Assumptions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Professional Fees (%)</label>
              <NumberInput
                value={project.finance.feesPct}
                onChange={(value) => updateFinance({ feesPct: value })}
                className="input"
                suffix="%"
                min={0}
                max={50}
              />
            </div>

            <div>
              <label className="label">Contingency (%)</label>
              <NumberInput
                value={project.finance.contPct}
                onChange={(value) => updateFinance({ contPct: value })}
                className="input"
                suffix="%"
                min={0}
                max={30}
              />
            </div>

            <div>
              <label className="label">Finance Rate (% p.a.)</label>
              <NumberInput
                value={project.finance.financeRatePct}
                onChange={(value) => updateFinance({ financeRatePct: value })}
                className="input"
                suffix="%"
                min={0}
                max={20}
                decimals={2}
              />
            </div>

            <div>
              <label className="label">Finance Period (months)</label>
              <NumberInput
                value={project.finance.financeMonths}
                onChange={(value) => updateFinance({ financeMonths: value })}
                className="input"
                min={1}
                max={60}
              />
            </div>

            <div>
              <label className="label">Target Profit (%)</label>
              <NumberInput
                value={project.finance.targetProfitPct}
                onChange={(value) => updateFinance({ targetProfitPct: value })}
                className="input"
                suffix="%"
                min={0}
                max={50}
              />
            </div>

            <div>
              <label className="label">Land Acquisition Costs (£)</label>
              <NumberInput
                value={project.finance.landAcqCosts}
                onChange={(value) => updateFinance({ landAcqCosts: value })}
                className="input"
                prefix="£"
                min={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
