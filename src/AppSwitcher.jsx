import React, { Component, useEffect, useState } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
import { initializeNotificationsSyncListener } from './services/PendingNotificationsSync';
import { auth } from './firebase-config';
import { bootstrapFirebaseUser, onAuthStateChanged } from './services/authService';
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (disposed) return;
      const currentEventId = ++authEventId;
      if (!firebaseUser) { setUser(null); setLoading(false); return; }
      setLoading(true);
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
    return () => { disposed = true; unsubscribe(); };
  }, []);
  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>جارٍ التحميل…</div>;
  return <AppThemeProvider><ErrorBoundary>{user ? <App user={user} onUserUpdated={setUser} /> : <ProfileSetup onComplete={setUser} />}</ErrorBoundary></AppThemeProvider>;
}
