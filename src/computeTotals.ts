
import { Project } from './store/globalStore';

export interface TotalsResult {
  gdv: number;
  build: number;
  fees: number;
  contingency: number;
  financeCost: number;
  targetProfit: number;
  residual: number;
  profitPct: number;
  costToGDV: number;
}

export function computeTotals(project: Project): TotalsResult {
  const { layout, finance, market } = project;
  
  // Compute GDV
  let gdv = 0;
  for (const mix of layout.unitMix) {
    const houseType = layout.houseTypes.find(ht => ht.id === mix.houseTypeId);
    if (!houseType) continue;
    
    let unitValue = 0;
    let area = 0;
    let saleRate = 0;
    
    // Get area (prefer m², fallback to sqft)
    if (houseType.giaM2) {
      area = houseType.giaM2;
      // Get sale rate
      if (market.useMarketPrice && market.pricePerSqftDerived) {
        saleRate = market.pricePerSqftDerived * 10.764; // Convert sqft to m²
      } else if (houseType.salePerM2) {
        saleRate = houseType.salePerM2;
      }
    } else if (houseType.giaSqft) {
      area = houseType.giaSqft;
      // Get sale rate
      if (market.useMarketPrice && market.pricePerSqftDerived) {
        saleRate = market.pricePerSqftDerived;
      } else if (houseType.salePerSqft) {
        saleRate = houseType.salePerSqft;
      }
    }
    
    unitValue = area * saleRate;
    gdv += unitValue * mix.count;
  }
  
  // Compute Build Cost
  let build = 0;
  for (const mix of layout.unitMix) {
    const houseType = layout.houseTypes.find(ht => ht.id === mix.houseTypeId);
    if (!houseType) continue;
    
    let unitCost = 0;
    let area = 0;
    let buildRate = 0;
    
    // Get area and build rate (prefer m², fallback to sqft)
    if (houseType.giaM2) {
      area = houseType.giaM2;
      buildRate = houseType.buildPerM2 || 0;
    } else if (houseType.giaSqft) {
      area = houseType.giaSqft;
      buildRate = houseType.buildPerSqft || 0;
    }
    
    unitCost = area * buildRate;
    build += unitCost * mix.count;
  }
  
  // Apply formulas
  const fees = build * (finance.feesPct / 100);
  const contingency = build * (finance.contPct / 100);
  const financeBase = build + fees + contingency + finance.landAcqCosts;
  const financeCost = financeBase * (finance.financeRatePct / 100) * (finance.financeMonths / 12) * 0.5;
  const targetProfit = gdv * (finance.targetProfitPct / 100);
  const residual = gdv - (build + fees + contingency + financeCost + targetProfit + finance.landAcqCosts);
  const profitPct = gdv > 0 ? ((gdv - (build + fees + contingency + financeCost + finance.landAcqCosts)) / gdv) * 100 : 0;
  const costToGDV = gdv > 0 ? ((build + fees + contingency + financeCost + finance.landAcqCosts) / gdv) * 100 : 0;

  return {
    gdv,
    build,
    fees,
    contingency,
    financeCost,
    targetProfit,
    residual,
    profitPct,
    costToGDV,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
