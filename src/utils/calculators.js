
import * as turf from '@turf/turf';

/**
 * Calculate site area from GeoJSON polygon
 * @param {Object} geoJSON - GeoJSON polygon feature
 * @returns {number} Area in square meters
 */
export function calcSiteArea(geoJSON) {
  try {
    if (!geoJSON || !geoJSON.geometry || geoJSON.geometry.type !== 'Polygon') {
      return 0;
    }
    
    // turf.area returns area in square meters
    const areaM2 = turf.area(geoJSON);
    return Math.round(areaM2);
  } catch (error) {
    console.warn('Failed to calculate area:', error);
    return 0;
  }
}

/**
 * Convert coordinates array to GeoJSON polygon
 * @param {Array} coords - Array of {lat, lng} objects
 * @returns {Object} GeoJSON polygon feature
 */
export function coordsToGeoJSON(coords) {
  if (!coords || coords.length < 3) {
    return null;
  }

  try {
    // Convert to [lng, lat] format and close the polygon
    const geoCoords = coords.map(coord => [coord.lng, coord.lat]);
    geoCoords.push(geoCoords[0]); // Close the polygon

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [geoCoords]
      },
      properties: {}
    };
  } catch (error) {
    console.warn('Failed to convert coordinates to GeoJSON:', error);
    return null;
  }
}

/**
 * Calculate density recommendation based on area and location
 * @param {number} areaM2 - Site area in square meters
 * @param {string} localAuthority - Local authority name
 * @returns {Object} Density recommendations
 */
export function calcDensityRecommendations(areaM2, localAuthority = '') {
  const areaHa = areaM2 / 10000;
  
  // Base recommendations
  let lowDensity = 25;
  let highDensity = 45;
  
  // Adjust based on location (mock logic)
  if (localAuthority.toLowerCase().includes('london')) {
    lowDensity = 40;
    highDensity = 80;
  } else if (localAuthority.toLowerCase().includes('city')) {
    lowDensity = 35;
    highDensity = 60;
  }
  
  return {
    areaHa: areaHa.toFixed(2),
    lowDensity,
    highDensity,
    estimatedUnitsLow: Math.floor(areaHa * lowDensity),
    estimatedUnitsHigh: Math.floor(areaHa * highDensity)
  };
}
