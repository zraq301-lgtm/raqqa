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
    console.log("📍 FCM Token Saved:", tokenValue); // طباعة التوكن للتأكد

    if (!localStorage.getItem('user_id')) {
      const uId = 'user_' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('user_id', uId);
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
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
