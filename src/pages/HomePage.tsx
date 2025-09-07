import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { ProjectCard } from '../components/ProjectCard';

export const HomePage: React.FC = () => {
  const { projects, createProject } = useProjectStore();

  const handleCreateProject = () => {
    const project = createProject(`Site ${projects.length + 1}`);
    // Navigate to new project will be handled by the store
  };

  return (
    <div className="p-4 pb-20 space-y-8">
      <div className="card">
        <div className="card-header">
          <span className="text-3xl">🏗️</span>
          <div>
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-slate-400 mt-1">Manage your development projects</p>
          </div>
        </div>
        <div className="card-body space-y-6">
          <p className="text-slate-300 leading-relaxed">
            Quick feasibility assessment for UK property development (2-15 units)
          </p>
          <button 
            onClick={handleCreateProject}
            className="btn"
          >
            <span>➕</span>
            <span>New Project</span>
          </button>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};