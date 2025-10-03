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
    setProjects(savedProjects || []); // Fallback if null
    console.log('Loaded projects:', savedProjects); // Debug data
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
      // If the deleted project was the current one, reset to home
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setCurrentPhase('home');
      }
    }
  };

  const handleNewProject = () => {
    const newId = Date.now();
    const blankProject = {
      id: newId,
      name: 'New Project',
      location: '',
      siteAreaM2: 0,
      profitTarget: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProject(blankProject);
    setProjects([...projects, blankProject]);
    setSelectedProjectId(newId);
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
              <button
                onClick={() => {
                  setCurrentPhase('home');
                  setSelectedProjectId(null);
                }}
                className="btn-ghost"
              >
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

        {/* Your Projects Dashboard */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="text-2xl">💳</span>
            <h2 className="card-title">Your Projects</h2>
          </div>
          <div className="carousel-container w-full p-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div className="flex overflow-x-auto space-x-2 snap-x snap-mandatory scrollbar-thin" style={{ scrollBehavior: 'smooth', paddingBottom: '10px' }}>
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`card w-40 h-20 rounded-2xl p-1.5 shadow-md border-4 cursor-pointer relative overflow-hidden ${
                    (project.profitMargin || project.profitTarget || 0) >= 22 ? 'border-green-500' :
                    (project.profitMargin || project.profitTarget || 0) >= 16 ? 'border-amber-500' :
                    'border-red-500'
                  }`}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setCurrentPhase('site');
                  }}
                  style={{ scrollSnapAlign: 'center', flexShrink: 0 }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <img
                    src={project.image || '🏠'}
                    className="w-full h-10 rounded-lg object-cover mb-0.5 z-10 relative"
                    alt="Project"
                  />
                  <div className="text-primary font-bold text-xs z-10 relative line-clamp-1">{project.name}</div>
                  <div className="text-muted text-[10px] italic z-10 relative line-clamp-1">{project.location}</div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            updateProject(project.id, { image: ev.target.result });
                            loadProjects();
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="btn-ghost text-[8px] z-10 relative top-0.5 right-0.5"
                  >
                    📷
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="btn-ghost text-[8px] text-white z-10 relative bottom-0.5 right-0.5"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div
                className="card w-40 h-20 rounded-2xl p-1.5 shadow-md border-4 bg-gradient-to-br from-gray-500 to-gray-700 flex flex-col items-center justify-center cursor-pointer"
                onClick={handleNewProject}
                style={{ scrollSnapAlign: 'center', flexShrink: 0 }}
              >
                <div className="text-xl mb-0.5">🏠</div>
                <div className="text-white font-bold text-xs">New Project</div>
              </div>
            </div>
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
                      onChange={e => handleInputChange('name', e.target.value)}
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
                      onChange={e => handleInputChange('location', e.target.value)}
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
                      onChange={e => handleInputChange('siteAreaM2', e.target.value)}
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
                      onChange={e => handleInputChange('profitTarget', e.target.value)}
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