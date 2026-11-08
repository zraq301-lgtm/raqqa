import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import { initializeGithubLiveUpdate } from './services/githubLiveUpdate';

// إعدادات Firebase للمشروع نفسه المستخدم في تطبيق رقة.
const firebaseConfig = {
  apiKey: 'AIzaSyAKjsgnoHnGGr3urhm6Kpu7RvxN2dp6sJQ',
  authDomain: 'raqqa-43dc8.firebaseapp.com',
  projectId: 'raqqa-43dc8',
  storageBucket: 'raqqa-43dc8.firebasestorage.app',
  messagingSenderId: '162488255991',
  appId: '1:162488255991:android:73d6299f11a1b7aec61af2',
};

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

function AuthScreen({ error, loading, onSignIn }) {
  return (
    <main dir="rtl" style={authStyles.page}>
      <section style={authStyles.card}>
        <div style={authStyles.logo}>🌸</div>
        <h1 style={authStyles.title}>لوحة إدارة رقة</h1>
        <p style={authStyles.text}>سجّلي الدخول بحساب Google المصرّح له للوصول إلى أدوات الإدارة.</p>
        {error && <p role="alert" style={authStyles.error}>{error}</p>}
        <button type="button" onClick={onSignIn} disabled={loading} style={authStyles.button}>
          {loading ? 'جارٍ التحقق من الحساب…' : 'المتابعة باستخدام Google'}
        </button>
      </section>
    </main>
  );
}

const authStyles = {
  page: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(135deg,#fff5f9,#fff)', fontFamily: 'Tajawal, sans-serif' },
  card: { width: '100%', maxWidth: 430, padding: 36, borderRadius: 28, background: '#fff', boxShadow: '0 18px 50px rgba(190,80,130,.14)', textAlign: 'center' },
  logo: { fontSize: 48, marginBottom: 12 },
  title: { margin: '0 0 10px', color: '#7b3157' },
  text: { color: '#777', lineHeight: 1.8 },
  error: { color: '#b42318', background: '#fff1f0', padding: 12, borderRadius: 12 },
  button: { width: '100%', padding: '15px 18px', border: 0, borderRadius: 15, background: '#7b3157', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' },
};

const getAuthErrorMessage = (error) => {
  if (error?.code === 'auth/unauthorized-domain' || error?.code === 'auth/operation-not-allowed') return 'هذا الحساب أو النطاق غير مصرح لهما بالدخول إلى لوحة الإدارة.';
  if (error?.code === 'auth/popup-closed-by-user') return 'تم إغلاق نافذة تسجيل الدخول قبل إكمالها.';
  return 'تعذر تسجيل الدخول. تحققي من الحساب المصرّح به ثم حاولي مرة أخرى.';
};

const Main = () => {
  const [user, setUser] = useState(undefined);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    getRedirectResult(auth).catch((error) => setAuthError(getAuthErrorMessage(error)));
  }, []);

  const signIn = async () => {
    setSigningIn(true);
    setAuthError('');
    try {
      if (Capacitor.isNativePlatform()) await signInWithRedirect(auth, googleProvider);
      else await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Admin sign-in error:', error);
      setAuthError(getAuthErrorMessage(error));
      setSigningIn(false);
    }
  };

  const handleTokenLocally = (tokenValue) => {
    if (!tokenValue) return;
    localStorage.setItem('fcm_token', tokenValue);
    if (!localStorage.getItem('user_id')) localStorage.setItem('user_id', `user_${Math.floor(Math.random() * 1000000)}`);
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user) return undefined;
    initializeGithubLiveUpdate();
    const setupNotifications = async () => {
      try {
        await PushNotifications.addListener('registration', async (token) => {
          handleTokenLocally(token.value);
          try { await FCM.subscribeTo({ topic: 'all_users' }); } catch (error) { console.error('Topic Subscription Error:', error); }
        });
        await PushNotifications.addListener('pushNotificationReceived', (notification) => console.log('Push notification:', notification.title));
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => console.log('Push action:', notification.actionId));
        await LocalNotifications.addListener('localNotificationReceived', (notification) => console.log('Local notification:', notification.title));
        await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => console.log('Local action:', notification.actionId));
        const pushPerm = await PushNotifications.checkPermissions();
        const localPerm = await LocalNotifications.checkPermissions();
        if (pushPerm.receive === 'prompt' || localPerm.display === 'prompt') {
          await PushNotifications.requestPermissions();
          await LocalNotifications.requestPermissions();
        }
        if ((await PushNotifications.checkPermissions()).receive === 'granted') await PushNotifications.register();
      } catch (error) { console.error('Notifications Init Error:', error); }
    };
    setupNotifications();
    return undefined;
  }, [user]);

  if (user === undefined) return <main dir="rtl" style={authStyles.page}>جارٍ التحقق من جلسة Firebase…</main>;
  if (!user) return <AuthScreen error={authError} loading={signingIn} onSignIn={signIn} />;
  return <BrowserRouter><App /></BrowserRouter>;
};

const rootElement = document.getElementById('root');
if (rootElement) ReactDOM.createRoot(rootElement).render(<Main />);
