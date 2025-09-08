
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'draft':
        return 'bg-amber-500/20 text-amber-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <Link to={`/project/${project.id}`}>
      <div className="card hover:scale-105 transition-transform duration-200 cursor-pointer group">
        <div className="card-body space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-slate-400 text-sm">
                Created {formatDate(project.createdAt)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          
          <div className="space-y-3">
            {project.gdv && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">GDV:</span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(project.gdv)}
                </span>
              </div>
            )}
            
            {project.units && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Units:</span>
                <span className="font-semibold">{project.units}</span>
              </div>
            )}
          </div>
          
          <div className="pt-2 border-t border-slate-700">
            <span className="text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
              View Project →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
