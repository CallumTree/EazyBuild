
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
 * Get default size for unit type (2025 UK averages)
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

// Backward compatibility
export const getDefaultSize = estSize;

/**
 * Estimate base sales price for unit type (2025 UK averages)
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

// Backward compatibility
export const estSales = estBaseSales;

/**
 * Apply regional multiplier to base price
 * @param {number} basePrice - Base price
 * @param {number} multiplier - Regional multiplier (default 1.0)
 * @returns {number} Adjusted price
 */
export const applyMultiplier = (basePrice, multiplier = 1.0) => {
  return Math.round(basePrice * multiplier);
};

/**
 * Calculate total GDV with regional multiplier
 * @param {Array} mixRows - Unit mix array
 * @param {number} multiplier - Regional multiplier (default 1.0)
 * @returns {number} Total GDV
 */
export const calcGDV = (mixRows, multiplier = 1.0) => {
  return mixRows.reduce((sum, row) => {
    const units = parseInt(row.units) || 0;
    const basePrice = parseFloat(row.baseSalesPrice) || 0;
    return sum + (units * applyMultiplier(basePrice, multiplier));
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
 * Get garage bonus for sales price
 * @returns {number} Garage price bonus
 */
export const getGarageBonus = () => {
  return 20000;
};
