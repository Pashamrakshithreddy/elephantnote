import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Comment, CreateCommentData } from '../types';

export class CommentService {
  // Get comments subcollection reference
  private static getCommentsCollection(projectId: string) {
    return collection(db, 'projects', projectId, 'comments');
  }

  // Create a new comment
  static async createComment(projectId: string, commentData: CreateCommentData): Promise<string> {
    try {
      const docRef = await addDoc(this.getCommentsCollection(projectId), {
        ...commentData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Get a comment by ID
  static async getComment(projectId: string, commentId: string): Promise<Comment | null> {
    try {
      const docRef = doc(this.getCommentsCollection(projectId), commentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Comment;
      }
      return null;
    } catch (error) {
      console.error('Error getting comment:', error);
      throw error;
    }
  }

  // Get all comments for a project
  static async getComments(projectId: string): Promise<Comment[]> {
    try {
      const q = query(
        this.getCommentsCollection(projectId),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Comment);
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  // Get comments by timestamp range
  static async getCommentsByTimeRange(projectId: string, startTime: number, endTime: number): Promise<Comment[]> {
    try {
      const q = query(
        this.getCommentsCollection(projectId),
        where('timestamp', '>=', startTime),
        where('timestamp', '<=', endTime),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Comment);
    } catch (error) {
      console.error('Error getting comments by time range:', error);
      throw error;
    }
  }

  // Update comment
  static async updateComment(projectId: string, commentId: string, updates: Partial<Comment>): Promise<void> {
    try {
      const docRef = doc(this.getCommentsCollection(projectId), commentId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete comment
  static async deleteComment(projectId: string, commentId: string): Promise<void> {
    try {
      const docRef = doc(this.getCommentsCollection(projectId), commentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Get comments by user
  static async getCommentsByUser(projectId: string, userId: string): Promise<Comment[]> {
    try {
      const q = query(
        this.getCommentsCollection(projectId),
        where('commenterId', '==', userId),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Comment);
    } catch (error) {
      console.error('Error getting comments by user:', error);
      throw error;
    }
  }

  // Real-time listener for comments
  static subscribeToComments(projectId: string, callback: (comments: Comment[]) => void) {
    const q = query(
      this.getCommentsCollection(projectId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Comment);
      callback(comments);
    });
  }

  // Real-time listener for comments by time range
  static subscribeToCommentsByTimeRange(
    projectId: string, 
    startTime: number, 
    endTime: number, 
    callback: (comments: Comment[]) => void
  ) {
    const q = query(
      this.getCommentsCollection(projectId),
      where('timestamp', '>=', startTime),
      where('timestamp', '<=', endTime),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Comment);
      callback(comments);
    });
  }

  // Add annotation to comment
  static async addAnnotation(
    projectId: string, 
    commentId: string, 
    annotation: Comment['annotations'][0]
  ): Promise<void> {
    try {
      const comment = await this.getComment(projectId, commentId);
      if (comment) {
        const updatedAnnotations = [...(comment.annotations || []), annotation];
        await this.updateComment(projectId, commentId, { annotations: updatedAnnotations });
      }
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  }

  // Remove annotation from comment
  static async removeAnnotation(
    projectId: string, 
    commentId: string, 
    annotationIndex: number
  ): Promise<void> {
    try {
      const comment = await this.getComment(projectId, commentId);
      if (comment && comment.annotations) {
        const updatedAnnotations = comment.annotations.filter((_, index) => index !== annotationIndex);
        await this.updateComment(projectId, commentId, { annotations: updatedAnnotations });
      }
    } catch (error) {
      console.error('Error removing annotation:', error);
      throw error;
    }
  }
}
