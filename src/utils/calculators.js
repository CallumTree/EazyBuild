
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
