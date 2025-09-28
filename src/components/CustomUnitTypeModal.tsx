import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CustomUnitTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToMix: (unitType: {
    name: string;
    category: 'house' | 'bungalow' | 'apartment';
    floorAreaSqm: number;
    floors: number;
    buildCostPerSqm: number;
    saleValuePerSqm: number;
  }, saveToPresets: boolean) => void;
}

export function CustomUnitTypeModal({ isOpen, onClose, onAddToMix }: CustomUnitTypeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'house' as 'house' | 'bungalow' | 'apartment',
    floorAreaSqm: '',
    floors: 2,
    buildCostPerSqm: '2000',
    saleValuePerSqm: '',
  });
  const [saveToPresets, setSaveToPresets] = useState(false);

  const isValid = () => {
    return (
      formData.name.trim() &&
      parseFloat(formData.floorAreaSqm) > 0 &&
      parseFloat(formData.buildCostPerSqm) > 0 &&
      parseFloat(formData.saleValuePerSqm) > 0
    );
  };

  const handleReset = () => {
    setFormData({
      name: '',
      category: 'house',
      floorAreaSqm: '',
      floors: 2,
      buildCostPerSqm: '2000',
      saleValuePerSqm: '',
    });
    setSaveToPresets(false);
  };

  const handleSubmit = () => {
    if (!isValid()) return;

    onAddToMix(
      {
        name: formData.name,
        category: formData.category,
        floorAreaSqm: parseFloat(formData.floorAreaSqm),
        floors: formData.floors,
        buildCostPerSqm: parseFloat(formData.buildCostPerSqm),
        saleValuePerSqm: parseFloat(formData.saleValuePerSqm),
      },
      saveToPresets
    );

    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-600 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-lg font-semibold text-white">Add Custom House Type</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Client 3-bed special"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as 'house' | 'bungalow' | 'apartment' })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="house">House</option>
              <option value="bungalow">Bungalow</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                GIA (m²)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.floorAreaSqm}
                onChange={(e) => setFormData(prev => ({ ...prev, floorAreaSqm: e.target.value }))}
                placeholder="90"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Floors
              </label>
              <select
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              £/m² Build
            </label>
            <input
              type="number"
              min="1"
              step="50"
              value={formData.buildCostPerSqm}
              onChange={(e) => setFormData(prev => ({ ...prev, buildCostPerSqm: e.target.value }))}
              placeholder="2000"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sale price per m² (£)
            </label>
            <input
              type="number"
              min="1"
              step="100"
              value={formData.saleValuePerSqm}
              onChange={(e) => setFormData(prev => ({ ...prev, saleValuePerSqm: e.target.value }))}
              placeholder="2800"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveToPresets"
              checked={saveToPresets}
              onChange={(e) => setSaveToPresets(e.target.checked)}
              className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-slate-600 rounded bg-slate-700"
            />
            <label htmlFor="saveToPresets" className="ml-2 text-sm text-slate-300">
              Save to my presets
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid()}
              className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add to mix
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}