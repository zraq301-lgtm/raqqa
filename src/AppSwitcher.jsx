import React, { Component, useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
import { initializeNotificationsSyncListener } from './services/PendingNotificationsSync';
import { auth } from './firebase-config';
import { bootstrapFirebaseUser, onAuthStateChanged } from './services/authService';
import { getProfile } from './services/profileApi';
import AppThemeProvider from './components/AppThemeProvider';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Raqqa UI error:', error, info); }
  render() { return this.state.hasError ? <div dir="rtl" style={{ padding: 32, textAlign: 'center' }}>حدث خطأ داخلي. <button onClick={() => window.location.reload()}>إعادة التحميل</button><pre>{this.state.error?.toString()}</pre></div> : this.props.children; }
}

export default function AppSwitcher() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    initializeNotificationsSyncListener();
    let disposed = false;
    let authEventId = 0;
    let profileRefreshId = 0;
    let lastProfileRefreshAt = 0;
    let appStateListener = null;
    const authFallbackTimer = window.setTimeout(() => {
      if (!disposed) {
        console.warn('Firebase auth initialization is taking too long; showing the app shell.');
        setLoading(false);
      }
    }, 6000);
    const refreshProfileOnResume = async () => {
      const firebaseUser = auth.currentUser;
      if (disposed || !firebaseUser || Date.now() - lastProfileRefreshAt < 2000) return;
      lastProfileRefreshAt = Date.now();
      const currentRefreshId = ++profileRefreshId;
      try {
        const result = await getProfile();
        const profile = result?.profile;
        if (!profile || disposed || currentRefreshId !== profileRefreshId || auth.currentUser?.uid !== firebaseUser.uid) return;
        setUser((currentUser) => {
          if (currentUser?.firebaseUser?.uid && currentUser.firebaseUser.uid !== firebaseUser.uid) return currentUser;
          return {
            ...currentUser,
            ...profile,
            firebaseUser,
            display_name: profile.display_name || firebaseUser.displayName || currentUser?.display_name || '',
            photo_url: profile.photo_url || currentUser?.photo_url || currentUser?.photoURL || firebaseUser.photoURL || '',
          };
        });
        setLoading(false);
      } catch (error) {
        console.warn('Profile refresh after app resume failed:', error?.message || error);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refreshProfileOnResume();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', refreshProfileOnResume);
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void refreshProfileOnResume();
    }).then((listener) => {
      if (disposed) void listener.remove();
      else appStateListener = listener;
    }).catch((error) => console.warn('App resume listener unavailable:', error?.message || error));
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (disposed) return;
      window.clearTimeout(authFallbackTimer);
      const currentEventId = ++authEventId;
      if (!firebaseUser) { setUser(null); setLoading(false); return; }
      // لا ننتظر طلب الملف السحابي قبل عرض التطبيق؛ الملف الشخصي يُحدّث في الخلفية.
      setUser((currentUser) => ({
        ...currentUser,
        firebaseUser,
        display_name: currentUser?.display_name || firebaseUser.displayName || '',
        photo_url: currentUser?.photo_url || firebaseUser.photoURL || '',
      }));
      setLoading(false);
      const applyIfCurrent = (nextUser) => {
        if (disposed || currentEventId !== authEventId || auth.currentUser?.uid !== firebaseUser.uid) return;
        setUser(nextUser);
        setLoading(false);
      };
      bootstrapFirebaseUser(firebaseUser)
        .then(applyIfCurrent)
        .catch((error) => {
          console.error('Profile bootstrap failed:', error);
          applyIfCurrent({ firebaseUser, display_name: firebaseUser.displayName || '' });
        });
    });
    return () => {
      disposed = true;
      window.clearTimeout(authFallbackTimer);
      profileRefreshId += 1;
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', refreshProfileOnResume);
      if (appStateListener) void appStateListener.remove();
    };
  }, []);
  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>جارٍ التحميل…</div>;
  return <AppThemeProvider><ErrorBoundary>{user ? <App user={user} onUserUpdated={setUser} /> : <ProfileSetup onComplete={setUser} />}</ErrorBoundary></AppThemeProvider>;
}
