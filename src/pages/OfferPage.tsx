
import React from 'react';
import { useGlobalStore, computeTotals } from '../store/globalStore';
import { FileText, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const OfferPage: React.FC = () => {
  const { project } = useGlobalStore();
  const totals = computeTotals(project);

  const getViabilityStatus = () => {
    if (totals.residual >= 0 && totals.profitPct >= project.finance.targetProfitPct) {
      return { status: 'viable', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    }
    if (totals.residual >= 0 && totals.profitPct >= (project.finance.targetProfitPct - 10)) {
      return { status: 'at-risk', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' };
    }
    return { status: 'unviable', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const viability = getViabilityStatus();
  const StatusIcon = viability.icon;

  const exportToPDF = () => {
    // PDF export functionality would go here
    console.log('Exporting to PDF...');
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <FileText className="text-brand-400" size={24} />
          <h2 className="card-title">Development Appraisal</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${viability.bg}`}>
              <StatusIcon className={viability.color} size={20} />
              <span className={`font-semibold capitalize ${viability.color}`}>
                {viability.status.replace('-', ' ')}
              </span>
            </div>
            <button onClick={exportToPDF} className="btn">
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-sm text-slate-400 mb-1">Gross GDV</div>
            <div className="kpi-green">£{totals.gdv.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-sm text-slate-400 mb-1">Total Costs</div>
            <div className="kpi">
              £{(totals.build + totals.fees + totals.contingency + totals.financeCost + project.finance.landAcqCosts).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-sm text-slate-400 mb-1">Profit %</div>
            <div className={totals.profitPct >= project.finance.targetProfitPct ? 'kpi-green' : 'kpi-red'}>
              {totals.profitPct.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-sm text-slate-400 mb-1">Land Value</div>
            <div className={totals.residual >= 0 ? 'kpi-green' : 'kpi-red'}>
              £{totals.residual.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-emerald-400">Revenue</h3>
          </div>
          <div className="card-body space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-300">Gross GDV</span>
              <span className="font-semibold text-emerald-400">£{totals.gdv.toLocaleString()}</span>
            </div>
            <div className="text-sm text-slate-500">
              {project.layout.unitMix.reduce((sum, mix) => sum + mix.count, 0)} units total
            </div>
          </div>
        </div>

        {/* Costs */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-red-400">Costs</h3>
          </div>
          <div className="card-body space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-300">Build Cost</span>
              <span className="font-semibold">£{totals.build.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Fees ({project.finance.feesPct}%)</span>
              <span className="font-semibold">£{totals.fees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Contingency ({project.finance.contPct}%)</span>
              <span className="font-semibold">£{totals.contingency.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Finance Cost</span>
              <span className="font-semibold">£{totals.financeCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Land Acquisition</span>
              <span className="font-semibold">£{project.finance.landAcqCosts.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-700 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Target Profit ({project.finance.targetProfitPct}%)</span>
                <span className="font-semibold text-brand-400">£{totals.targetProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Site Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Site Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-slate-400">Site Area</div>
              <div className="font-semibold">
                {project.survey.siteAreaM2.toLocaleString()} m²
                {project.survey.siteAreaM2 > 0 && (
                  <span className="text-slate-500 text-sm ml-2">
                    ({(project.survey.siteAreaM2 * 0.000247105).toFixed(2)} acres)
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Development Efficiency</div>
              <div className="font-semibold">{project.survey.efficiency}%</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Net Developable Area</div>
              <div className="font-semibold">
                {(project.survey.siteAreaM2 * project.survey.efficiency / 100).toLocaleString()} m²
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Performance Indicators</h3>
        </div>
        <div className="card-body space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Profit vs Target</span>
              <span>{totals.profitPct.toFixed(1)}% / {project.finance.targetProfitPct}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  totals.profitPct >= project.finance.targetProfitPct 
                    ? 'bg-emerald-500' 
                    : totals.profitPct >= (project.finance.targetProfitPct - 5)
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, (totals.profitPct / project.finance.targetProfitPct) * 100))}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Cost vs GDV</span>
              <span>{totals.costToGDVPct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  totals.costToGDVPct <= 70 
                    ? 'bg-emerald-500' 
                    : totals.costToGDVPct <= 80
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, totals.costToGDVPct)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
