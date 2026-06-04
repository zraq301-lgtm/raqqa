import React, { useState, useEffect } from 'react'; 
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
import { ClerkProvider } from '@clerk/clerk-react'; // تم إضافة الاستيراد هنا فقط

// --- إعدادات مفتاح كليرك المضافة ---
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

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
  const [showSplash, setShowSplash] = useState(true);
  
  const handleTokenLocally = (tokenValue) => {
    if (!tokenValue) return;
    localStorage.setItem('fcm_token', tokenValue);
    console.log("📍 FCM Token Saved");

    if (!localStorage.getItem('user_id')) {
      const uId = 'user_' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('user_id', uId);
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const setupNotifications = async () => {
        try {
          // 1. إعداد مستمعات إشعارات فيربيس (Push)
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
          });

          await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log("🖱️ تم النقر على إشعار Push:", notification.actionId);
          });

          // 2. إعداد مستمعات الإشعارات المحلية (Local)
          await LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log("🔔 إشعار محلي مستلم:", notification.title);
          });

          await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log("🖱️ تم النقر على الإشعار المحلي:", notification.actionId);
          });

          // 3. طلب الأذونات للاثنين معاً في خطوة واحدة
          // نطلب إذن Push وإذن Local Notifications
          let pushPerm = await PushNotifications.checkPermissions();
          let localPerm = await LocalNotifications.checkPermissions();

          if (pushPerm.receive === 'prompt' || localPerm.display === 'prompt') {
            // طلب الأذونات بشكل متزامن
            await PushNotifications.requestPermissions();
            await LocalNotifications.requestPermissions();
          }

          // تفعيل التسجيل في فيربيس إذا تم قبول الإذن
          const finalPushPerm = await PushNotifications.checkPermissions();
          if (finalPushPerm.receive === 'granted') {
            await PushNotifications.register();
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
      {showSplash ? (
        <SplashScreen onFinished={() => setShowSplash(false)} />
      ) : (
        <AppSwitcher />
      )}
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Main />
      </ClerkProvider>
    </React.StrictMode>
  );
}
