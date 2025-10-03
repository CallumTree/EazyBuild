import * as turf from '@turf/turf';

/**
 * Calculate site area from GeoJSON polygon
 * @param {Object} geoJSON - GeoJSON feature
 * @returns {number} Area in square meters
 */
export const calcSiteArea = (geoJSON) => {
  if (!geoJSON) return 0;
  return turf.area(geoJSON);
};

/**
 * Get default size for unit type
 * @param {string} type - Unit type
 * @returns {number} Default size in m²
 */
export const estSize = (type) => {
  const sizes = {
    '2-bed Semi/Terrace': 70,
    '2-bed Detached': 80,
    '3-bed Semi': 95,
    '3-bed Detached': 110,
    '4-bed Detached': 135,
    '2-bed Bungalow': 60,
    '3-bed Bungalow': 80,
    'Custom': 80
  };
  return sizes[type] || 80;
};

export const getDefaultSize = estSize; // Backward compatibility

/**
 * Estimate base sales price for unit type
 * @param {string} type - Unit type
 * @param {boolean} garage - Has garage
 * @returns {number} Base sales price (before regional multiplier)
 */
export const estBaseSales = (type, garage = false) => {
  const basePrices = {
    '2-bed Semi/Terrace': 240000,
    '2-bed Detached': 300000,
    '3-bed Semi': 280000,
    '3-bed Detached': 380000,
    '4-bed Detached': 452000,
    '2-bed Bungalow': 260000,
    '3-bed Bungalow': 330000,
    'Custom': 280000
  };

  const basePrice = basePrices[type] || 280000;
  return garage ? basePrice + 20000 : basePrice;
};

export const estSales = estBaseSales; // Backward compatibility

/**
 * Apply regional multiplier to base price
 * @param {number} base - Base price
 * @param {number} multiplier - Regional multiplier
 * @returns {number} Adjusted price
 */
export const applyMultiplier = (base, multiplier = 1.0) => {
  return Math.round(base * multiplier);
};

/**
 * Calculate total GDV with regional multiplier
 * @param {Array} mix - Unit mix array
 * @param {number} multiplier - Regional multiplier
 * @returns {number} Total GDV
 */
export const calcGDV = (mix, multiplier = 1.0) => {
  return mix.reduce((sum, row) => {
    const units = parseInt(row.units) || 0;
    const baseSales = estBaseSales(row.type, row.garage);
    const adjustedSales = applyMultiplier(baseSales, multiplier);
    return sum + (units * adjustedSales);
  }, 0);
};

/**
 * Adjust size for garage
 * @param {number} currentSize - Current size
 * @param {boolean} hasGarage - New garage state
 * @param {boolean} hadGarage - Previous garage state
 * @returns {number} Adjusted size
 */
export const adjustGarage = (currentSize, hasGarage, hadGarage) => {
  if (hasGarage && !hadGarage) {
    return currentSize + 15;
  } else if (!hasGarage && hadGarage) {
    return currentSize - 15;
  }
  return currentSize;
};

/**
 * Calculate build cost per m² for unit type
 * @param {Object} row - Unit mix row
 * @returns {number} Build cost per m²
 */
export const calcBuildCost = (row) => {
  if (row.buildCostPerM2) return row.buildCostPerM2;

  const buildCosts = {
    '2-bed Semi/Terrace': 1450,
    '2-bed Detached': 1500,
    '3-bed Semi': 1500,
    '3-bed Detached': 1550,
    '4-bed Detached': 1600,
    '2-bed Bungalow': 1550,
    '3-bed Bungalow': 1600,
  };

  return buildCosts[row.type] || 1500;
};

/**
 * Calculate total build cost for a unit mix row
 * @param {Object} row - Unit mix row
 * @returns {number} Total build cost
 */
export const calcBuildCostTotal = (row) => {
  const costPerM2 = calcBuildCost(row);
  const sizeM2 = parseFloat(row.sizeM2) || 0;
  const units = parseInt(row.units) || 0;
  return costPerM2 * sizeM2 * units;
};