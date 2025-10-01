import React, { useState, useEffect } from 'react';
import { getProjects, saveProject, deleteProject, updateProject } from '../utils/storage';
import { SitePhase } from './SitePhase';

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

  // Mix Phase placeholder
  if (currentPhase === 'mix') {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">🏠</span>
            <h2 className="card-title">Mix Phase: Coming Soon</h2>
          </div>
          <div className="card-body space-y-6">
            <p className="text-slate-300">Mix Phase placeholder - Unit types and density coming soon!</p>
            <p className="text-slate-400">Project ID: {selectedProjectId}</p>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPhase('site')} className="btn-secondary">
                ← Back to Site
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
              <div className="grid gap-4">
                {projects.map(project => (
                  <div key={project.id} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600 hover:border-slate-500 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-white">{project.name}</h3>
                        {project.location && (
                          <p className="text-slate-400 text-sm">📍 {project.location}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-slate-300">
                          {project.siteAreaM2 > 0 && (
                            <span>🏞️ {project.siteAreaM2.toLocaleString()} m²</span>
                          )}
                          {project.profitTarget && (
                            <span>💰 {project.profitTarget}% target</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Created: {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setCurrentPhase('site');
                          }}
                          className="btn-primary text-sm"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="btn-ghost text-sm text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}