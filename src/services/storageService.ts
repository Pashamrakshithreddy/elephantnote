import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageReference
} from 'firebase/storage';
import { storage } from '../config/firebase';

export class StorageService {
  // Upload video file
  static async uploadVideo(
    file: File, 
    projectId: string, 
    fileName?: string
  ): Promise<string> {
    try {
      const finalFileName = fileName || file.name;
      const storageRef = ref(storage, `videos/${projectId}/${finalFileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  // Upload video with progress tracking
  static uploadVideoWithProgress(
    file: File, 
    projectId: string, 
    fileName?: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const finalFileName = fileName || file.name;
        const storageRef = ref(storage, `videos/${projectId}/${finalFileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            console.error('Error uploading video:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get download URL for a video
  static async getVideoDownloadURL(projectId: string, fileName: string): Promise<string> {
    try {
      const storageRef = ref(storage, `videos/${projectId}/${fileName}`);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting video download URL:', error);
      throw error;
    }
  }

  // Delete video file
  static async deleteVideo(projectId: string, fileName: string): Promise<void> {
    try {
      const storageRef = ref(storage, `videos/${projectId}/${fileName}`);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  // List all videos in a project
  static async listProjectVideos(projectId: string): Promise<string[]> {
    try {
      const projectRef = ref(storage, `videos/${projectId}`);
      const result = await listAll(projectRef);
      
      const downloadURLs = await Promise.all(
        result.items.map(async (itemRef) => {
          return await getDownloadURL(itemRef);
        })
      );
      
      return downloadURLs;
    } catch (error) {
      console.error('Error listing project videos:', error);
      throw error;
    }
  }

  // Get video metadata
  static async getVideoMetadata(projectId: string, fileName: string): Promise<any> {
    try {
      const storageRef = ref(storage, `videos/${projectId}/${fileName}`);
      // Note: Firebase Storage doesn't provide direct metadata access
      // You might need to store metadata in Firestore separately
      return {
        name: fileName,
        path: `videos/${projectId}/${fileName}`,
        projectId
      };
    } catch (error) {
      console.error('Error getting video metadata:', error);
      throw error;
    }
  }

  // Check if video exists
  static async videoExists(projectId: string, fileName: string): Promise<boolean> {
    try {
      const storageRef = ref(storage, `videos/${projectId}/${fileName}`);
      await getDownloadURL(storageRef);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get storage reference for a video
  static getVideoStorageRef(projectId: string, fileName: string): StorageReference {
    return ref(storage, `videos/${projectId}/${fileName}`);
  }

  // Upload thumbnail image for a video
  static async uploadThumbnail(
    file: File, 
    projectId: string, 
    fileName?: string
  ): Promise<string> {
    try {
      const finalFileName = fileName || `thumb_${Date.now()}.jpg`;
      const storageRef = ref(storage, `thumbnails/${projectId}/${finalFileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw error;
    }
  }

  // Get thumbnail download URL
  static async getThumbnailDownloadURL(projectId: string, fileName: string): Promise<string> {
    try {
      const storageRef = ref(storage, `thumbnails/${projectId}/${fileName}`);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting thumbnail download URL:', error);
      throw error;
    }
  }
}
