import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

export const ADMIN_EMAIL = 'kashikateam@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or create user profile from Firestore
  const fetchUserProfile = async (user: User): Promise<UserProfile | null> => {
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        return data;
      } else {
        // Create initial profile in Firestore
        const newProfile: UserProfile = {
          id: user.uid,
          fullName: user.displayName || user.email?.split('@')[0] || 'Patient User',
          email: user.email || '',
          phone: user.phoneNumber || '',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.warn('Could not fetch Firestore user profile, using fallback profile:', error);
      const fallback: UserProfile = {
        id: user.uid,
        fullName: user.displayName || user.email?.split('@')[0] || 'Patient User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        createdAt: new Date().toISOString()
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await fetchUserProfile(res.user);
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string, phone?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (res.user) {
      // Update Firebase Auth profile
      await updateProfile(res.user, {
        displayName: fullName.trim()
      });

      // Write user profile to Firestore
      const userDocRef = doc(db, 'users', res.user.uid);
      const newProfile: UserProfile = {
        id: res.user.uid,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone?.trim() || '',
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      } catch (error) {
        console.warn('Could not persist profile in Firestore; using authenticated local profile:', error);
        setUserProfile(newProfile);
      }
    }
  };

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      await fetchUserProfile(res.user);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const updated = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userDocRef, updated);
      setUserProfile(prev => prev ? { ...prev, ...updated } : null);
    } catch (error) {
      console.warn('Could not sync profile update to Firestore; updating session profile:', error);
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  const isAdmin = Boolean(
    currentUser?.email &&
    currentUser.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        logout,
        updateProfileData,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
