import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types';

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, displayName?: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign in anonymously
  static async signInAnonymously(): Promise<UserCredential> {
    try {
      return await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen to authentication state changes
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Update user profile
  static async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, updates);
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Convert Firebase User to our User type
  static convertFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now())
    };
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  // Check if user is anonymous
  static isAnonymous(): boolean {
    return auth.currentUser?.isAnonymous || false;
  }

  // Get user ID
  static getUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  // Get user email
  static getUserEmail(): string | null {
    return auth.currentUser?.email || null;
  }

  // Get user display name
  static getUserDisplayName(): string | null {
    return auth.currentUser?.displayName || null;
  }

  // Get user photo URL
  static getUserPhotoURL(): string | null {
    return auth.currentUser?.photoURL || null;
  }
}
