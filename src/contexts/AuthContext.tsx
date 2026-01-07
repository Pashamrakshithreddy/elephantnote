import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = AuthService.convertFirebaseUser(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await AuthService.signUp(email, password, displayName);
      if (userCredential.user) {
        const userData = AuthService.convertFirebaseUser(userCredential.user);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await AuthService.signIn(email, password);
      if (userCredential.user) {
        const userData = AuthService.convertFirebaseUser(userCredential.user);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      const userCredential = await AuthService.signInAnonymously();
      if (userCredential.user) {
        const userData = AuthService.convertFirebaseUser(userCredential.user);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in signInAnonymously:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      await AuthService.updateUserProfile(updates);
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInAnonymously,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
