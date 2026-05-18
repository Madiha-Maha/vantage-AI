import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserSettings } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
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

const GUEST_PROFILE_KEY = 'vantage_guest_profile';
const GUEST_SETTINGS_KEY = 'vantage_guest_settings';
const GUEST_USER_KEY = 'vantage_is_guest';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    // Check for existing guest session
    const wasGuest = localStorage.getItem(GUEST_USER_KEY) === 'true';
    if (wasGuest) {
      setIsGuest(true);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setIsGuest(false);
        localStorage.removeItem(GUEST_USER_KEY);
      }
      if (!user && !wasGuest) {
        setProfile(null);
        setSettings(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (isGuest) {
      const savedProfile = localStorage.getItem(GUEST_PROFILE_KEY);
      const savedSettings = localStorage.getItem(GUEST_SETTINGS_KEY);

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        const initialProfile: UserProfile = {
          name: 'Guest Agent',
          title: 'Guest Explorer',
          bio: 'Exploring the cognitive edge in guest mode.',
          skills: ['Guest Access'],
          interests: ['AI Simulations', 'Professional Growth'],
          experience: 'System Guest',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=guest`,
          socials: {}
        };
        setProfile(initialProfile);
        localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(initialProfile));
      }

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        const initialSettings: UserSettings = {
          theme: 'dark',
          notifications: true,
          recordingEnabled: true,
          privacyMode: true,
          biometricAnalysis: true,
          aiMentorship: true,
          realTimeMetrics: false
        };
        setSettings(initialSettings);
        localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(initialSettings));
      }
      setLoading(false);
      return;
    }

    if (!user) return;

    // Listen to profile and settings
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || (user.displayName || 'Agent'),
          title: data.title || '',
          bio: data.bio || '',
          skills: data.skills || [],
          interests: data.interests || [],
          experience: data.experience || '',
          avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          socials: data.socials || {}
        });
        setSettings(data.settings || {
          theme: 'dark',
          notifications: true,
          recordingEnabled: true,
          privacyMode: false,
          biometricAnalysis: true,
          aiMentorship: true,
          realTimeMetrics: false
        });
      } else {
        // Init profile if doesn't exist
        const initialProfile: UserProfile = {
          name: user.displayName || 'Agent',
          title: '',
          bio: '',
          skills: [],
          interests: [],
          experience: '',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          socials: {}
        };
        const initialSettings: UserSettings = {
          theme: 'dark',
          notifications: true,
          recordingEnabled: true,
          privacyMode: false,
          biometricAnalysis: true,
          aiMentorship: true,
          realTimeMetrics: false
        };
        setDoc(userDocRef, {
          ...initialProfile,
          settings: initialSettings,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribeSnapshot();
  }, [user, isGuest]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      setIsGuest(false);
      localStorage.removeItem(GUEST_USER_KEY);
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
        const domainError = new Error("Unauthorized Domain: Please add this domain to your Firebase Console settings.");
        (domainError as any).code = error.code;
        throw domainError;
      }
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInAsGuest = async () => {
    setIsGuest(true);
    localStorage.setItem(GUEST_USER_KEY, 'true');
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsGuest(false);
      localStorage.removeItem(GUEST_USER_KEY);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    if (isGuest) {
      setProfile(newProfile);
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(newProfile));
      return;
    }
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { 
        ...newProfile, 
        updatedAt: serverTimestamp() 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    if (isGuest) {
      setSettings(newSettings);
      localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(newSettings));
      return;
    }
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { 
        settings: newSettings, 
        updatedAt: serverTimestamp() 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isGuest,
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
