import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
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
    if (Capacitor.isNativePlatform()) {
      const nativeResult = await FirebaseAuthentication.signInWithGoogle();
      const idToken = nativeResult?.credential?.idToken;
      if (!idToken) return { success: false, error: 'لم يتم استلام رمز Google من التطبيق.' };
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      return { success: true, user: result.user, profile: await bootstrapFirebaseUser(result.user) };
    }

    const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user, profile: await bootstrapFirebaseUser(result.user) };
  } catch (error) {
    if (Capacitor.isNativePlatform()) return { success: false, error: error?.message || 'تعذر تسجيل الدخول من داخل التطبيق.' };
    if (error?.code === 'auth/popup-blocked') return { success: false, error: 'يرجى السماح بنافذة Google المنبثقة ثم المحاولة مرة أخرى.' };
    return { success: false, error: error?.message || 'تعذر تسجيل الدخول بواسطة Google.' };
  }
};
export const signOut = () => firebaseSignOut(auth);
export { onAuthStateChanged };
