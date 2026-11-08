import React, { Component, useEffect, useState } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
import { initializeNotificationsSyncListener } from './services/PendingNotificationsSync';
import { auth } from './firebase-config';
import { bootstrapFirebaseUser, onAuthStateChanged } from './services/authService';

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
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { setUser(null); setLoading(false); return; }
      try { setUser(await bootstrapFirebaseUser(firebaseUser)); } catch (error) { console.error('Profile bootstrap failed:', error); setUser({ firebaseUser, display_name: firebaseUser.displayName || '' }); }
      setLoading(false);
    });
  }, []);
  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>جارٍ التحميل…</div>;
  return <ErrorBoundary>{user ? <App user={user} /> : <ProfileSetup onComplete={setUser} />}</ErrorBoundary>;
}
