
import { Project, HouseType } from './store';

export interface FinanceResult {
  gdv: number;
  build: number;
  fees: number;
  contingency: number;
  financeCost: number;
  targetProfit: number;
  residual: number;
  actualProfit: number;
  actualProfitPct: number;
  totalCosts: number;
  isViable: boolean;
  status: 'Viable' | 'At Risk' | 'Unviable';
}

export interface FinanceInputs {
  feesPct: string;
  contPct: string;
  financeRatePct: string;
  financeMonths: string;
  targetProfitPct: string;
  landAcqCosts: string;
}

function parseNumber(value: string | number | undefined, fallback: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

export function computeTotals(project: Project, inputs: FinanceInputs, houseTypes: HouseType[]): FinanceResult {
  let gdv = 0;
  let build = 0;
  let totalUnits = 0;

  // Calculate totals from unit mix
  if (project.unitMix && project.unitMix.length > 0) {
    project.unitMix.forEach(mix => {
      const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
      if (houseType && mix.count > 0) {
        const unitCount = mix.count;
        totalUnits += unitCount;
        
        // GDV calculation
        gdv += unitCount * (houseType.floorAreaSqm * houseType.saleValuePerSqm);
        
        // Build cost calculation
        build += unitCount * (houseType.floorAreaSqm * houseType.buildCostPerSqm);
      }
    });
  } else {
    // Fallback to legacy calculations - but only if we have meaningful data
    totalUnits = project.estimatedUnits || 0;
    gdv = totalUnits * (project.gdvPerUnit || 0);
    build = totalUnits * (project.floorAreaPerUnit || 0) * parseNumber(project.buildCostPerSqm, 0);
  }

  // Parse inputs safely
  const feesPct = parseNumber(inputs.feesPct, 5);
  const contPct = parseNumber(inputs.contPct, 10);
  const financeRatePct = parseNumber(inputs.financeRatePct, 8.5);
  const financeMonths = parseNumber(inputs.financeMonths, 18);
  const targetProfitPct = parseNumber(inputs.targetProfitPct, 20);
  const landAcqCosts = parseNumber(inputs.landAcqCosts, 25000);

  // Calculate derived costs
  const fees = (build * feesPct) / 100;
  const contingency = (build * contPct) / 100;
  
  // Finance cost using half-cost interest approximation
  const baseCosts = build + fees + contingency + landAcqCosts;
  const financeCost = (baseCosts * financeRatePct * financeMonths) / (100 * 12 * 2);
  
  const targetProfit = (gdv * targetProfitPct) / 100;
  const totalCosts = build + fees + contingency + financeCost + landAcqCosts;
  const actualProfit = gdv - totalCosts;
  const actualProfitPct = gdv > 0 ? (actualProfit / gdv) * 100 : 0;
  const residual = gdv - totalCosts - targetProfit;

  // Status determination
  let status: 'Viable' | 'At Risk' | 'Unviable';
  let isViable = false;

  if (actualProfitPct >= targetProfitPct && residual >= 0) {
    status = 'Viable';
    isViable = true;
  } else if (actualProfitPct >= (targetProfitPct - 10) && residual >= 0) {
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
    actualProfit,
    actualProfitPct,
    totalCosts,
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
