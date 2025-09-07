
import React from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  status: string;
  gdv?: number;
  units?: number;
  createdAt: Date;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏗️</span>
          <div>
            <h3 className="text-xl font-semibold text-white">{project.name}</h3>
            <p className="text-slate-400 text-sm">
              Created {project.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            project.status === 'active' ? 'bg-green-500/20 text-green-400' :
            project.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {project.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-slate-400">GDV</div>
            <div className="font-semibold">
              {project.gdv ? `£${project.gdv.toLocaleString()}` : 'Not set'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Units</div>
            <div className="font-semibold">{project.units || 'Not set'}</div>
          </div>
        </div>
        <Link to={`/project/${project.id}`} className="btn w-full">
          Open Project
        </Link>
      </div>
    </div>
  );
};
