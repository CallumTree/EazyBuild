
import { Project } from './store';

export interface FinanceResult {
  gdv: number;
  build: number;
  fees: number;
  contingency: number;
  financeCost: number;
  targetProfit: number;
  residual: number;
  actualProfitPct: number;
  isViable: boolean;
  status: 'Viable' | 'At Risk' | 'Unviable';
}

export interface FinanceInputs {
  feesPct: number;
  contPct: number;
  financeRatePct: number;
  financeMonths: number;
  targetProfitPct: number;
  landAcqCosts: number;
}

export function computeTotals(project: Project, inputs: FinanceInputs, houseTypes?: any[]): FinanceResult {
  let units = 0;
  let totalFloorArea = 0;
  let gdv = 0;
  let build = 0;

  // If unitMix exists and houseTypes are provided, use those for calculations
  if (project.unitMix && project.unitMix.length > 0 && houseTypes) {
    project.unitMix.forEach(mix => {
      const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
      if (houseType) {
        const unitCount = mix.count;
        units += unitCount;
        totalFloorArea += unitCount * houseType.floorAreaSqm;
        gdv += unitCount * (houseType.floorAreaSqm * houseType.saleValuePerSqm);
        build += unitCount * (houseType.floorAreaSqm * houseType.buildCostPerSqm);
      }
    });
  } else {
    // Fallback to legacy single-unit calculations
    units = project.estimatedUnits || 0;
    const floorAreaPerUnit = project.floorAreaPerUnit || 0;
    const gdvPerUnit = project.gdvPerUnit || 0;
    const buildCostPerSqm = project.buildCostPerSqm || 0;
    
    gdv = units * gdvPerUnit;
    totalFloorArea = units * floorAreaPerUnit;
    build = totalFloorArea * buildCostPerSqm;
  }
  
  const fees = (build * inputs.feesPct) / 100;
  const contingency = (build * inputs.contPct) / 100;
  
  // Finance cost using half-cost interest approximation
  const totalCost = build + fees + contingency + inputs.landAcqCosts;
  const financeCost = (totalCost * inputs.financeRatePct * inputs.financeMonths) / (100 * 12 * 2);
  
  const targetProfit = (gdv * inputs.targetProfitPct) / 100;
  const totalExpenses = build + fees + contingency + financeCost + targetProfit + inputs.landAcqCosts;
  const residual = gdv - totalExpenses;
  
  const actualProfit = gdv - (build + fees + contingency + financeCost + inputs.landAcqCosts);
  const actualProfitPct = gdv > 0 ? (actualProfit / gdv) * 100 : 0;
  
  // Status determination
  let status: 'Viable' | 'At Risk' | 'Unviable';
  let isViable = false;
  
  if (actualProfitPct >= 20 && residual >= 0) {
    status = 'Viable';
    isViable = true;
  } else if (actualProfitPct >= 10 && residual >= 0) {
    status = 'At Risk';
  } else {
    status = 'Unviable';
  }

  return {
    gdv,
    build,
    fees,
    contingency,
    financeCost,
    targetProfit,
    residual,
    actualProfitPct,
    isViable,
    status,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
