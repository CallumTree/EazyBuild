import React, { useState, useEffect } from 'react';
import { getProjects, saveProject, deleteProject, updateProject } from '../utils/storage';
import { SitePhase } from './SitePhase';
import { MixPhase } from './MixPhase';

export function Homepage() {
  const [projects, setProjects] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showOptionals, setShowOptionals] = useState(false);

  // State for card carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

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
      // If the deleted project was the current one, reset to home
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setCurrentPhase('home');
      }
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
    setCurrentIndex(projects.length); // Set index to the new project
  };

  // Card Swipe Logic
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    const threshold = 50; // Pixels to trigger swipe
    if (currentX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (currentX < -threshold && currentIndex < projects.length) {
      setCurrentIndex(currentIndex + 1);
    }
    setCurrentX(0); // Reset swipe position
  };

  const goToProject = (index) => {
    setCurrentIndex(index);
  };

  // Site Phase Component
  if (currentPhase === 'site' && selectedProjectId) {
    return (
      <SitePhase
        projectId={selectedProjectId}
        onBack={() => {
          setCurrentPhase('home');
          setSelectedProjectId(null);
          setCurrentIndex(0); // Reset carousel index
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
                setCurrentIndex(0); // Reset carousel index
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

        {/* Stacked Visa-Style Cards Dashboard */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="text-2xl">💳</span>
            <h2 className="card-title">Your Projects</h2>
          </div>

          {/* Stacked Cards Container */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 min-h-[300px] flex items-center justify-center">
            <div 
              className="relative w-full max-w-[340px] h-[210px]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Render cards with stacking and swipe effects */}
              {[...projects, { id: 'new', name: 'New Project', isNew: true }].map((project, index) => {
                const isCurrent = index === currentIndex;
                const isPast = index < currentIndex;
                const isFuture = index > currentIndex;
                const isNewCard = project.isNew;

                // Calculate Z-index and transform for stacking - Google Wallet style
                let zIndex = 100 - index;
                let transform = '';
                let opacity = 1;

                if (isCurrent) {
                  zIndex = 200; // Current card on top
                  transform = `translateX(${currentX}px) translateY(0px) scale(1) rotate(0deg)`;
                  opacity = 1;
                } else if (isFuture) {
                  // Cards stacked behind - offset downward and to the right like wallet
                  const offset = (index - currentIndex) * 8;
                  transform = `translateX(${offset}px) translateY(${offset}px) scale(${1 - (index - currentIndex) * 0.03}) rotate(0deg)`;
                  zIndex = 100 - index;
                  opacity = 1;
                } else if (isPast) {
                  // Cards that have been swiped away - move to the left
                  transform = `translateX(-400px) translateY(0px) scale(0.8) rotate(-5deg)`;
                  zIndex = 50 - index;
                  opacity = 0;
                }

                // Special styling for the "New Project" card - always at the back
                if (isNewCard) {
                  const totalCards = projects.length + 1;
                  const offset = (totalCards - 1 - currentIndex) * 8;
                  transform = currentIndex >= projects.length 
                    ? `translateX(${currentX}px) translateY(0px) scale(1) rotate(0deg)`
                    : `translateX(${offset}px) translateY(${offset}px) scale(${1 - (totalCards - 1 - currentIndex) * 0.03}) rotate(0deg)`;
                  zIndex = 0;
                  opacity = 1;
                }

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
                    className={`wallet-card absolute rounded-xl cursor-pointer transition-all duration-300 ease-out ${
                      isCurrent ? 'shadow-2xl' : 'shadow-lg'
                    }`}
                    style={{
                      zIndex: zIndex,
                      transform: transform,
                      opacity: opacity,
                      width: '320px',
                      height: '200px',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-160px',
                      marginTop: '-100px',
                      pointerEvents: isCurrent ? 'auto' : 'none'
                    }}
                    onClick={() => {
                      if (isCurrent) {
                        if (isNewCard) {
                          handleNewProject();
                        } else {
                          setSelectedProjectId(project.id);
                          setCurrentPhase('site');
                        }
                      }
                    }}
                  >
                    {/* Outlined border with gradient */}
                    <div 
                      className="absolute inset-0 rounded-xl p-[3px]"
                      style={{
                        background: isNewCard 
                          ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
                          : `linear-gradient(135deg, ${
                              status.color === 'green' ? '#22c55e' : status.color === 'amber' ? '#f59e0b' : '#ef4444'
                            } 0%, ${
                              status.color === 'green' ? '#10b981' : status.color === 'amber' ? '#d97706' : '#dc2626'
                            } 100%)`
                      }}
                    >
                      <div className="h-full w-full rounded-lg bg-slate-800 relative overflow-hidden">
                      {/* Background image or default pattern */}
                        {!isNewCard && project.image ? (
                          <img 
                            src={project.image} 
                            alt="Project" 
                            className="absolute inset-0 w-full h-full object-cover opacity-20 rounded-lg"
                          />
                        ) : (
                          !isNewCard && <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/50 rounded-lg"></div>
                        )}

                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 backdrop-blur-[0.5px] rounded-lg"></div>

                        {/* Card Content */}
                        <div className="relative h-full p-4 flex flex-col justify-between z-10">
                          {isNewCard ? (
                            <div className="flex flex-col items-center justify-center text-center h-full">
                              <div className="w-12 h-12 mb-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl shadow-lg">
                                ➕
                              </div>
                              <h3 className="text-white font-bold text-sm mb-0.5 drop-shadow-lg">New Project</h3>
                              <p className="text-slate-300 text-xs italic">Start development</p>
                            </div>
                          ) : (
                            <>
                              {/* Top Section - Brand/Actions */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-md flex items-center justify-center text-base shadow-sm flex-shrink-0">
                                  🏗️
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <button
                                    onClick={handleImageUpload}
                                    className="w-7 h-7 flex items-center justify-center bg-white/25 hover:bg-white/40 rounded-md backdrop-blur-md transition-all shadow-sm"
                                    title="Upload image"
                                  >
                                    <span className="text-xs">📷</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProject(project.id);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center bg-white/25 hover:bg-red-500/90 rounded-md backdrop-blur-md transition-all shadow-sm text-white font-bold text-sm leading-none"
                                    title="Delete project"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              {/* Middle Section - Project Info */}
                              <div className="flex-1 flex flex-col justify-center min-h-0">
                                <h3 className="text-white font-bold text-base mb-1 truncate drop-shadow-lg tracking-tight">
                                  {project.name}
                                </h3>
                                {project.location && (
                                  <p className="text-white/70 text-xs italic truncate drop-shadow">
                                    {project.location}
                                  </p>
                                )}
                              </div>

                              {/* Bottom Section - Metrics */}
                              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20">
                                <div className="min-w-0">
                                  <div className="text-white/60 text-[9px] uppercase tracking-wide mb-0.5 truncate">Area</div>
                                  <div className="text-white font-bold text-[10px] truncate">
                                    {project.siteAreaM2 > 0 ? `${(project.siteAreaM2 / 10000).toFixed(2)}ha` : '-'}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <div className="text-white/60 text-[9px] uppercase tracking-wide mb-0.5 truncate">GDV</div>
                                  <div className="text-white font-bold text-[10px] truncate">
                                    {project.gdv ? `£${(project.gdv / 1000000).toFixed(1)}M` : '-'}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <div className="text-white/60 text-[9px] uppercase tracking-wide mb-0.5 truncate">Profit</div>
                                  <div className="text-white font-bold text-[10px] truncate">
                                    {project.profitMargin || project.profitTarget ? `${project.profitMargin || project.profitTarget}%` : '-'}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Chip decoration (Visa-style) */}
                        {!isNewCard && (
                          <div className="absolute top-14 left-4 w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-50 shadow-sm"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll Indicator */}
            {projects.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
                {projects.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 cursor-pointer ${
                      currentIndex === idx ? 'bg-white' : 'bg-white/30'
                    }`}
                    onClick={() => goToProject(idx)}
                  ></div>
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