import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as firebaseSignOut } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth } from '../firebase-config';
import { bootstrapProfile } from './profileApi';

export const getFirebaseIdToken = async (forceRefresh = false) => auth.currentUser ? auth.currentUser.getIdToken(forceRefresh) : null;
export const getCloudflareAuthHeaders = async (headers = {}) => { const token = await getFirebaseIdToken(); return { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }; };
export const fetchWithCloudflareAuth = async (input, init = {}) => fetch(input, { ...init, headers: await getCloudflareAuthHeaders(init.headers || {}) });

export const bootstrapFirebaseUser = async (user) => {
  const firebaseToken = await user.getIdToken();
  const profile = await bootstrapProfile({ firebaseToken, displayName: user.displayName || '', photoURL: user.photoURL || '', email: user.email || '' });
  return { ...profile, firebaseUser: user, display_name: profile?.display_name || user.displayName || '' };
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user, profile: await bootstrapFirebaseUser(result.user) };
  } catch (error) {
    if (Capacitor.isNativePlatform() || error?.code === 'auth/popup-blocked') {
      try { await signInWithRedirect(auth, new GoogleAuthProvider()); return { success: true, redirecting: true }; }
      catch (fallbackError) { return { success: false, error: fallbackError?.message || 'تعذر فتح تسجيل الدخول بواسطة Google.' }; }
    }
    return { success: false, error: error?.message || 'تعذر تسجيل الدخول بواسطة Google.' };
  }
};
export const signOut = () => firebaseSignOut(auth);
export { onAuthStateChanged };
