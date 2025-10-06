
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
    setProjects(savedProjects || []);
    console.log('Loaded projects:', savedProjects);
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

  const handleImageUpload = (projectId, e) => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          updateProject(projectId, { image: ev.target.result });
          loadProjects();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const getBorderColor = (project) => {
    const profit = project.profitMargin || project.profitTarget || 0;
    if (profit >= 22) return '#22c55e';
    if (profit >= 16) return '#f59e0b';
    return '#ef4444';
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

        {/* Your Projects Dashboard - Horizontal Scrolling Wallet Style */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="text-2xl">💳</span>
            <h2 className="card-title">Your Projects</h2>
          </div>
          <div className="w-full p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div className="flex overflow-x-auto space-x-2 snap-x snap-mandatory scrollbar-thin" style={{ scrollBehavior: 'smooth', padding: '10px 0' }}>
              {projects.map(project => (
                <div
                  key={project.id}
                  className="wallet-card w-40 h-20 rounded-2xl p-1.5 shadow-lg cursor-pointer relative flex-shrink-0"
                  style={{
                    border: `4px solid ${getBorderColor(project)}`,
                    scrollSnapAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
                  }}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setCurrentPhase('site');
                  }}
                >
                  <div className="flex flex-col h-full relative z-10">
                    <img
                      src={project.image || '🏠'}
                      className="w-full h-10 rounded-lg object-cover mb-0.5"
                      alt="Project"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-10 rounded-lg mb-0.5 items-center justify-center text-2xl bg-slate-700/50" 
                      style={{ display: project.image ? 'none' : 'flex' }}
                    >
                      🏠
                    </div>
                    <div className="text-primary font-bold text-xs line-clamp-1">{project.name}</div>
                    <div className="text-muted text-[10px] italic line-clamp-1">{project.location || 'No location'}</div>
                  </div>
                  <button
                    onClick={(e) => handleImageUpload(project.id, e)}
                    className="absolute top-0.5 right-0.5 bg-slate-800/80 hover:bg-slate-700/90 text-white rounded px-1 text-[10px] z-20 transition-colors"
                  >
                    📷
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="absolute bottom-0.5 right-0.5 bg-red-600/80 hover:bg-red-500/90 text-white rounded px-1 text-[10px] z-20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* New Project Card */}
              <div
                className="wallet-card w-40 h-20 rounded-2xl p-1.5 shadow-lg cursor-pointer relative flex-shrink-0 flex flex-col items-center justify-center"
                style={{
                  border: '4px solid #6b7280',
                  scrollSnapAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(75, 85, 99, 0.95) 100%)'
                }}
                onClick={handleNewProject}
              >
                <div className="text-2xl mb-1">🏠</div>
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
