import React, { useState, useEffect } from 'react';
import { getProjects, saveProject, deleteProject, updateProject } from '../utils/storage';
import { SitePhase } from './SitePhase';
import { MixPhase } from './MixPhase';

export function Homepage() {
  const [projects, setProjects] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showOptionals, setShowOptionals] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    siteAreaM2: '',
    profitTarget: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = getProjects();
    setProjects(savedProjects);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    try {
      const newProject = saveProject({
        name: formData.name.trim(),
        location: formData.location.trim(),
        siteAreaM2: parseFloat(formData.siteAreaM2) || 0,
        profitTarget: parseFloat(formData.profitTarget) || 20
      });

      // Reset form
      setFormData({
        name: '',
        location: '',
        siteAreaM2: '',
        profitTarget: ''
      });

      // Navigate to Site Phase
      setSelectedProjectId(newProject.id);
      setCurrentPhase('site');

      // Reload projects
      loadProjects();
    } catch (error) {
      alert('Error creating project: ' + error.message);
    }
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
      loadProjects();
    }
  };

  // Site Phase Component
  if (currentPhase === 'site' && selectedProjectId) {
    return (
      <SitePhase
        projectId={selectedProjectId}
        onBack={() => {
          setCurrentPhase('home');
          setSelectedProjectId(null);
        }}
        onNext={() => setCurrentPhase('mix')}
      />
    );
  }

  // Mix Phase
  if (currentPhase === 'mix' && selectedProjectId) {
    return (
      <MixPhase
        projectId={selectedProjectId}
        onBack={() => setCurrentPhase('site')}
        onNext={() => setCurrentPhase('viability')}
      />
    );
  }

  // Viability Phase placeholder
  if (currentPhase === 'viability') {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">💰</span>
            <h2 className="card-title">Viability Phase: Coming Soon</h2>
          </div>
          <div className="card-body space-y-6">
            <p className="text-slate-300">Viability analysis coming soon!</p>
            <p className="text-slate-400">Project ID: {selectedProjectId}</p>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPhase('mix')} className="btn-secondary">
                ← Back to Mix
              </button>
              <button onClick={() => {
                setCurrentPhase('home');
                setSelectedProjectId(null);
              }} className="btn-ghost">
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Homepage
  return (
    <div className="app-shell">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            <span className="text-3xl">🏗️</span>
            <div>
              <h1 className="card-title text-2xl">EazyBuild</h1>
              <p className="text-slate-400 mt-1">Smart UK Property Development Tool</p>
            </div>
          </div>
          <div className="card-body space-y-6">
            <p className="text-slate-300 leading-relaxed">
              Quick feasibility assessment for UK property developers. Create projects, define your land, and generate appraisals.
            </p>
          </div>
        </div>

        {/* Create Project Form */}
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">➕</span>
            <h2 className="card-title">Create New Project</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Maple Grove Development"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Birmingham, West Midlands"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              {/* Optional Fields Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowOptionals(!showOptionals)}
                  className="btn-ghost text-sm"
                >
                  {showOptionals ? '▼' : '▶'} Optional Fields
                </button>
              </div>

              {showOptionals && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Estimated Site Area (m²)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g., 5000"
                      value={formData.siteAreaM2}
                      onChange={(e) => handleInputChange('siteAreaM2', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Target Profit (%)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g., 20"
                      value={formData.profitTarget}
                      onChange={(e) => handleInputChange('profitTarget', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary">
                <span>🚀</span>
                Create Project
              </button>
            </form>
          </div>
        </div>

        {/* Projects Dashboard - Wallet Style Cards */}
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">💳</span>
            <h2 className="card-title">Your Projects</h2>
          </div>
          <div className="card-body p-0">
            {/* Horizontal scrolling container */}
            <div 
              className="flex overflow-x-auto gap-4 px-6 py-6 snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'thin',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {projects.map(project => {
                // Determine border color based on profitMargin
                const getBorderColor = () => {
                  const margin = project.profitMargin || project.profitTarget || 0;
                  if (margin >= 22) return 'border-l-green-500';
                  if (margin >= 16) return 'border-l-amber-500';
                  return 'border-l-red-500';
                };

                const handleImageUpload = (e) => {
                  e.stopPropagation();
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        updateProject(project.id, { image: ev.target.result });
                        loadProjects();
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                };

                return (
                  <div
                    key={project.id}
                    className={`relative flex-shrink-0 w-80 h-44 rounded-xl p-5 shadow-2xl border-l-8 ${getBorderColor()} bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 cursor-pointer hover:scale-[1.02] hover:shadow-3xl transition-all duration-300 snap-start`}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setCurrentPhase('site');
                    }}
                  >
                    {/* Project Image/Icon Section */}
                    <div className="flex items-start gap-4 mb-3">
                      {project.image ? (
                        <img 
                          src={project.image} 
                          className="w-20 h-20 rounded-lg object-cover shadow-lg ring-2 ring-slate-600" 
                          alt={project.name}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-slate-900/50 flex items-center justify-center text-4xl shadow-lg">
                          🏠
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {/* Project Name */}
                        <h3 className="text-white font-bold text-lg truncate mb-1">
                          {project.name}
                        </h3>
                        
                        {/* Location */}
                        {project.location && (
                          <p className="text-slate-400 text-sm truncate flex items-center gap-1">
                            <span>📍</span>
                            <span>{project.location}</span>
                          </p>
                        )}

                        {/* Project Stats */}
                        <div className="flex gap-3 mt-2 text-xs">
                          {project.siteAreaM2 > 0 && (
                            <span className="text-slate-500">
                              {project.siteAreaM2.toLocaleString()}m²
                            </span>
                          )}
                          <span className={`font-semibold ${
                            project.profitMargin >= 22 ? 'text-green-400' :
                            project.profitMargin >= 16 ? 'text-amber-400' :
                            'text-red-400'
                          }`}>
                            {project.profitMargin || project.profitTarget || 0}% target
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={handleImageUpload}
                        className="w-8 h-8 flex items-center justify-center bg-slate-900/70 hover:bg-slate-900 rounded-lg backdrop-blur-sm transition-all text-slate-400 hover:text-white"
                        title="Upload image"
                      >
                        📷
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-slate-900/70 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-all text-slate-400 hover:text-white font-bold"
                        title="Delete project"
                      >
                        ×
                      </button>
                    </div>

                    {/* Status Indicator */}
                    <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                      project.profitMargin >= 22 ? 'bg-green-500/20 text-green-400' :
                      project.profitMargin >= 16 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {project.profitMargin >= 22 ? 'Strong' : 
                       project.profitMargin >= 16 ? 'Moderate' : 'Weak'}
                    </div>
                  </div>
                );
              })}
              
              {/* New Project Card */}
              <div
                className="flex-shrink-0 w-80 h-44 rounded-xl p-5 shadow-2xl border-4 border-dashed border-slate-600 bg-slate-800/30 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] hover:bg-slate-700/40 hover:border-blue-500/50 transition-all duration-300 snap-start group"
                onClick={() => {
                  const newName = `Project ${projects.length + 1}`;
                  const newProject = saveProject({
                    name: newName,
                    location: '',
                    siteAreaM2: 0,
                    profitTarget: 20
                  });
                  setSelectedProjectId(newProject.id);
                  setCurrentPhase('site');
                  loadProjects();
                }}
              >
                <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">➕</div>
                <div className="text-slate-300 font-bold text-lg">New Project</div>
                <div className="text-slate-500 text-sm mt-1">Click to create</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}