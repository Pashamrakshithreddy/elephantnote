import React, { useState, useEffect } from 'react';
import { Clock, MessageCircle } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (text: string, timestamp: number) => Promise<void>;
  currentTime?: number;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, currentTime = 0 }) => {
  const [text, setText] = useState('');
  const [timestamp, setTimestamp] = useState(0);
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (useCurrentTime && currentTime > 0) {
      setTimestamp(Math.floor(currentTime));
    }
  }, [currentTime, useCurrentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;

    setLoading(true);
    try {
      await onSubmit(text.trim(), timestamp);
      setText('');
      if (useCurrentTime) {
        setTimestamp(Math.floor(currentTime));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);
    setTimestamp(time);
  };

  const handleUseCurrentTimeToggle = () => {
    setUseCurrentTime(!useCurrentTime);
    if (!useCurrentTime && currentTime > 0) {
      setTimestamp(Math.floor(currentTime));
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Timestamp Selection */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useCurrentTime"
              checked={useCurrentTime}
              onChange={handleUseCurrentTimeToggle}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="useCurrentTime" className="text-sm text-gray-700">
              Use current time
            </label>
          </div>
          
          {!useCurrentTime && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <input
                type="range"
                min="0"
                max="3600" // 1 hour max
                value={timestamp}
                onChange={handleTimestampChange}
                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-600 min-w-[3rem]">
                {formatTime(timestamp)}
              </span>
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MessageCircle className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {useCurrentTime ? (
              <span>Comment will be added at {formatTime(currentTime)}</span>
            ) : (
              <span>Comment will be added at {formatTime(timestamp)}</span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
