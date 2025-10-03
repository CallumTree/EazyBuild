
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

  const handleNewProject = () => {
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

        {/* Google Wallet Style Projects Dashboard */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="text-2xl">💳</span>
            <h2 className="card-title">Your Projects</h2>
          </div>
          
          {/* Horizontal Scrolling Container */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6">
            <div 
              className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-thin"
              style={{ scrollPaddingLeft: '1.5rem' }}
            >
              {projects.map(project => {
                // Calculate profitability status (traffic light system)
                const getProfitStatus = () => {
                  const margin = project.profitMargin || project.profitTarget || 0;
                  if (margin >= 22) return { color: 'green', label: 'Strong', border: 'border-green-500', glow: 'shadow-green-500/50' };
                  if (margin >= 16) return { color: 'amber', label: 'Moderate', border: 'border-amber-500', glow: 'shadow-amber-500/50' };
                  return { color: 'red', label: 'Weak', border: 'border-red-500', glow: 'shadow-red-500/50' };
                };

                const status = getProfitStatus();

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
                    className="wallet-card flex-shrink-0 w-80 h-48 relative rounded-2xl overflow-hidden cursor-pointer snap-start transition-all duration-300 hover:scale-105 shadow-2xl"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setCurrentPhase('site');
                    }}
                    style={{
                      background: status.color === 'green' 
                        ? 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)'
                        : status.color === 'amber'
                        ? 'linear-gradient(135deg, #c2410c 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)'
                    }}
                  >
                    {/* Decorative wave pattern overlay */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                        <path d="M0,100 Q100,50 200,100 T400,100 L400,200 L0,200 Z" fill="white"/>
                      </svg>
                    </div>

                    {/* Card Content */}
                    <div className="relative h-full p-6 flex flex-col justify-between">
                      {/* Top Section - Logo/Brand Area */}
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                          🏗️
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleImageUpload}
                            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all text-white text-sm"
                            title="Upload image"
                          >
                            📷
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-red-500/80 rounded-lg backdrop-blur-sm transition-all text-white font-bold"
                            title="Delete project"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {/* Middle Section - Project Name */}
                      <div>
                        <h3 className="text-white font-bold text-2xl mb-1 truncate drop-shadow-lg">
                          {project.name}
                        </h3>
                        {project.location && (
                          <p className="text-white/90 text-sm truncate drop-shadow">
                            {project.location}
                          </p>
                        )}
                      </div>

                      {/* Bottom Section - Key Metrics */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
                        <div>
                          <div className="text-white/70 text-xs mb-1">Area</div>
                          <div className="text-white font-bold text-sm">
                            {project.siteAreaM2 > 0 ? `${(project.siteAreaM2 / 10000).toFixed(2)}ha` : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70 text-xs mb-1">GDV</div>
                          <div className="text-white font-bold text-sm">
                            {project.gdv ? `£${(project.gdv / 1000000).toFixed(1)}M` : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70 text-xs mb-1">Profit</div>
                          <div className="text-white font-bold text-sm">
                            {project.profitMargin || project.profitTarget ? `${project.profitMargin || project.profitTarget}%` : '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chip/Card number style decoration */}
                    <div className="absolute top-20 left-6 w-10 h-8 rounded bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-60"></div>
                  </div>
                );
              })}
              
              {/* New Project Card */}
              <div
                className="wallet-card flex-shrink-0 w-80 h-48 relative rounded-2xl overflow-hidden cursor-pointer snap-start transition-all duration-300 hover:scale-105 border-4 border-dashed border-slate-600 hover:border-blue-500 shadow-xl"
                onClick={handleNewProject}
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)'
                }}
              >
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl shadow-lg">
                    ➕
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">New Project</h3>
                  <p className="text-slate-400 text-xs">Start a development</p>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            {projects.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                {projects.map((_, idx) => (
                  <div key={idx} className="w-2 h-2 rounded-full bg-white/30"></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Project Form - Collapsed by default */}
        <div className="card">
          <button
            onClick={() => setShowOptionals(!showOptionals)}
            className="card-header w-full text-left hover:bg-slate-700/30 transition-colors cursor-pointer"
          >
            <span className="text-2xl">➕</span>
            <h2 className="card-title">Create New Project (Advanced)</h2>
            <span className="ml-auto text-slate-400">{showOptionals ? '▼' : '▶'}</span>
          </button>
          
          {showOptionals && (
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

                <button type="submit" className="btn-primary">
                  <span>🚀</span>
                  Create Project
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
