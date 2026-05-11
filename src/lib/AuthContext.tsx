import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserSettings } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  settings: UserSettings | null;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setSettings(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to profile and settings
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || (user.isAnonymous ? 'Guest Agent' : (user.displayName || 'Agent')),
          title: data.title || '',
          bio: data.bio || '',
          skills: data.skills || [],
          experience: data.experience || '',
          avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          socials: data.socials || {}
        });
        setSettings(data.settings || {
          theme: 'dark',
          notifications: true,
          recordingEnabled: true,
          privacyMode: false,
          biometricAnalysis: true
        });
      } else {
        // Init profile if doesn't exist
        const initialProfile: UserProfile = {
          name: user.isAnonymous ? 'Guest Agent' : (user.displayName || 'Agent'),
          title: '',
          bio: '',
          skills: [],
          experience: '',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          socials: {}
        };
        const initialSettings: UserSettings = {
          theme: 'dark',
          notifications: true,
          recordingEnabled: true,
          privacyMode: false,
          biometricAnalysis: true
        };
        setDoc(userDocRef, {
          ...initialProfile,
          settings: initialSettings,
          updatedAt: serverTimestamp()
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to user doc:", error);
      setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        const cancelError = new Error("Sign-in cancelled. Please keep the window open to authenticate.");
        (cancelError as any).code = error.code;
        throw cancelError;
      }
      if (error.code === 'auth/popup-blocked') {
        const blockError = new Error("Popup blocked by browser. Please allow popups for this site and try again.");
        (blockError as any).code = error.code;
        throw blockError;
      }
      if (error.code === 'auth/unauthorized-domain') {
        const domainError = new Error("Unauthorized Domain: Please add this domain to your Firebase Console settings (Authentication > Settings > Authorized domains).");
        (domainError as any).code = error.code;
        throw domainError;
      }
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Error initializing session:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { 
      ...newProfile, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  };

  const updateSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { 
      settings: newSettings, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      profile, 
      settings, 
      signInWithGoogle, 
      signInAsGuest,
      logout, 
      updateProfile,
      updateSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
