
import type { UnitType } from '../store/viability';

export function netDevelopableArea(polygonAreaM2: number, infraAllowancePct: number) {
  return polygonAreaM2 * (1 - clamp(infraAllowancePct, 0, 0.9));
}

export function totalGIA(unitTypes: UnitType[]) {
  return unitTypes.reduce((sum, u) => sum + u.areaM2 * u.count, 0);
}

export function totalBuildCost(unitTypes: UnitType[]) {
  return unitTypes.reduce((sum, u) => sum + (u.areaM2 * u.buildCostPerM2) * u.count, 0);
}

export function totalSalesValue(unitTypes: UnitType[]) {
  return unitTypes.reduce((sum, u) => {
    const sales = u.salePricePerUnit ?? (u.salePricePerM2 ? u.salePricePerM2 * u.areaM2 : 0);
    return sum + sales * u.count;
  }, 0);
}

export function margins(unitTypes: UnitType[]) {
  const build = totalBuildCost(unitTypes);
  const sales = totalSalesValue(unitTypes);
  const profit = sales - build;
  const marginPct = sales > 0 ? profit / sales : 0;
  return { build, sales, profit, marginPct };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
