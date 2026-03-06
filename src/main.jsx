import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';
import { initializeApp, getApps, getApp } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const firebaseConfig = {
  apiKey: "AIzaSyAKjsgnoHnGGr3urhm6Kpu7RvxN2dp6sJQ",
  authDomain: "raqqa-43dc8.firebaseapp.com",
  projectId: "raqqa-43dc8",
  storageBucket: "raqqa-43dc8.firebasestorage.app",
  messagingSenderId: "162488255991",
  appId: "1:162488255991:android:73d6299f11a1b7aec61af2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const Main = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      
      const setupOneSignal = async () => {
        try {
          const OneSignal = (await import('onesignal-cordova-plugin')).default;
          
          // استخدام المعرف الجديد الخاص بك هنا
          OneSignal.setAppId("726fe629-0b1e-4294-9a4b-39cf50212b42");
          
          OneSignal.initWithContext(window);

          const userId = localStorage.getItem('user_id') || 'raqqa_' + Math.floor(Math.random() * 10000);
          localStorage.setItem('user_id', userId);
          OneSignal.setExternalUserId(userId);

          // إظهار طلب الإذن للمستخدم
          OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
            console.log("OneSignal Permission Status: " + accepted);
          });

        } catch (e) { console.error("OneSignal Error:", e); }
      };
      
      setupOneSignal();

      const setupPush = async () => {
        try {
          let permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'prompt') permStatus = await PushNotifications.requestPermissions();
          if (permStatus.receive === 'granted') await PushNotifications.register();
        } catch (error) { console.error("Push Error: ", error); }
      };

      setupPush();

      PushNotifications.addListener('registration', async (token) => {
        localStorage.setItem('fcm_token', token.value);
        try {
          await CapacitorHttp.post({
            url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
            headers: { 'Content-Type': 'application/json' },
            data: {
              fcm_token: token.value,
              user_id: localStorage.getItem('user_id'),
              username: localStorage.getItem('username') || 'مستخدمة رقة',
              category: 'تسجيل جهاز',
              note: 'تم الربط بنجاح مع OneSignal الجديد'
            }
          });
        } catch (err) { console.error("API Error:", err); }
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <AppSwitcher />
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Main />);
}
