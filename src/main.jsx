import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';
import { initializeApp, getApps } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// تم حذف استيراد CapacitorUpdater الخاص بـ Capgo

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
  
  // وظيفة حفظ التوكن محلياً في ذاكرة الهاتف
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
      // تم إزالة CapacitorUpdater.notifyAppReady() لتجنب أخطاء المكتبة المحذوفة
      
      const initPush = async () => {
        try {
          // 1. التحقق من صلاحيات الإشعارات
          let permStatus = await PushNotifications.checkPermissions();
          
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive === 'granted') {
            // 2. تسجيل الجهاز في Firebase
            await PushNotifications.register();
          }
        } catch (error) {
          console.error("Push Init Error:", error);
        }
      };

      initPush();

      // 3. مستمع لتوليد التوكن وحفظه
      PushNotifications.addListener('registration', (token) => {
        console.log("🚀 FCM Token Generated:", token.value);
        handleTokenLocally(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error("Registration Error: ", error.error);
      });

      // 4. مستمع لاستلام الإشعارات أثناء فتح التطبيق
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log("📩 إشعار جديد مستلم:", notification.title);
      });
    }
    
    // تنظيف المستمعين عند إغلاق المكون
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
