
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Projects</h1>
        <p className="text-gray-600">
          Quick feasibility assessment for UK property development (2-15 units)
        </p>
      </div>

      <div className="mb-8">
        <button 
          onClick={handleCreateProject}
          className="btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first project to start assessing land feasibility
          </p>
          <button onClick={handleCreateProject} className="btn-primary">
            Get Started
          </button>
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
