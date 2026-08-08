import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');

// Helper function to convert Firebase User to UserProfile
export const formatFirebaseUser = (user: FirebaseUser): UserProfile => {
  return {
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=0D8ABC&color=fff`,
    isPro: true
  };
};

/**
 * Perform real Google Login via Firebase Authentication Popup or Fallback
 */
export const signInWithGoogleReal = async (): Promise<UserProfile> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userProfile = formatFirebaseUser(result.user);
    return userProfile;
  } catch (error: any) {
    console.warn("Firebase popup auth failed or popup blocked, checking fallback:", error);
    
    // If popup is blocked in iframe, try Google Identity Services client or re-throw
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        throw new Error('Redirecting to Google login...');
      } catch (redirectErr) {
        throw error;
      }
    }
    throw error;
  }
};

/**
 * Sign out helper
 */
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Logout error", e);
  }
};
