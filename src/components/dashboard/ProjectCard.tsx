import React from 'react';
import { Project } from '../../types';
import { Video, Users, Calendar, Crown, Share2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  isOwner: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, isOwner }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const copyShareableLink = async () => {
    const shareableUrl = `${window.location.origin}/shared/${project.shareableLink}`;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Video Thumbnail Placeholder */}
      <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
        <Video className="h-12 w-12 text-gray-400" />
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.title}
          </h3>
          {isOwner && (
            <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0 ml-2" />
          )}
        </div>

        {/* Project Metadata */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {project.collaborators.length} collaborator{project.collaborators.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyShareableLink();
            }}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </button>
          
          <span className="text-xs text-gray-500">
            {isOwner ? 'Owner' : 'Collaborator'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
