
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CustomUnitTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToMix: (unitType: {
    label: string;
    category: 'house' | 'bungalow' | 'apartment';
    areaM2: number;
    floors: number;
    buildCostPerM2: number;
    salePricePerUnit: number;
  }, saveToPresets: boolean) => void;
}

export function CustomUnitTypeModal({ isOpen, onClose, onAddToMix }: CustomUnitTypeModalProps) {
  const [formData, setFormData] = useState({
    label: '',
    category: 'house' as 'house' | 'bungalow' | 'apartment',
    areaM2: '',
    floors: '2',
    buildCostPerM2: '1650',
    salePricePerUnit: '',
  });
  const [saveToPresets, setSaveToPresets] = useState(false);

  const isValid = 
    formData.label.trim() !== '' &&
    parseFloat(formData.areaM2) > 0 &&
    parseFloat(formData.buildCostPerM2) > 0 &&
    parseFloat(formData.salePricePerUnit) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const unitType = {
      label: formData.label.trim(),
      category: formData.category,
      areaM2: parseFloat(formData.areaM2),
      floors: parseInt(formData.floors),
      buildCostPerM2: parseFloat(formData.buildCostPerM2),
      salePricePerUnit: parseFloat(formData.salePricePerUnit),
    };

    onAddToMix(unitType, saveToPresets);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      label: '',
      category: 'house',
      areaM2: '',
      floors: '2',
      buildCostPerM2: '1650',
      salePricePerUnit: '',
    });
    setSaveToPresets(false);
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Client 3-bed special"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
                value={formData.areaM2}
                onChange={(e) => setFormData({ ...formData, areaM2: e.target.value })}
                placeholder="120"
                min="1"
                step="1"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Floors
              </label>
              <select
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
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
              value={formData.buildCostPerM2}
              onChange={(e) => setFormData({ ...formData, buildCostPerM2: e.target.value })}
              placeholder="1650"
              min="1"
              step="1"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sale price per unit
            </label>
            <input
              type="number"
              value={formData.salePricePerUnit}
              onChange={(e) => setFormData({ ...formData, salePricePerUnit: e.target.value })}
              placeholder="350000"
              min="1"
              step="1"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
              disabled={!isValid}
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
