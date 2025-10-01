
import React, { useState, useEffect } from 'react';
import { getProjects, updateProject } from '../utils/storage';

export function SitePhase({ projectId, onBack, onNext }) {
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    postcode: '',
    siteAreaM2: 0,
    constraintsNote: ''
  });
  const [localAuthority, setLocalAuthority] = useState('');
  const [densityRange, setDensityRange] = useState('');

  // Load project data
  useEffect(() => {
    if (projectId) {
      const projects = getProjects();
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        setFormData({
          postcode: foundProject.postcode || '',
          siteAreaM2: foundProject.siteAreaM2 || 0,
          constraintsNote: foundProject.constraintsNote || ''
        });
      }
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    
    if (name === 'postcode') {
      processedValue = value.toUpperCase();
    } else if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Mock local authority and density lookup
    if (name === 'postcode' && processedValue.length >= 5) {
      setLocalAuthority('London Borough of Example');
      setDensityRange('Avg 50-100 units/ha');
    } else if (name === 'postcode') {
      setLocalAuthority('');
      setDensityRange('');
    }
  };

  const handleNext = () => {
    if (formData.siteAreaM2 <= 0 || !formData.postcode.trim()) {
      alert('Please enter both postcode and site area before continuing');
      return;
    }

    try {
      updateProject(projectId, {
        postcode: formData.postcode,
        siteAreaM2: formData.siteAreaM2,
        constraintsNote: formData.constraintsNote
      });
      alert('Site data saved successfully!');
      onNext();
    } catch (error) {
      alert('Failed to save site data. Please try again.');
    }
  };

  const getStatusChip = () => {
    const isValid = formData.siteAreaM2 > 0 && formData.postcode.trim();
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {isValid ? '🟢 Ready' : '🔴 Incomplete'}
      </span>
    );
  };

  if (!project) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center py-16">
            <p className="text-slate-400">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="card">
        <div className="card-header">
          <button onClick={onBack} className="btn-ghost mr-4">
            ← Back
          </button>
          <span className="text-2xl">🗺️</span>
          <div>
            <h2 className="card-title">Site Phase: Define Your Land</h2>
            <p className="text-slate-400 mt-1">{project.name}</p>
          </div>
        </div>
        <div className="card-body space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Postcode *
              </label>
              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g. SW1A 1AA"
                required
              />
              {localAuthority && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-slate-400">📍 {localAuthority}</p>
                  <p className="text-sm text-slate-400">🏠 {densityRange}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Site Area (m²) *
              </label>
              <input
                type="number"
                name="siteAreaM2"
                value={formData.siteAreaM2}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter site area"
                min="1"
                required
              />
              {formData.siteAreaM2 > 0 && (
                <p className="text-sm text-slate-400 mt-2">
                  {(formData.siteAreaM2 / 10000).toFixed(2)} hectares • {(formData.siteAreaM2 * 0.000247105).toFixed(2)} acres
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Constraints & Notes
            </label>
            <textarea
              name="constraintsNote"
              value={formData.constraintsNote}
              onChange={handleInputChange}
              className="input-field"
              rows="4"
              placeholder="Add any site constraints, planning notes, or observations..."
            />
          </div>

          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">
                  Site ready for unit mix planning
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formData.postcode || 'No postcode'} • {formData.siteAreaM2 > 0 ? `${formData.siteAreaM2.toLocaleString()} m²` : 'No area set'}
                </p>
              </div>
              {getStatusChip()}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleNext} 
              disabled={formData.siteAreaM2 <= 0 || !formData.postcode.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Unit Mix →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
