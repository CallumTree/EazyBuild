import React, { useState, useEffect } from 'react';
import { getProjects, saveProject, deleteProject, updateProject } from '../utils/storage';

// Mock SitePhase component for now, will be replaced by the actual component
// const SitePhase = ({ projectId, onBack, onNext }) => {
//   const [postcode, setPostcode] = useState('');
//   const [siteAreaM2, setSiteAreaM2] = useState(0);
//   const [constraintsNote, setConstraintsNote] = useState('');

//   // Mock loading project data
//   useEffect(() => {
//     // In a real app, you'd fetch project details using projectId
//     console.log("Mock SitePhase loaded for project ID:", projectId);
//     // Mock pre-filling data if available
//     if (projectId) {
//       const mockProject = {
//         id: projectId,
//         name: "Example Project",
//         postcode: "SW1A 1AA",
//         siteAreaM2: 5000,
//         constraintsNote: "Existing trees on site."
//       };
//       setPostcode(mockProject.postcode || '');
//       setSiteAreaM2(mockProject.siteAreaM2 || 0);
//       setConstraintsNote(mockProject.constraintsNote || '');
//     }
//   }, [projectId]);

//   const handleNext = () => {
//     const updatedData = { postcode, siteAreaM2, constraintsNote };
//     // In a real app, this would call an API or update localStorage
//     console.log(`Mock Saving Site Phase data for Project ${projectId}:`, updatedData);
//     alert('Site phase data saved (mock)!');
//     onNext();
//   };

//   const isNextDisabled = siteAreaM2 <= 0 || !postcode.trim();

//   return (
//     <div className="container py-8">
//       <div className="card">
//         <div className="card-header">
//           <button onClick={onBack} className="btn-ghost mr-4">
//             ← Back
//           </button>
//           <span className="text-2xl">🗺️</span>
//           <h2 className="card-title">Site Phase: Define Your Land</h2>
//           <p className="text-slate-400 ml-auto">Project ID: {projectId}</p>
//         </div>
//         <div className="card-body space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-slate-300 mb-2">Postcode *</label>
//             <input
//               type="text"
//               value={postcode}
//               onChange={(e) => setPostcode(e.target.value.toUpperCase())}
//               className="input-field"
//               placeholder="e.g. SW1A 1AA"
//             />
//             {postcode.length >= 5 && (
//               <p className="text-xs text-slate-500 mt-1">
//                 Mock LA/Density: London Borough of Example, Avg 50-100 units/ha
//               </p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-300 mb-2">Site Area (m²) *</label>
//             <input
//               type="number"
//               value={siteAreaM2}
//               onChange={(e) => setSiteAreaM2(parseFloat(e.target.value) || 0)}
//               className="input-field"
//               min="0"
//               placeholder="Enter site area"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-300 mb-2">Constraints Note</label>
//             <textarea
//               value={constraintsNote}
//               onChange={(e) => setConstraintsNote(e.target.value)}
//               className="input-field"
//               rows="3"
//               placeholder="Add any site constraints or notes"
//             />
//           </div>
//         </div>
//         <div className="card-footer flex justify-between items-center">
//           <span className={`text-lg ${siteAreaM2 > 0 ? 'text-green-400' : 'text-red-400'}`}>
//             {siteAreaM2 > 0 ? '🟢' : '🔴'} Status: {siteAreaM2 > 0 ? 'Area Defined' : 'No Area'}
//           </span>
//           <button onClick={handleNext} className="btn-primary" disabled={isNextDisabled}>
//             Next: Mix Phase →
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

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

// SitePhase Component
function SitePhase({ projectId, onBack, onNext }) {
  const [postcode, setPostcode] = useState('');
  const [siteAreaM2, setSiteAreaM2] = useState(0);
  const [constraintsNote, setConstraintsNote] = useState('');
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    if (projectId) {
      const projects = getProjects();
      const project = projects.find(p => p.id === projectId);
      setProjectData(project);
      if (project) {
        setPostcode(project.postcode || '');
        setSiteAreaM2(project.siteAreaM2 || 0);
        setConstraintsNote(project.constraintsNote || '');
      }
    }
  }, [projectId]);

  const handleSaveAndNext = () => {
    if (!postcode.trim() || siteAreaM2 <= 0) {
      alert('Please enter a valid postcode and site area.');
      return;
    }

    const updatedProjectData = {
      ...projectData,
      postcode: postcode.toUpperCase(),
      siteAreaM2: siteAreaM2,
      constraintsNote: constraintsNote,
      updatedAt: new Date().toISOString(),
      status: siteAreaM2 > 0 ? 'green' : projectData?.status || 'amber'
    };

    try {
      updateProject(projectId, updatedProjectData);
      alert('Site phase data saved!');
      onNext();
    } catch (error) {
      alert('Failed to save site phase data. Please try again.');
      console.error("Error saving site phase:", error);
    }
  };

  const isNextDisabled = !postcode.trim() || siteAreaM2 <= 0;
  const projectName = projectData ? projectData.name : 'Loading...';

  return (
    <div className="container py-8">
      <div className="card">
        <div className="card-header">
          <button onClick={onBack} className="btn-ghost mr-4">
            ← Back
          </button>
          <span className="text-2xl">🗺️</span>
          <h2 className="card-title">Site Phase: Define Your Land</h2>
          <p className="text-slate-400 ml-auto">Project: {projectName}</p>
        </div>
        <div className="card-body space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Postcode *</label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              className="input-field"
              placeholder="e.g. SW1A 1AA"
            />
            {postcode.length >= 5 && (
              <p className="text-xs text-slate-500 mt-1">
                Mock LA/Density: London Borough of Example, Avg 50-100 units/ha
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Site Area (m²) *</label>
            <input
              type="number"
              value={siteAreaM2}
              onChange={(e) => setSiteAreaM2(parseFloat(e.target.value) || 0)}
              className="input-field"
              min="0"
              placeholder="Enter site area"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Constraints Note</label>
            <textarea
              value={constraintsNote}
              onChange={(e) => setConstraintsNote(e.target.value)}
              className="input-field"
              rows="3"
              placeholder="Add any site constraints or notes"
            />
          </div>
        </div>
        <div className="card-footer flex justify-between items-center">
          <span className={`text-lg ${siteAreaM2 > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {siteAreaM2 > 0 ? '🟢' : '🔴'} Status: {siteAreaM2 > 0 ? 'Area Defined' : 'No Area'}
          </span>
          <button onClick={handleSaveAndNext} className="btn-primary" disabled={isNextDisabled}>
            Next: Mix Phase →
          </button>
        </div>
      </div>
    </div>
  );
}


export function Homepage() {
  const [currentRoom, setCurrentRoom] = useState('homepage');
  const [currentProject, setCurrentProject] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
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
      setSelectedProjectId(newProject.id);
      setCurrentPhase('site'); // Navigate to site phase

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
    // Optionally, you might want to set the currentPhase to 'home' or handle editing differently
    // setCurrentPhase('home');
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        deleteProject(projectId);
        setProjects(getProjects());
        // If the deleted project was the current one being edited or viewed, clear it
        if (currentProject && currentProject.id === projectId) {
          setCurrentProject(null);
          setSelectedProjectId(null);
          setCurrentPhase('home');
        }
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

  // Phase routing
  if (currentPhase === 'site') {
    return <SitePhase 
      projectId={selectedProjectId} 
      onBack={() => {
        setCurrentPhase('home');
        setSelectedProjectId(null);
      }}
      onNext={() => setCurrentPhase('mix')}
    />;
  }

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

  // Main Homepage - wrap in phase condition
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
                        onClick={() => {
                          handleEditProject(project);
                          // When editing, we might want to go back to the homepage phase
                          // to see the form pre-filled, or handle it within the project list.
                          // For now, let's assume editing means going back to the form state.
                          setCurrentPhase('home');
                        }}
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