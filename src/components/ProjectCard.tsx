
import React from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  gdv?: number;
  units?: number;
  createdAt: Date;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const statusColors = {
    draft: 'bg-amber-500/20 text-amber-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    completed: 'bg-slate-500/20 text-slate-400'
  };

  return (
    <Link to={`/project/${project.id}`} className="card hover:bg-slate-700/50 transition-colors">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">GDV</div>
            <div className="font-semibold">
              {project.gdv ? `£${project.gdv.toLocaleString()}` : 'Not set'}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Units</div>
            <div className="font-semibold">{project.units || 'Not set'}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};
