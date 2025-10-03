
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
                    className="wallet-card flex-shrink-0 w-64 h-40 relative rounded-xl overflow-hidden cursor-pointer snap-start transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setCurrentPhase('site');
                    }}
                  >
                    {/* Gradient border wrapper */}
                    <div 
                      className="absolute inset-0 rounded-xl p-[3px]"
                      style={{
                        background: status.color === 'green' 
                          ? 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)'
                          : status.color === 'amber'
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      }}
                    >
                      {/* Inner card content */}
                      <div className="h-full w-full rounded-lg bg-slate-800 relative overflow-hidden">
                        {/* Background image or default pattern */}
                        {project.image ? (
                          <img 
                            src={project.image} 
                            alt="Project" 
                            className="absolute inset-0 w-full h-full object-cover opacity-30"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-60"></div>
                        )}
                        
                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 backdrop-blur-[1px]"></div>
                        
                        {/* Card Content */}
                        <div className="relative h-full p-4 flex flex-col justify-between z-10">
                          {/* Top Section - Brand/Actions */}
                          <div className="flex items-start justify-between">
                            <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-sm">
                              🏗️
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={handleImageUpload}
                                className="w-7 h-7 flex items-center justify-center bg-white/25 hover:bg-white/40 rounded-md backdrop-blur-md transition-all shadow-sm"
                                title="Upload image"
                              >
                                <span className="text-sm">📷</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.id);
                                }}
                                className="w-7 h-7 flex items-center justify-center bg-white/25 hover:bg-red-500/90 rounded-md backdrop-blur-md transition-all shadow-sm text-white font-bold text-base"
                                title="Delete project"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {/* Middle Section - Project Info */}
                          <div className="flex-1 flex flex-col justify-center -mt-1">
                            <h3 className="text-white font-bold text-base mb-0.5 truncate drop-shadow-lg tracking-tight">
                              {project.name}
                            </h3>
                            {project.location && (
                              <p className="text-white/75 text-[11px] italic truncate drop-shadow">
                                {project.location}
                              </p>
                            )}
                          </div>

                          {/* Bottom Section - Metrics */}
                          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/15">
                            <div>
                              <div className="text-white/60 text-[9px] uppercase tracking-wide mb-0.5">Area</div>
                              <div className="text-white font-bold text-[11px]">
                                {project.siteAreaM2 > 0 ? `${(project.siteAreaM2 / 10000).toFixed(2)}ha` : '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-white/60 text-[9px] uppercase tracking-wide mb-0.5">GDV</div>
                              <div className="text-white font-bold text-[11px]">
                                {project.gdv ? `£${(project.gdv / 1000000).toFixed(1)}M` : '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-white/60 text-[9px] uppercase tracking-wide mb-0.5">Profit</div>
                              <div className="text-white font-bold text-[11px]">
                                {project.profitMargin || project.profitTarget ? `${project.profitMargin || project.profitTarget}%` : '-'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chip decoration (Visa-style) - smaller */}
                        <div className="absolute top-12 left-4 w-7 h-5 rounded-sm bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-60 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* New Project Card */}
              <div
                className="wallet-card flex-shrink-0 w-64 h-40 relative rounded-xl overflow-hidden cursor-pointer snap-start transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={handleNewProject}
              >
                {/* Gradient border wrapper */}
                <div 
                  className="absolute inset-0 rounded-xl p-[3px]"
                  style={{
                    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
                  }}
                >
                  {/* Inner card content */}
                  <div className="h-full w-full rounded-lg bg-slate-800 relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-60"></div>
                    
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 backdrop-blur-[1px]"></div>
                    
                    {/* Card Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-4 text-center z-10">
                      <div className="w-12 h-12 mb-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl shadow-lg">
                        ➕
                      </div>
                      <h3 className="text-white font-bold text-sm mb-0.5 drop-shadow-lg">New Project</h3>
                      <p className="text-slate-300 text-[11px] italic">Start development</p>
                    </div>
                  </div>
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
