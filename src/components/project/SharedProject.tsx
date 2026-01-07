import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectService } from '../../services/projectService';
import { CommentService } from '../../services/commentService';
import { Project, Comment } from '../../types';
import { Video, MessageCircle, Clock, User, ExternalLink } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

const SharedProject: React.FC = () => {
  const { shareableLink } = useParams<{ shareableLink: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anonymousId, setAnonymousId] = useState<string>('');

  useEffect(() => {
    if (shareableLink) {
      loadProject();
      generateAnonymousId();
    }
  }, [shareableLink]);

  const generateAnonymousId = () => {
    // Generate a unique anonymous ID for this session
    const id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setAnonymousId(id);
  };

  const loadProject = async () => {
    if (!shareableLink) return;
    
    try {
      const projectData = await ProjectService.getProjectByShareableLink(shareableLink);
      if (projectData) {
        setProject(projectData);
        loadComments(projectData.id);
      } else {
        setError('Project not found or link is invalid');
      }
    } catch (error) {
      console.error('Error loading shared project:', error);
      setError('Failed to load project');
    }
  };

  const loadComments = async (projectId: string) => {
    try {
      const commentsData = await CommentService.getComments(projectId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (text: string, timestamp: number) => {
    if (!project || !anonymousId) return;
    
    try {
      await CommentService.createComment(project.id, {
        commenterId: anonymousId,
        timestamp,
        text
      });
      
      // Reload comments to show the new one
      loadComments(project.id);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The project you are looking for does not exist.'}</p>
          <p className="text-sm text-gray-500">
            Please check the link or contact the project owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-600">
                  Shared Project • Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="h-4 w-4" />
              <span>Anonymous User</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Video Player</h2>
              <VideoPlayer videoUrl={project.videoUrl} />
            </div>
          </div>

          {/* Comments Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Comments</h2>
                <span className="ml-2 text-sm text-gray-500">({comments.length})</span>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-800">
                  You are viewing this project as an anonymous user. 
                  Your comments will be saved but you won't be able to edit them later.
                </p>
              </div>
              
              <CommentForm onSubmit={handleCommentSubmit} />
              
              <div className="mt-6">
                <CommentList 
                  comments={comments} 
                  currentUserId={anonymousId}
                  onCommentUpdate={() => loadComments(project.id)}
                  isAnonymous={true}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedProject;
