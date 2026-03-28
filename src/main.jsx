import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';
import { initializeApp, getApps } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// إعدادات Firebase
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
  
  const handleTokenLocally = (tokenValue) => {
    if (!tokenValue) return;
    localStorage.setItem('fcm_token', tokenValue);
    console.log("📍 تم حفظ التوكن في ذاكرة الهاتف بنجاح.");

    if (!localStorage.getItem('user_id')) {
      const uId = 'user_' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('user_id', uId);
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      
      const setupPush = async () => {
        try {
          // أ. إضافة المستمعين أولاً لضمان عدم ضياع أي حدث
          await PushNotifications.addListener('registration', (token) => {
            console.log("🚀 FCM Token Generated:", token.value);
            handleTokenLocally(token.value);
          });

          await PushNotifications.addListener('registrationError', (error) => {
            console.error("Registration Error: ", error.error);
          });

          await PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log("📩 إشعار جديد مستلم:", notification.title);
          });

          // ب. التحقق من الصلاحيات وطلبها
          let permStatus = await PushNotifications.checkPermissions();
          
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive === 'granted') {
            // ج. التسجيل النهائي
            await PushNotifications.register();
          }
        } catch (error) {
          console.error("Push Init Error:", error);
        }
      };

      setupPush();
    }
    
    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
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
