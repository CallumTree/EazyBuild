
import React, { useState, useMemo } from 'react';
import { useProjectStore, Comp } from '../store/projectStore';
import { computeCompsStats, formatCurrency, formatDateForTable } from '../utils/comps';

interface ComparablesProps {
  projectId: string;
}

export const Comparables: React.FC<ComparablesProps> = ({ projectId }) => {
  const { 
    projects, 
    addComp, 
    updateComp, 
    deleteComp, 
    updateCompSettings, 
    clearComps,
    updateFinance 
  } = useProjectStore();
  
  const project = projects.find(p => p.id === projectId);
  const [editingComp, setEditingComp] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [recommendedOverride, setRecommendedOverride] = useState<string>('');

  if (!project) return null;

  const { comps, compSettings, compsPostcode } = project;

  const compsStats = useMemo(() => {
    return computeCompsStats(comps, compSettings, compsPostcode);
  }, [comps, compSettings, compsPostcode]);

  const handleAddPreset = () => {
    const preset = {
      address: '',
      postcode: compsPostcode || '',
      beds: 3,
      propertyType: 'semi' as const,
      date: new Date().toISOString().split('T')[0],
      priceGBP: 250000,
      giaSqft: 900,
      notes: '',
    };
    addComp(projectId, preset);
  };

  const handleCompUpdate = (compId: string, field: string, value: any) => {
    updateComp(projectId, compId, { [field]: value });
  };

  const handleDeleteComp = (compId: string) => {
    if (confirm('Delete this comparable?')) {
      deleteComp(projectId, compId);
    }
  };

  const handleApplyToFinance = () => {
    const recommended = recommendedOverride ? 
      parseFloat(recommendedOverride) : 
      compsStats.recommended;
    
    if (!recommended || recommended <= 0) return;
    
    const currentFinance = project.finance || {
      gdv: 0,
      buildCosts: 0,
      fees: 0,
      contingency: 0,
      profit: 0,
      residualLandValue: 0,
    };

    const updatedFinance = {
      ...currentFinance,
      pricePerSqft: recommended,
    };

    updateFinance(projectId, updatedFinance);
    alert('Price per sqft applied to finance calculations!');
  };

  const canApply = compsStats.count > 0 && (recommendedOverride ? parseFloat(recommendedOverride) > 0 : compsStats.recommended > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Market Comparables</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn-ghost text-sm"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Postcode Context */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Postcode Context
        </label>
        <input
          type="text"
          value={compsPostcode || ''}
          onChange={(e) => useProjectStore.getState().updateProject(projectId, { compsPostcode: e.target.value })}
          placeholder="e.g. SW1A 1AA"
          className="input-field max-w-xs"
        />
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Filter Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Include Months
              </label>
              <input
                type="number"
                value={compSettings.includeMonths}
                onChange={(e) => updateCompSettings(projectId, { includeMonths: parseInt(e.target.value) })}
                className="input-field"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IQR Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                value={compSettings.iqrK}
                onChange={(e) => updateCompSettings(projectId, { iqrK: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Beds
              </label>
              <input
                type="number"
                value={compSettings.minBeds || ''}
                onChange={(e) => updateCompSettings(projectId, { minBeds: e.target.value ? parseInt(e.target.value) : null })}
                className="input-field"
                min="1"
                placeholder="Any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Beds
              </label>
              <input
                type="number"
                value={compSettings.maxBeds || ''}
                onChange={(e) => updateCompSettings(projectId, { maxBeds: e.target.value ? parseInt(e.target.value) : null })}
                className="input-field"
                min="1"
                placeholder="Any"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={compSettings.strictPostcodeMode}
                onChange={(e) => updateCompSettings(projectId, { strictPostcodeMode: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Strict postcode matching (same outward code)</span>
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={handleAddPreset} className="btn-primary">
          Add Preset Comp
        </button>
        <button onClick={() => clearComps(projectId)} className="btn-ghost">
          Clear All
        </button>
        <button onClick={() => window.location.reload()} className="btn-ghost">
          Recompute Stats
        </button>
      </div>

      {/* Comparables Table */}
      {comps.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Address</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Beds</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Price</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">GIA sqft</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">£/sqft</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comps.map((comp) => (
                  <CompRow
                    key={comp.id}
                    comp={comp}
                    isEditing={editingComp === comp.id}
                    onEdit={() => setEditingComp(comp.id)}
                    onSave={() => setEditingComp(null)}
                    onDelete={() => handleDeleteComp(comp.id)}
                    onUpdate={handleCompUpdate}
                    isUsed={compsStats.usedComps.some(c => c.id === comp.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Card */}
      {compsStats.count > 0 && (
        <div className="card p-4">
          <h4 className="font-medium text-gray-900 mb-3">Market Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{compsStats.count}</div>
              <div className="text-sm text-gray-500">Comps Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(compsStats.stats.p25)}</div>
              <div className="text-sm text-gray-500">25th Percentile</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(compsStats.stats.median)}</div>
              <div className="text-sm text-gray-500">Median</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(compsStats.stats.p75)}</div>
              <div className="text-sm text-gray-500">75th Percentile</div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommended £/sqft
                </label>
                <input
                  type="number"
                  value={recommendedOverride || compsStats.recommended}
                  onChange={(e) => setRecommendedOverride(e.target.value)}
                  className="input-field w-32"
                  placeholder={compsStats.recommended.toString()}
                />
              </div>
              <div className="mt-6">
                <button
                  onClick={handleApplyToFinance}
                  disabled={!canApply}
                  className={`btn-primary ${!canApply ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Apply to Finance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {comps.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">🏘️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Comparables Yet</h3>
          <p className="text-gray-600 mb-4">
            Add comparable sales to estimate market value per square foot
          </p>
          <button onClick={handleAddPreset} className="btn-primary">
            Add Your First Comparable
          </button>
        </div>
      )}
    </div>
  );
};

interface CompRowProps {
  comp: Comp;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (compId: string, field: string, value: any) => void;
  isUsed: boolean;
}

const CompRow: React.FC<CompRowProps> = ({ 
  comp, 
  isEditing, 
  onEdit, 
  onSave, 
  onDelete, 
  onUpdate,
  isUsed 
}) => {
  const rowClass = isUsed ? 'bg-green-50' : comp.address === '' ? 'bg-red-50' : '';

  if (isEditing) {
    return (
      <tr className={`border-b ${rowClass}`}>
        <td className="px-3 py-2">
          <input
            type="text"
            value={comp.address}
            onChange={(e) => onUpdate(comp.id, 'address', e.target.value)}
            className="w-full text-xs border rounded px-2 py-1"
            placeholder="Address"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={comp.beds}
            onChange={(e) => onUpdate(comp.id, 'beds', parseInt(e.target.value))}
            className="w-16 text-xs border rounded px-2 py-1"
            min="1"
          />
        </td>
        <td className="px-3 py-2">
          <select
            value={comp.propertyType}
            onChange={(e) => onUpdate(comp.id, 'propertyType', e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="detached">Detached</option>
            <option value="semi">Semi</option>
            <option value="terraced">Terraced</option>
            <option value="flat">Flat</option>
            <option value="bungalow">Bungalow</option>
            <option value="other">Other</option>
          </select>
        </td>
        <td className="px-3 py-2">
          <input
            type="date"
            value={comp.date.split('T')[0]}
            onChange={(e) => onUpdate(comp.id, 'date', e.target.value)}
            className="w-32 text-xs border rounded px-2 py-1"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={comp.priceGBP}
            onChange={(e) => onUpdate(comp.id, 'priceGBP', parseFloat(e.target.value))}
            className="w-24 text-xs border rounded px-2 py-1"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={comp.giaSqft}
            onChange={(e) => onUpdate(comp.id, 'giaSqft', parseFloat(e.target.value))}
            className="w-20 text-xs border rounded px-2 py-1"
          />
        </td>
        <td className="px-3 py-2 font-medium">
          £{comp.pricePerSqft.toLocaleString()}
        </td>
        <td className="px-3 py-2">
          <button onClick={onSave} className="text-green-600 hover:text-green-800 text-xs mr-2">
            Save
          </button>
          <button onClick={onDelete} className="text-red-600 hover:text-red-800 text-xs">
            Delete
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-b hover:bg-gray-50 ${rowClass}`}>
      <td className="px-3 py-2">{comp.address || <span className="text-red-500">Missing</span>}</td>
      <td className="px-3 py-2">{comp.beds}</td>
      <td className="px-3 py-2 capitalize">{comp.propertyType}</td>
      <td className="px-3 py-2">{formatDateForTable(comp.date)}</td>
      <td className="px-3 py-2">{formatCurrency(comp.priceGBP)}</td>
      <td className="px-3 py-2">{comp.giaSqft.toLocaleString()}</td>
      <td className="px-3 py-2 font-medium">£{comp.pricePerSqft.toLocaleString()}</td>
      <td className="px-3 py-2">
        <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 text-xs mr-2">
          Edit
        </button>
        <button onClick={onDelete} className="text-red-600 hover:text-red-800 text-xs">
          Delete
        </button>
      </td>
    </tr>
  );
};
