import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { exportOfferPdf } from '../utils/pdfExport';

export const Topbar: React.FC = () => {
  const { currentProject } = useProjectStore();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('Import data:', data);
            alert('Import functionality would restore project from JSON');
          } catch (error) {
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportPDF = () => {
    if (!currentProject) {
      alert('No project selected');
      return;
    }
    exportOfferPdf(currentProject);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏗️</span>
          <h1 className="text-xl font-bold text-gray-900">LandSnap</h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button onClick={handleImport} className="btn-ghost">
            Import
          </button>
          <button onClick={handleExportPDF} className="btn-primary">
            Export Offer PDF
          </button>
        </div>
      </div>
    </header>
  );
};