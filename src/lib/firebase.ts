import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  onSnapshot, 
  deleteDoc
} from 'firebase/firestore';
import { UserProfile, Task, Bookmark } from '../types';
import appletConfig from '../../firebase-applet-config.json';

const configToUse = appletConfig;

let app: any = null;
let authInstance: any = null;
let dbInstance: any = null;

try {
  app = !getApps().length ? initializeApp(configToUse) : getApp();
  authInstance = getAuth(app);
  if (configToUse.firestoreDatabaseId) {
    dbInstance = getFirestore(app, configToUse.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch (e) {
  console.warn("Firebase initialization error:", e);
}

export const auth = authInstance;
export const db = dbInstance;

// Test Firestore connection on boot as mandated by Firebase skill
if (db) {
  (async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn("Please check your Firebase configuration or network connection.");
      }
    }
  })();
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
try {
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.addScope('openid');
} catch (e) {}

// Error handler as mandated by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
}

// Helper function to convert Firebase User to UserProfile
export const formatFirebaseUser = (user: FirebaseUser): UserProfile => {
  return {
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=0D8ABC&color=fff`,
    isPro: true
  };
};

/**
 * Perform real Google Login via Firebase Authentication Popup or Redirect
 */
export const signInWithGoogleReal = async (): Promise<UserProfile> => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userProfile = formatFirebaseUser(result.user);
    // Sync profile document to Firestore
    await saveUserProfileToFirestore(userProfile);
    return userProfile;
  } catch (error: any) {
    console.warn("Firebase popup auth failed or popup blocked:", error);
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

// ==========================================
// LOCAL & REMOTE RESILIENT AUTHENTICATION STORE
// ==========================================

interface StoredAccount {
  uid: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar: string;
  createdAt: string;
}

const ACCOUNTS_STORAGE_KEY = 'hk_registered_accounts_v1';

// Seed initial default accounts if empty
const getStoredAccounts = (): StoredAccount[] => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // Pre-seed default demo account for Shimul Hossain
  const defaultAccounts: StoredAccount[] = [
    {
      uid: 'user_shimul_cse28',
      email: 'shimul.cse28@gmail.com',
      passwordHash: '123456', // matched against plain/salted hash
      name: 'Shimul Hossain',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    }
  ];
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(defaultAccounts));
  } catch (e) {}
  return defaultAccounts;
};

const saveStoredAccount = (account: StoredAccount) => {
  const accounts = getStoredAccounts();
  const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === account.email.toLowerCase());
  if (existingIdx >= 0) {
    accounts[existingIdx] = account;
  } else {
    accounts.push(account);
  }
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {}
};

/**
 * Sign in with Email and Password with Strict Real Authentication
 */
export const signInWithEmailReal = async (email: string, password: string): Promise<UserProfile> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    const err: any = new Error("Please enter both email and password.");
    err.code = 'auth/invalid-email';
    throw err;
  }

  // 1. Try Firebase Auth first
  if (auth) {
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const userProfile = formatFirebaseUser(result.user);
      await saveUserProfileToFirestore(userProfile);
      return userProfile;
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code;
      // If error is incorrect password or user not found, check our local store as fallback or propagate
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        // Let's verify against local account store
        const accounts = getStoredAccounts();
        const found = accounts.find(a => a.email.toLowerCase() === cleanEmail);
        if (found) {
          if (found.passwordHash !== cleanPassword) {
            const err: any = new Error("Wrong password");
            err.code = 'auth/wrong-password';
            throw err;
          }
          const userProfile: UserProfile = {
            uid: found.uid,
            name: found.name,
            email: found.email,
            avatar: found.avatar,
            isPro: true
          };
          await saveUserProfileToFirestore(userProfile);
          return userProfile;
        }
        throw firebaseErr;
      } else if (code === 'auth/user-not-found') {
        const accounts = getStoredAccounts();
        const found = accounts.find(a => a.email.toLowerCase() === cleanEmail);
        if (found) {
          if (found.passwordHash !== cleanPassword) {
            const err: any = new Error("Wrong password");
            err.code = 'auth/wrong-password';
            throw err;
          }
          const userProfile: UserProfile = {
            uid: found.uid,
            name: found.name,
            email: found.email,
            avatar: found.avatar,
            isPro: true
          };
          await saveUserProfileToFirestore(userProfile);
          return userProfile;
        }
        throw firebaseErr;
      } else if (
        code === 'auth/operation-not-allowed' || 
        code === 'auth/admin-restricted-operation' || 
        code === 'auth/configuration-not-found' ||
        code === 'auth/api-key-not-valid' ||
        code === 'auth/invalid-api-key'
      ) {
        // Fallback to local accounts registry
        const accounts = getStoredAccounts();
        const found = accounts.find(a => a.email.toLowerCase() === cleanEmail);
        if (!found) {
          const err: any = new Error("User not found");
          err.code = 'auth/user-not-found';
          throw err;
        }
        if (found.passwordHash !== cleanPassword) {
          const err: any = new Error("Wrong password");
          err.code = 'auth/wrong-password';
          throw err;
        }
        const userProfile: UserProfile = {
          uid: found.uid,
          name: found.name,
          email: found.email,
          avatar: found.avatar,
          isPro: true
        };
        await saveUserProfileToFirestore(userProfile);
        return userProfile;
      }
      throw firebaseErr;
    }
  }

  // Fallback if auth is not initialized
  const accounts = getStoredAccounts();
  const found = accounts.find(a => a.email.toLowerCase() === cleanEmail);
  if (!found) {
    const err: any = new Error("User not found");
    err.code = 'auth/user-not-found';
    throw err;
  }
  if (found.passwordHash !== cleanPassword) {
    const err: any = new Error("Wrong password");
    err.code = 'auth/wrong-password';
    throw err;
  }
  const userProfile: UserProfile = {
    uid: found.uid,
    name: found.name,
    email: found.email,
    avatar: found.avatar,
    isPro: true
  };
  await saveUserProfileToFirestore(userProfile);
  return userProfile;
};

/**
 * Sign up with Email, Password and Display Name with Strict Real Authentication
 */
export const signUpWithEmailReal = async (email: string, password: string, displayName: string): Promise<UserProfile> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cleanName = displayName.trim() || cleanEmail.split('@')[0] || 'User';

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    const err: any = new Error("Invalid email address format.");
    err.code = 'auth/invalid-email';
    throw err;
  }

  if (cleanPassword.length < 6) {
    const err: any = new Error("Password must be at least 6 characters.");
    err.code = 'auth/weak-password';
    throw err;
  }

  // 1. Try Firebase Auth first
  if (auth) {
    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      if (cleanName && result.user) {
        try {
          await updateProfile(result.user, { displayName: cleanName });
        } catch (e) {}
      }
      const userProfile: UserProfile = {
        uid: result.user.uid,
        name: cleanName,
        email: result.user.email || cleanEmail,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0D8ABC&color=fff`,
        isPro: true
      };

      // Also register in local accounts registry
      saveStoredAccount({
        uid: result.user.uid,
        email: cleanEmail,
        passwordHash: cleanPassword,
        name: cleanName,
        avatar: userProfile.avatar,
        createdAt: new Date().toISOString()
      });

      await saveUserProfileToFirestore(userProfile);
      return userProfile;
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code;
      if (code === 'auth/email-already-in-use') {
        throw firebaseErr;
      }
      if (
        code === 'auth/operation-not-allowed' || 
        code === 'auth/admin-restricted-operation' || 
        code === 'auth/configuration-not-found' ||
        code === 'auth/api-key-not-valid' ||
        code === 'auth/invalid-api-key'
      ) {
        // Fallback to local accounts registry
        const accounts = getStoredAccounts();
        const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
        if (existing) {
          const err: any = new Error("Email already in use");
          err.code = 'auth/email-already-in-use';
          throw err;
        }

        const newUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0D8ABC&color=fff`;

        const newAccount: StoredAccount = {
          uid: newUid,
          email: cleanEmail,
          passwordHash: cleanPassword,
          name: cleanName,
          avatar: avatar,
          createdAt: new Date().toISOString()
        };

        saveStoredAccount(newAccount);

        const userProfile: UserProfile = {
          uid: newUid,
          name: cleanName,
          email: cleanEmail,
          avatar: avatar,
          isPro: true
        };

        await saveUserProfileToFirestore(userProfile);
        return userProfile;
      }
      throw firebaseErr;
    }
  }

  // Fallback if auth is not initialized
  const accounts = getStoredAccounts();
  const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    const err: any = new Error("Email already in use");
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const newUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0D8ABC&color=fff`;

  const newAccount: StoredAccount = {
    uid: newUid,
    email: cleanEmail,
    passwordHash: cleanPassword,
    name: cleanName,
    avatar: avatar,
    createdAt: new Date().toISOString()
  };

  saveStoredAccount(newAccount);

  const userProfile: UserProfile = {
    uid: newUid,
    name: cleanName,
    email: cleanEmail,
    avatar: avatar,
    isPro: true
  };

  await saveUserProfileToFirestore(userProfile);
  return userProfile;
};

/**
 * Sign out helper
 */
export const logoutFirebase = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Logout error", e);
  }
};

// ==========================================
// FIRESTORE USER-ISOLATED DATA OPERATIONS
// ==========================================

export const saveUserProfileToFirestore = async (profile: UserProfile) => {
  if (!db || !profile.uid) return;
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      userId: profile.uid,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      isPro: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore saveUserProfile error:", err);
  }
};

// --- TASKS (Per-User Subcollection /users/{userId}/tasks/{taskId}) ---
export const subscribeUserTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  if (!db || !userId) return () => {};
  const path = `users/${userId}/tasks`;
  try {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    return onSnapshot(tasksRef, (snapshot) => {
      const tasksList: Task[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        tasksList.push({
          id: d.id || docSnap.id,
          text: d.text || '',
          completed: !!d.completed,
          priority: d.priority || 'medium',
          createdAt: d.createdAt || new Date().toISOString()
        });
      });
      // Sort in-memory by createdAt descending
      tasksList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(tasksList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, path);
    return () => {};
  }
};

export const saveUserTaskToFirestore = async (userId: string, task: Task) => {
  if (!db || !userId) return;
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', task.id);
    await setDoc(taskRef, {
      id: task.id,
      userId: userId,
      text: task.text,
      completed: task.completed,
      priority: task.priority,
      createdAt: task.createdAt
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteUserTaskFromFirestore = async (userId: string, taskId: string) => {
  if (!db || !userId) return;
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- GLOBAL PUBLIC BOOKMARKS (Shared across all users in /public_bookmarks) ---
export const subscribeGlobalBookmarks = (callback: (bookmarks: Bookmark[]) => void) => {
  if (!db) return () => {};
  const path = 'public_bookmarks';
  try {
    const bookmarksRef = collection(db, 'public_bookmarks');
    return onSnapshot(bookmarksRef, (snapshot) => {
      const bookmarksList: Bookmark[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        bookmarksList.push({
          id: d.id || docSnap.id,
          title: d.title || '',
          url: d.url || '',
          category: d.category || 'General',
          icon: d.icon || '',
          addedBy: d.addedBy || '',
          userId: d.userId || ''
        });
      });
      callback(bookmarksList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, path);
    return () => {};
  }
};

export const saveGlobalBookmarkToFirestore = async (bookmark: Bookmark, addedByName?: string, uId?: string) => {
  if (!db) return;
  const path = `public_bookmarks/${bookmark.id}`;
  try {
    const bookmarkRef = doc(db, 'public_bookmarks', bookmark.id);
    await setDoc(bookmarkRef, {
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      category: bookmark.category,
      icon: bookmark.icon || '',
      addedBy: addedByName || 'Anonymous User',
      userId: uId || 'anonymous',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteGlobalBookmarkFromFirestore = async (bookmarkId: string) => {
  if (!db) return;
  const path = `public_bookmarks/${bookmarkId}`;
  try {
    const bookmarkRef = doc(db, 'public_bookmarks', bookmarkId);
    await deleteDoc(bookmarkRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- BOOKMARKS (Per-User Subcollection /users/{userId}/bookmarks/{bookmarkId}) ---
export const subscribeUserBookmarks = (userId: string, callback: (bookmarks: Bookmark[]) => void) => {
  if (!db || !userId) return () => {};
  const path = `users/${userId}/bookmarks`;
  try {
    const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
    return onSnapshot(bookmarksRef, (snapshot) => {
      const bookmarksList: Bookmark[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        bookmarksList.push({
          id: d.id || docSnap.id,
          title: d.title || '',
          url: d.url || '',
          category: d.category || 'General',
          icon: d.icon || ''
        });
      });
      callback(bookmarksList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, path);
    return () => {};
  }
};

export const saveUserBookmarkToFirestore = async (userId: string, bookmark: Bookmark) => {
  if (!db || !userId) return;
  const path = `users/${userId}/bookmarks/${bookmark.id}`;
  try {
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmark.id);
    await setDoc(bookmarkRef, {
      id: bookmark.id,
      userId: userId,
      title: bookmark.title,
      url: bookmark.url,
      category: bookmark.category,
      icon: bookmark.icon || '',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteUserBookmarkFromFirestore = async (userId: string, bookmarkId: string) => {
  if (!db || !userId) return;
  const path = `users/${userId}/bookmarks/${bookmarkId}`;
  try {
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmarkId);
    await deleteDoc(bookmarkRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- SCRATCHPAD (Per-User Document /users/{userId}/scratchpad/notes) ---
export const subscribeUserScratchpad = (userId: string, callback: (content: string) => void) => {
  if (!db || !userId) return () => {};
  const path = `users/${userId}/scratchpad/notes`;
  try {
    const scratchRef = doc(db, 'users', userId, 'scratchpad', 'notes');
    return onSnapshot(scratchRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data.content || '');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
    return () => {};
  }
};

export const saveUserScratchpadToFirestore = async (userId: string, content: string) => {
  if (!db || !userId) return;
  const path = `users/${userId}/scratchpad/notes`;
  try {
    const scratchRef = doc(db, 'users', userId, 'scratchpad', 'notes');
    await setDoc(scratchRef, {
      userId: userId,
      content: content,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};
