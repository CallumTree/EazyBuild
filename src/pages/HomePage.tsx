
import React from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { ProjectCard } from '../components/ProjectCard';

export const HomePage: React.FC = () => {
  const { projects, createProject } = useProjectStore();

  const handleCreateProject = () => {
    const project = createProject(`Site ${projects.length + 1}`);
    // Navigate to new project will be handled by the store
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="card">
        <div className="card-header">
          <span className="text-2xl">🏗️</span>
          <h1 className="card-title">Your Projects</h1>
        </div>
        <div className="card-body">
          <p className="text-slate-300 mb-4">
            Quick feasibility assessment for UK property development (2-15 units)
          </p>
          <button 
            onClick={handleCreateProject}
            className="btn flex items-center gap-2"
          >
            <span>➕</span>
            <span>New Project</span>
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-slate-300 mb-6">
              Create your first project to start assessing land feasibility
            </p>
            <button onClick={handleCreateProject} className="btn">
              Get Started
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};
