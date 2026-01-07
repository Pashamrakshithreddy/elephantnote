import React, { useState } from 'react';
import { Comment } from '../../types';
import { Clock, User, Edit, Trash2, MessageCircle } from 'lucide-react';
import { CommentService } from '../../services/commentService';

interface CommentListProps {
  comments: Comment[];
  currentUserId: string;
  onCommentUpdate: () => void;
  isAnonymous?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  currentUserId, 
  onCommentUpdate,
  isAnonymous = false
}) => {
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      // Find the project ID from the comment's parent
      // This would need to be passed down or stored differently in a real app
      const projectId = 'temp'; // Placeholder
      await CommentService.updateComment(projectId, commentId, { text: editText.trim() });
      setEditingComment(null);
      setEditText('');
      onCommentUpdate();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setDeletingComment(commentId);
      // Find the project ID from the comment's parent
      const projectId = 'temp'; // Placeholder
      await CommentService.deleteComment(projectId, commentId);
      onCommentUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeletingComment(null);
    }
  };

  const isCommentOwner = (comment: Comment) => {
    return comment.commenterId === currentUserId;
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
        <p className="text-gray-600">
          Be the first to add a comment on this video!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {isAnonymous && comment.commenterId.startsWith('anon_') 
                    ? 'Anonymous User' 
                    : `User ${comment.commenterId.slice(0, 8)}`
                  }
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
            </div>
            
            {/* Comment Actions */}
            {isCommentOwner(comment) && !isAnonymous && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(comment)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Edit comment"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingComment === comment.id}
                  className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50"
                  title="Delete comment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Comment Content */}
          {editingComment === comment.id ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(comment.id)}
                  disabled={!editText.trim()}
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-900 mb-2">{comment.text}</p>
              
              {/* Timestamp */}
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatTime(comment.timestamp)}</span>
              </div>
            </div>
          )}

          {/* Annotations (if any) */}
          {comment.annotations && comment.annotations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Annotations:</div>
              <div className="flex flex-wrap gap-2">
                {comment.annotations.map((annotation, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                  >
                    {annotation.type}: {annotation.coordinates.x}, {annotation.coordinates.y}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
