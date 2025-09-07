import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../store/projectStore';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link to={`/project/${project.id}`} className="block">
      <div className="card hover:shadow-lg transition-all hover:border-brand-500/50">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏗️</span>
            <h3 className="font-semibold text-lg">{project.name}</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-brand-300">In Progress</span>
            </div>
            <div className="flex justify-between">
              <span>Units:</span>
              <span>{project.unitMix?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Boundary:</span>
              <span className={project.boundary ? "text-green-400" : "text-slate-500"}>
                {project.boundary ? "✅ Mapped" : "📍 Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};