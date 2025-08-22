
import React from 'react';

export const Topbar: React.FC = () => {
  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import clicked');
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log('Export PDF clicked');
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
