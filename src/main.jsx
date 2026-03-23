import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';
import { initializeApp, getApps } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater'; // إضافة استيراد المكتبة

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
  
  // وظيفة معدلة: تخزين محلي فقط (بدون إرسال للسيرفر لمنع الإشعارات التلقائية)
  const handleTokenLocally = (tokenValue) => {
    if (!tokenValue) return;
    
    // حفظ التوكن في ذاكرة الهاتف فقط
    localStorage.setItem('fcm_token', tokenValue);
    console.log("📍 تم حفظ التوكن في ذاكرة الهاتف بنجاح.");

    // إعداد معرف المستخدم محلياً إذا لم يوجد
    if (!localStorage.getItem('user_id')) {
      const uId = 'user_' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('user_id', uId);
    }
  };

  useEffect(() => {
    // إبلاغ Capgo بأن التطبيق جاهز ومستقر (هذا يمنع التراجع التلقائي عن التحديثات)
    if (Capacitor.isNativePlatform()) {
      CapacitorUpdater.notifyAppReady();
      
      const initPush = async () => {
        try {
          // 1. طلب تصريح الإشعارات من المستخدم
          let permStatus = await PushNotifications.checkPermissions();
          
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive === 'granted') {
            // 2. تسجيل الجهاز في Firebase لجلب التوكن
            await PushNotifications.register();
          }
        } catch (error) {
          console.error("Push Init Error:", error);
        }
      };

      initPush();

      // 3. استلام التوكن وحفظه "محلياً فقط"
      PushNotifications.addListener('registration', (token) => {
        console.log("🚀 FCM Token Generated:", token.value);
        handleTokenLocally(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error("Registration Error: ", error.error);
      });

      // 4. استلام الإشعارات أثناء فتح التطبيق
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log("📩 إشعار جديد مستلم:", notification.title);
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
