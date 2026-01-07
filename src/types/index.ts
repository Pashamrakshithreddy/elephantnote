export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  title: string;
  videoUrl: string;
  ownerId: string;
  createdAt: Date;
  shareableLink: string;
  collaborators: string[];
}

export interface Comment {
  id: string;
  commenterId: string;
  timestamp: number; // Time in seconds where the comment was made
  text: string;
  createdAt: Date;
  annotations?: Annotation[];
}

export interface Annotation {
  type: 'arrow' | 'circle' | 'line' | 'text';
  coordinates: {
    x: number;
    y: number;
    endX?: number; // For arrows and lines
    endY?: number; // For arrows and lines
    radius?: number; // For circles
  };
  color: string;
  size: number;
  text?: string; // For text annotations
}

export interface CreateProjectData {
  title: string;
  videoUrl: string;
  ownerId: string;
}

export interface CreateCommentData {
  commenterId: string;
  timestamp: number;
  text: string;
  annotations?: Annotation[];
}
