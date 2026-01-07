import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectService } from '../../services/projectService';
import { CommentService } from '../../services/commentService';
import { Project, Comment } from '../../types';
import { ArrowLeft, Video, MessageCircle, Clock, User, Send } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

const ProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadComments();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      const projectData = await ProjectService.getProject(projectId);
      if (projectData) {
        setProject(projectData);
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Failed to load project');
    }
  };

  const loadComments = async () => {
    if (!projectId) return;
    
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
    if (!user || !projectId) return;
    
    try {
      await CommentService.createComment(projectId, {
        commenterId: user.uid,
        timestamp,
        text
      });
      
      // Reload comments to show the new one
      loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleBackToDashboard}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-600">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
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
              
              <CommentForm onSubmit={handleCommentSubmit} />
              
              <div className="mt-6">
                <CommentList 
                  comments={comments} 
                  currentUserId={user?.uid || ''}
                  onCommentUpdate={loadComments}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectView;
