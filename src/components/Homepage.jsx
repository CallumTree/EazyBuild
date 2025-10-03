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

        {/* Projects Dashboard */}
        {projects.length > 0 && (
          <div className="card">
            <div className="card-header">
              <span className="text-2xl">📊</span>
              <h2 className="card-title">Your Projects</h2>
            </div>
            <div className="card-body">
              <div className="flex overflow-x-auto space-x-4 pb-4">
                {projects.map(project => {
                  // Determine status border color based on profit target or other criteria
                  const getStatusColor = () => {
                    if (project.profitTarget >= 20) return 'border-green-500';
                    if (project.profitTarget >= 15) return 'border-amber-500';
                    return 'border-red-500';
                  };

                  return (
                    <div
                      key={project.id}
                      className={`relative flex-shrink-0 w-64 h-40 rounded-xl p-4 shadow-lg border-4 ${getStatusColor()} bg-slate-700/50 cursor-pointer hover:bg-slate-700/70 transition-all`}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setCurrentPhase('site');
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xl font-bold w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                      
                      <div className="text-4xl mb-2">🏠</div>
                      
                      <div className="text-white font-semibold text-base truncate">
                        {project.name}
                      </div>
                      
                      {project.location && (
                        <div className="text-slate-400 text-sm truncate">
                          📍 {project.location}
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-1 text-xs text-slate-300">
                        {project.siteAreaM2 > 0 && (
                          <span className="truncate">{project.siteAreaM2.toLocaleString()} m²</span>
                        )}
                        {project.profitTarget && (
                          <span>{project.profitTarget}%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* New Project Card */}
                <div
                  className="flex-shrink-0 w-64 h-40 rounded-xl p-4 shadow-lg border-4 border-slate-600 bg-slate-700/30 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-all"
                  onClick={() => {
                    // Open the create form or auto-create and navigate
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
                  <div className="text-4xl mb-2">🏠</div>
                  <div className="text-slate-300 font-medium">New Project</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}