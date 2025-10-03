
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
 * Calculate viability metrics
 * @param {number} gdv - Gross Development Value
 * @param {Object} costs - Costs object {land, build, infra, fees}
 * @param {Object} adders - Adders object {contingency, lender}
 * @param {number} targetPogdv - Target profit on GDV %
 * @returns {Object} Viability results
 */
export const calcViability = (gdv, costs, adders, targetPogdv = 20) => {
  const baseCosts = costs.land + costs.build + costs.infra + costs.fees;
  const contingencyAmount = baseCosts * adders.contingency;
  const lenderAmount = (baseCosts + contingencyAmount) * adders.lender;
  const totalCosts = baseCosts + contingencyAmount + lenderAmount;
  
  const profit = gdv - totalCosts;
  const pogdv = gdv > 0 ? (profit / gdv) * 100 : 0;
  const poc = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
  const residual = profit - (gdv * targetPogdv / 100);
  
  return {
    profit,
    pogdv,
    poc,
    residual,
    totalCosts,
    contingencyAmount,
    lenderAmount
  };
};

/**
 * Get viability status and improvement levers
 * @param {Object} results - Viability results
 * @param {Object} costs - Costs object
 * @param {number} s106Amount - S106 amount
 * @param {number} architectFee - Architect fee
 * @param {number} landCost - Land cost
 * @returns {Object} Status info with levers
 */
export const getStatusAndLevers = (results, costs, s106Amount, architectFee, landCost) => {
  const { pogdv, poc, residual } = results;
  
  if (pogdv >= 20 && poc >= 15 && residual >= 0) {
    return {
      status: 'viable',
      message: 'Project is viable! Targets met.',
      levers: []
    };
  }
  
  if (pogdv >= 15 && residual >= 0) {
    // Calculate potential savings
    const levers = [];
    
    if (s106Amount > 0) {
      const s106Saving = s106Amount * 0.05;
      levers.push('Cut S106 by 5% (saves £' + Math.round(s106Saving).toLocaleString() + ')');
    }
    
    if (architectFee > 10000) {
      const archSaving = architectFee * 0.1;
      levers.push('Trim architect by 10% (saves £' + Math.round(archSaving).toLocaleString() + ')');
    }
    
    if (landCost > 0) {
      const landSaving = landCost * 0.05;
      levers.push('Negotiate land down 5% (saves £' + Math.round(landSaving).toLocaleString() + ')');
    }
    
    const totalSavings = (s106Amount * 0.05) + (architectFee * 0.1) + (landCost * 0.05);
    
    return {
      status: 'amber',
      message: 'At risk - Save £' + Math.round(totalSavings).toLocaleString() + ' to improve margins:',
      levers: levers.slice(0, 3)
    };
  }
  
  return {
    status: 'red',
    message: 'Project unviable - Significant revisions needed',
    levers: [
      'Increase sales values or reduce costs substantially',
      'Reconsider site acquisition or planning strategy'
    ]
  };
};
