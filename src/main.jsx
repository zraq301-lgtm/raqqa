import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher';
import SplashScreen from './SplashScreen';
import './App.css';
import { initializeApp, getApps } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import { initializeGithubLiveUpdate } from './services/githubLiveUpdate';
import { preloadAppResources } from './services/preloadService';

// --- إعدادات Firebase (مشروع Roqa) ---
const firebaseConfig = {
  apiKey: "AIzaSyAKjsgnoHnGGr3urhm6Kpu7RvxN2dp6sJQ",
  authDomain: "raqqa-43dc8.firebaseapp.com",
  projectId: "raqqa-43dc8",
  storageBucket: "raqqa-43dc8.firebasestorage.app",
  messagingSenderId: "162488255991",
  appId: "1:162488255991:android:73d6299f11a1b7aec61af2"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const Main = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [foregroundPush, setForegroundPush] = useState(null);

  const handleTokenLocally = (tokenValue) => {
    if (!tokenValue) return;
    console.log("📍 FCM Token Saved:", tokenValue); // طباعة التوكن للتأكد

  };

  const handleAuthenticated = useCallback(() => {
    // يبدأ التحميل المسبق قبل إظهار الفيديو حتى تعمل الموارد خلف شاشة البداية.
    void preloadAppResources();
    setShowSplash(true);
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeGithubLiveUpdate();
      const setupNotifications = async () => {
        try {
          // [1] أولاً: إعداد جميع المستمعات (Listeners) وتجهيزها قبل إطلاق طلب التسجيل

          // مستمع إشعارات فيربيس (Push) وقنص التوكن
          await PushNotifications.addListener('registration', async (token) => {
            handleTokenLocally(token.value);

            try {
              await FCM.subscribeTo({ topic: 'all_users' });
              console.log("✅ Subscribed to all_users topic");
            } catch (err) {
              console.error("❌ Topic Subscription Error:", err);
            }
          });

          await PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log("📩 إشعار Push جديد:", notification.title);
            const data = notification?.data || {};
            const image = notification?.image || notification?.imageUrl || notification?.image_url || data.image_url || data.imageUrl || data.imageURL || data.image || '';
            const id = Date.now();
            setForegroundPush({ id, title: notification?.title || data.notification_title || 'إشعار من رقة', body: notification?.body || data.notification_body || '', image: /^https:\/\//i.test(image) ? image : '' });
            window.setTimeout(() => setForegroundPush((current) => current?.id === id ? null : current), 12000);
          });

          await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log("🖱️ تم النقر على إشعار Push:", notification.actionId);
          });

          // مستمعات الإشعارات المحلية (Local)
          await LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log("🔔 إشعار محلي مستلم:", notification.title);
          });

          await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log("🖱️ تم النقر على الإشعار المحلي:", notification.actionId);
          });

          // [2] ثانياً: فحص وطلب الأذونات معاً في خطوة متزامنة لطلبها فوراً
          let pushPerm = await PushNotifications.checkPermissions();
          let localPerm = await LocalNotifications.checkPermissions();

          // إذا كان أي منهما يحتاج لطلب تصريح (Prompt) نطلبهما فوراً خلف بعضهما
          if (pushPerm.receive === 'prompt') {
            pushPerm = await PushNotifications.requestPermissions();
          }
          if (localPerm.display === 'prompt') {
            localPerm = await LocalNotifications.requestPermissions();
          }

          // [3] ثالثاً: تفعيل التسجيل وإطلاق المستمعات بمجرد قبول التصريح
          if (pushPerm.receive === 'granted') {
            await PushNotifications.register();
            console.log("🚀 Push Registration Triggered Successfully");
          } else {
            console.warn("⚠️ Push permissions were denied by user");
          }

        } catch (error) {
          console.error("Notifications Init Error:", error);
        }
      };

      setupNotifications();
    }
  }, []);

  return (
    <BrowserRouter>
      <AppSwitcher onAuthenticated={handleAuthenticated} />
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      {!showSplash && foregroundPush && (
        <aside className="foreground-push-card" role="status" aria-live="polite">
          {foregroundPush.image && <img src={foregroundPush.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
          <div className="foreground-push-copy"><strong>{foregroundPush.title}</strong>{foregroundPush.body && <span>{foregroundPush.body}</span>}</div>
          <button type="button" aria-label="إغلاق الإشعار" onClick={() => setForegroundPush(null)}>×</button>
        </aside>
      )}
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Main />);
}
