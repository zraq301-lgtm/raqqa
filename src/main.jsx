import React, { useState, useEffect } from 'react'; 
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import SplashScreen from './SplashScreen'; 
import './App.css';
import { initializeApp, getApps } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm'; 

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
      const setupPush = async () => {
        try {
          // التعامل مع الإشعارات عند التسجيل
          await PushNotifications.addListener('registration', async (token) => {
            handleTokenLocally(token.value);
            
            try {
              // الاشتراك في قناة جميع المستخدمين
              await FCM.subscribeTo({ topic: 'all_users' });
              console.log("✅ Subscribed to all_users topic");
            } catch (err) {
              console.error("❌ Topic Subscription Error:", err);
            }
          });

          // عند استلام إشعار والتطبيق مفتوح
          await PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log("📩 إشعار جديد:", notification.title);
          });

          // عند النقر على الإشعار
          await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log("🖱️ تم النقر على الإشعار:", notification.actionId);
          });

          // طلب الصلاحيات
          let permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive === 'granted') {
            await PushNotifications.register();
          }
        } catch (error) {
          console.error("Push Init Error:", error);
        }
      };

      setupPush();
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
  ReactDOM.createRoot(rootElement).render(<Main />);
}
