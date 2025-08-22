
import { Project } from '../store/projectStore';
import { computeCompsStats, formatCurrency, formatDateForTable } from './comps';

export const exportOfferPdf = (project: Project) => {
  // This is a simplified version - in a real app you'd use pdfmake
  const compsStats = computeCompsStats(project.comps, project.compSettings, project.compsPostcode);
  
  let content = `
# ${project.name} - Development Offer

## Project Summary
- Site Area: ${project.siteArea ? `${(project.siteArea / 4047).toFixed(2)} acres` : 'TBD'}
- Estimated Units: ${project.estimatedUnits || 'TBD'}
- House Type: ${project.houseType || 'TBD'}

## Financial Summary
- GDV: ${project.finance ? formatCurrency(project.finance.gdv) : 'TBD'}
- Residual Land Value: ${project.finance ? formatCurrency(project.finance.residualLandValue) : 'TBD'}
`;

  // Add Market Evidence section if comparables exist
  if (project.comps.length > 0 && compsStats.count > 0) {
    content += `
## Market Evidence
- Location Context: ${project.compsPostcode || 'Not specified'}
- Analysis Period: Last ${project.compSettings.includeMonths} months
- Comparables Used: ${compsStats.count} properties
- Price Range: ${formatCurrency(compsStats.stats.p25)} - ${formatCurrency(compsStats.stats.p75)}
- Median Price: ${formatCurrency(compsStats.stats.median)} per sqft

### Recent Comparable Sales:
`;
    
    // Show up to 5 comps
    const topComps = compsStats.usedComps.slice(0, 5);
    topComps.forEach(comp => {
      const monthYear = formatDateForTable(comp.date);
      content += `- ${comp.address}, ${comp.beds} bed ${comp.propertyType}, ${monthYear}, ${formatCurrency(comp.pricePerSqft)}/sqft\n`;
    });
  }

  // For now, just show in alert - in real app would generate actual PDF
  alert(`PDF Export:\n\n${content}`);
  console.log('PDF Content:', content);
};
