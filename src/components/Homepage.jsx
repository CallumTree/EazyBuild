
import React, { useState, useEffect } from 'react';
import { getProjects, saveProject, deleteProject } from '../utils/storage';
import { SiteStage } from './SiteStage';

// Room Components (placeholders for now)
function SiteRoom({ project, onBack }) {
  return (
    <div className="container py-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">🗺️</span>
          <h2 className="card-title">Site Room: {project.name}</h2>
        </div>
        <div className="card-body space-y-6">
          <p className="text-slate-300">Draw your polygon here - Site area: {project.siteAreaM2}m²</p>
          <p className="text-slate-400">Location: {project.location}</p>
          <button onClick={onBack} className="btn-ghost">
            ← Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

function ViabilityRoom({ project, onBack }) {
  return (
    <div className="container py-8">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">💰</span>
          <h2 className="card-title">Viability Room: {project.name}</h2>
        </div>
        <div className="card-body space-y-6">
          <p className="text-slate-300">Quick viability assessment - Target profit: {project.profitTarget}%</p>
          <p className="text-slate-400">Location: {project.location}</p>
          <button onClick={onBack} className="btn-ghost">
            ← Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export function Homepage() {
  const [currentRoom, setCurrentRoom] = useState('homepage');
  const [currentProject, setCurrentProject] = useState(null);
  const [currentStage, setCurrentStage] = useState('homepage');
  const [projects, setProjects] = useState([]);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    siteAreaM2: 0,
    profitTarget: 20,
    landCost: '',
    clientAgent: '',
    dealType: 'Acquisition',
    notes: ''
  });

  // Load projects on mount
  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Project name is required');
      return false;
    }
    if (!formData.location.trim()) {
      alert('Location is required');
      return false;
    }
    if (formData.siteAreaM2 <= 0) {
      alert('Site area must be greater than 0');
      return false;
    }
    if (formData.profitTarget <= 0) {
      alert('Profit target must be greater than 0');
      return false;
    }
    return true;
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const newProject = {
        id: Date.now(),
        name: formData.name,
        location: formData.location,
        siteAreaM2: formData.siteAreaM2,
        profitTarget: formData.profitTarget,
        landCost: formData.landCost ? parseFloat(formData.landCost) : null,
        clientAgent: formData.clientAgent || null,
        dealType: formData.dealType,
        notes: formData.notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'amber'
      };

      saveProject(newProject);
      setProjects(getProjects());
      setCurrentProject(newProject);
      setCurrentStage('site');
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        siteAreaM2: 0,
        profitTarget: 20,
        landCost: '',
        clientAgent: '',
        dealType: 'Acquisition',
        notes: ''
      });
      
      alert('Project created!');
    } catch (error) {
      alert('Failed to create project. Please try again.');
    }
  };

  const handleQuickViability = () => {
    const quickProject = {
      id: Date.now(),
      name: 'Quick Assessment',
      location: 'TBD',
      siteAreaM2: 1000,
      profitTarget: 20,
      landCost: null,
      clientAgent: null,
      dealType: 'Acquisition',
      notes: 'Quick viability check',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'amber'
    };

    try {
      saveProject(quickProject);
      setProjects(getProjects());
      setCurrentProject(quickProject);
      setCurrentRoom('viability');
    } catch (error) {
      alert('Failed to create quick project. Please try again.');
    }
  };

  const handleEditProject = (project) => {
    setFormData({
      name: project.name,
      location: project.location,
      siteAreaM2: project.siteAreaM2,
      profitTarget: project.profitTarget,
      landCost: project.landCost || '',
      clientAgent: project.clientAgent || '',
      dealType: project.dealType,
      notes: project.notes || ''
    });
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        deleteProject(projectId);
        setProjects(getProjects());
      } catch (error) {
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'text-green-400';
      case 'amber': return 'text-amber-400';
      case 'red': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'green': return '🟢';
      case 'amber': return '🟡';
      case 'red': return '🔴';
      default: return '⚫';
    }
  };

  // Stage routing
  if (currentStage === 'site') {
    return <SiteStage 
      projectId={currentProject?.id} 
      onBack={() => setCurrentStage('homepage')}
      onNext={() => setCurrentStage('mix')}
    />;
  }

  if (currentStage === 'mix') {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">🏠</span>
            <h2 className="card-title">Mix Stage: Add units here</h2>
          </div>
          <div className="card-body space-y-6">
            <p className="text-slate-300">Mix Stage placeholder - Unit types and density coming soon!</p>
            <button onClick={() => setCurrentStage('homepage')} className="btn-secondary">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Room routing (legacy)
  if (currentRoom === 'site') {
    return <SiteRoom project={currentProject} onBack={() => setCurrentRoom('homepage')} />;
  }

  if (currentRoom === 'viability') {
    return <ViabilityRoom project={currentProject} onBack={() => setCurrentRoom('homepage')} />;
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
              <p className="text-slate-400 mt-1">Smart UK Property Viability</p>
            </div>
          </div>
        </div>

        {/* Essentials Form */}
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">📋</span>
            <h2 className="card-title">Essentials</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location (Postcode) *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="e.g. SW1A 1AA"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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
                    required
                    min="1"
                    placeholder="Enter site area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Profit Target (% PoGDV) *
                  </label>
                  <input
                    type="number"
                    name="profitTarget"
                    value={formData.profitTarget}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    min="1"
                    max="100"
                    placeholder="Enter profit target %"
                  />
                </div>
              </div>

              {/* Optional Details Section */}
              <div className="border-t border-slate-700 pt-6">
                <button
                  type="button"
                  onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                  className="btn-ghost mb-4"
                >
                  {showOptionalDetails ? '🔼' : '🔽'} Optional Details
                </button>

                {showOptionalDetails && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Land Cost (£)
                        </label>
                        <input
                          type="number"
                          name="landCost"
                          value={formData.landCost}
                          onChange={handleInputChange}
                          className="input-field"
                          min="0"
                          placeholder="Enter land cost"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Client/Agent
                        </label>
                        <input
                          type="text"
                          name="clientAgent"
                          value={formData.clientAgent}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Enter client or agent name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Deal Type
                      </label>
                      <select
                        name="dealType"
                        value={formData.dealType}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="Acquisition">Acquisition</option>
                        <option value="JV">JV</option>
                        <option value="Self-Build">Self-Build</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notes/Tags
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="input-field"
                        rows="3"
                        placeholder="Add any notes or tags"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="submit" className="btn-primary flex-1">
                  <span>🚀</span>
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={handleQuickViability}
                  className="btn-secondary flex-1"
                >
                  <span>⚡</span>
                  Quick Viability
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Projects Dashboard */}
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">📁</span>
            <h2 className="card-title">Your Projects</h2>
          </div>
          <div className="card-body">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-slate-400">No projects yet—create one above!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="kpi-card">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <span className={`text-sm ${getStatusColor(project.status)}`}>
                        {getStatusEmoji(project.status)} {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      {project.location} • {project.siteAreaM2.toLocaleString()}m²
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      Target: {project.profitTarget}% • {project.dealType}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="btn-ghost text-xs flex-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="btn-ghost text-xs flex-1 text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
