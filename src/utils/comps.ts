
import { Comp, CompSettings } from '../store/projectStore';

export const computePricePerSqft = (priceGBP: number, giaSqft: number): number => {
  return Math.round(priceGBP / giaSqft);
};

export const quantiles = (values: number[]): { p25: number; median: number; p75: number } => {
  if (values.length === 0) return { p25: 0, median: 0, p75: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  const p25Index = Math.floor(n * 0.25);
  const medianIndex = Math.floor(n * 0.5);
  const p75Index = Math.floor(n * 0.75);
  
  return {
    p25: Math.round(sorted[p25Index]),
    median: Math.round(n % 2 === 0 ? (sorted[medianIndex - 1] + sorted[medianIndex]) / 2 : sorted[medianIndex]),
    p75: Math.round(sorted[p75Index]),
  };
};

export const getMonthsDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
};

export const filterComps = (
  comps: Comp[],
  settings: CompSettings,
  projectPostcode?: string
): Comp[] => {
  const now = new Date();
  
  return comps.filter((comp) => {
    // Date filter
    const monthsAgo = getMonthsDifference(comp.date, now.toISOString());
    if (monthsAgo > settings.includeMonths) return false;
    
    // Beds filter
    if (settings.minBeds !== null && comp.beds < settings.minBeds) return false;
    if (settings.maxBeds !== null && comp.beds > settings.maxBeds) return false;
    
    // Postcode filter (strict mode)
    if (settings.strictPostcodeMode && projectPostcode) {
      const projectOutward = projectPostcode.split(' ')[0]?.toUpperCase();
      const compOutward = comp.postcode.split(' ')[0]?.toUpperCase();
      if (projectOutward && compOutward && projectOutward !== compOutward) return false;
    }
    
    return true;
  });
};

export const rejectOutliers = (comps: Comp[], iqrK: number): Comp[] => {
  if (comps.length < 3) return comps;
  
  const pricesPerSqft = comps.map(c => c.pricePerSqft);
  const { p25, p75 } = quantiles(pricesPerSqft);
  const iqr = p75 - p25;
  
  const lowerBound = p25 - iqrK * iqr;
  const upperBound = p75 + iqrK * iqr;
  
  const filtered = comps.filter(comp => 
    comp.pricePerSqft >= lowerBound && comp.pricePerSqft <= upperBound
  );
  
  // Fall back to original set if too few remain
  return filtered.length >= 3 ? filtered : comps;
};

export const computeCompsStats = (
  comps: Comp[],
  settings: CompSettings,
  projectPostcode?: string
) => {
  // Filter by date, beds, postcode
  let filteredComps = filterComps(comps, settings, projectPostcode);
  
  // Reject outliers
  filteredComps = rejectOutliers(filteredComps, settings.iqrK);
  
  if (filteredComps.length === 0) {
    return {
      count: 0,
      usedComps: [],
      stats: { p25: 0, median: 0, p75: 0 },
      recommended: 0,
    };
  }
  
  const pricesPerSqft = filteredComps.map(c => c.pricePerSqft);
  const stats = quantiles(pricesPerSqft);
  
  return {
    count: filteredComps.length,
    usedComps: filteredComps,
    stats,
    recommended: stats.median,
  };
};

export const formatCurrency = (amount: number): string => {
  return `£${amount.toLocaleString()}`;
};

export const formatDateForTable = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
