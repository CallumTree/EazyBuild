
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
export const getDefaultSize = (type) => {
  const defaults = {
    '2-bed Semi/Terrace': 70,
    '3-bed Semi/Detached': 90,
    '4-bed Detached': 120,
    '2-bed Bungalow': 85,
    '3-bed Bungalow': 110,
    'Custom/Other': 80
  };
  return defaults[type] || 80;
};

/**
 * Estimate sales price for unit type
 * @param {string} type - Unit type
 * @param {boolean} garage - Has garage
 * @returns {number} Estimated sales price
 */
export const estSales = (type, garage = false) => {
  const basePrices = {
    '2-bed Semi/Terrace': 250000,
    '3-bed Semi/Detached': 300000,
    '4-bed Detached': 400000,
    '2-bed Bungalow': 270000,
    '3-bed Bungalow': 370000,
    'Custom/Other': 280000
  };
  
  const basePrice = basePrices[type] || 280000;
  return garage ? basePrice + 10000 : basePrice;
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
