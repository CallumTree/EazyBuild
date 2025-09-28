

import type { UnitType } from '../store/viability';
import type { HouseType, UnitMix } from '../store';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function netDevelopableArea(siteAreaM2: number, infraAllowancePct: number) {
  return siteAreaM2 * (1 - clamp(infraAllowancePct / 100, 0, 0.9));
}

export function selectedUnits(unitMix: UnitMix[]) {
  return unitMix.reduce((sum, mix) => sum + mix.count, 0);
}

export function totalGIA(unitMix: UnitMix[], houseTypes: HouseType[]) {
  return unitMix.reduce((sum, mix) => {
    const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
    return sum + (houseType ? houseType.floorAreaSqm * mix.count : 0);
  }, 0);
}

export function totalBuildCost(unitMix: UnitMix[], houseTypes: HouseType[]) {
  return unitMix.reduce((sum, mix) => {
    const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
    return sum + (houseType ? houseType.floorAreaSqm * houseType.buildCostPerSqm * mix.count : 0);
  }, 0);
}

export function totalSalesValue(unitMix: UnitMix[], houseTypes: HouseType[]) {
  return unitMix.reduce((sum, mix) => {
    const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
    return sum + (houseType ? houseType.floorAreaSqm * houseType.saleValuePerSqm * mix.count : 0);
  }, 0);
}

export function margins(unitMix: UnitMix[], houseTypes: HouseType[]) {
  const build = totalBuildCost(unitMix, houseTypes);
  const sales = totalSalesValue(unitMix, houseTypes);
  const profit = sales - build;
  const marginPct = sales > 0 ? (profit / sales) * 100 : 0;
  return { build, sales, profit, marginPct };
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return '£0';
  if (amount >= 1000000) {
    return `£${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `£${(amount / 1000).toFixed(0)}k`;
  }
  return `£${amount.toFixed(0)}`;
}

export function formatArea(areaM2: number): string {
  return `${Math.round(areaM2).toLocaleString()}m²`;
}
