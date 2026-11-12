import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
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
    if (Capacitor.isNativePlatform()) {
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      await GoogleAuth.initialize({ scopes: ['profile', 'email', 'openid'] });
      const nativeResult = await GoogleAuth.signIn();
      const idToken = nativeResult?.authentication?.idToken;
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
export const signOut = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      try {
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
        await GoogleAuth.signOut();
      } catch (error) { console.warn('Native Google sign-out skipped:', error?.message); }
    }
  } finally {
    ['raqqa_local_reminders', 'menstrual_data', 'last_prediction', 'chat_history', 'lady_lactation', 'lactation_history', 'lady_doctor', 'saved_reports', 'lady_fitness', 'roqa_alarms', 'roqa_chat_history', 'preg_ai_v3', 'saved_preg_month'].forEach((key) => localStorage.removeItem(key));
    await firebaseSignOut(auth);
  }
};
export { onAuthStateChanged };
