
import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../store/projectStore';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = () => {
    if (!project.boundary) return { text: 'Not Started', color: 'bg-gray-100 text-gray-800' };
    if (!project.finance) return { text: 'In Progress', color: 'bg-warning text-white' };
    return { text: 'Complete', color: 'bg-success text-white' };
  };

  const status = getStatusBadge();

  return (
    <Link to={`/project/${project.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{formatDate(project.createdAt)}</span>
          </div>
          
          {project.estimatedUnits && (
            <div className="flex justify-between">
              <span>Units:</span>
              <span>{project.estimatedUnits}</span>
            </div>
          )}

          {project.siteArea && (
            <div className="flex justify-between">
              <span>Area:</span>
              <span>{(project.siteArea / 4047).toFixed(2)} acres</span>
            </div>
          )}

          {project.finance?.residualLandValue && (
            <div className="flex justify-between font-medium text-gray-900">
              <span>RLV:</span>
              <span>£{project.finance.residualLandValue.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Last updated: {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};
