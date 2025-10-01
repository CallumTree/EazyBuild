
import React, { useState, useEffect } from 'react';
import { getProject, updateProject } from '../utils/storage';

export function SitePhase({ projectId, onBack, onNext }) {
  const [project, setProject] = useState(null);
  const [postcode, setPostcode] = useState('');
  const [siteAreaM2, setSiteAreaM2] = useState(0);
  const [constraintsNote, setConstraintsNote] = useState('');
  const [localAuthority, setLocalAuthority] = useState('');
  const [densityHint, setDensityHint] = useState('');

  useEffect(() => {
    console.log('SitePhase loaded for project ID:', projectId);
    if (projectId) {
      const projectData = getProject(projectId);
      if (projectData) {
        setProject(projectData);
        setPostcode(projectData.postcode || '');
        setSiteAreaM2(projectData.siteAreaM2 || 0);
        setConstraintsNote(projectData.constraintsNote || '');
        setLocalAuthority(projectData.localAuthority || '');
        setDensityHint(projectData.densityHint || '');
      }
    }
  }, [projectId]);

  const handlePostcodeChange = (value) => {
    setPostcode(value.toUpperCase());
    
    // Mock lookup when postcode has 5+ characters
    if (value.length >= 5) {
      setLocalAuthority('London Borough of Example');
      setDensityHint('Avg 50-100 units/ha');
    } else {
      setLocalAuthority('');
      setDensityHint('');
    }
  };

  const handleNext = () => {
    if (!postcode.trim()) {
      alert('Please enter a postcode');
      return;
    }
    
    if (siteAreaM2 <= 0) {
      alert('Please enter a site area greater than 0');
      return;
    }

    try {
      updateProject(projectId, {
        postcode: postcode.trim(),
        siteAreaM2,
        constraintsNote: constraintsNote.trim(),
        localAuthority,
        densityHint
      });
      
      alert('Site phase data saved!');
      onNext();
    } catch (error) {
      alert('Error saving: ' + error.message);
    }
  };

  if (!project) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body">
            <p className="text-slate-300">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  const isReady = postcode.trim().length > 0 && siteAreaM2 > 0;

  return (
    <div className="container py-8">
      <div className="card">
        <div className="card-header">
          <button onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="card-title">Site Phase: Define Your Land</h1>
            <p className="text-slate-400 text-sm mt-1">{project.name}</p>
          </div>
        </div>
        
        <div className="card-body space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Postcode *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., SW1A 1AA"
                value={postcode}
                onChange={(e) => handlePostcodeChange(e.target.value)}
                required
              />
              {localAuthority && (
                <div className="mt-2 text-sm text-slate-400">
                  <p>📍 LA: {localAuthority}</p>
                  <p>🏘️ {densityHint}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Site Area (m²) *
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="Enter site area"
                value={siteAreaM2}
                onChange={(e) => setSiteAreaM2(parseFloat(e.target.value) || 0)}
                required
                min="1"
              />
              {siteAreaM2 > 0 && (
                <p className="text-sm text-slate-400 mt-1 kpi-value">
                  {siteAreaM2.toLocaleString()} m²
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Constraints Note
              </label>
              <textarea
                className="input-field input-field-lg"
                placeholder="e.g., Flood risk, existing trees, access issues..."
                value={constraintsNote}
                onChange={(e) => setConstraintsNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Summary Footer */}
          <div className="card bg-slate-700/30 border-slate-600">
            <div className="card-body">
              <div className="text-sm space-y-1">
                <p><strong>Postcode:</strong> {postcode || 'Not set'}</p>
                <p><strong>Area:</strong> {siteAreaM2 > 0 ? `${siteAreaM2.toLocaleString()} m²` : 'Not set'}</p>
                {densityHint && <p><strong>Density Hint:</strong> {densityHint}</p>}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className={`btn-ghost text-sm ${isReady ? 'text-green-400' : 'text-red-400'}`}>
                  {isReady ? '🟢 Ready—Proceed to Mix Stage' : '🔴 Add site area first'}
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!isReady}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Mix Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
