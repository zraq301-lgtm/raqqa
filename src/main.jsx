import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';
import { initializeApp, getApps } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKjsgnoHnGGr3urhm6Kpu7RvxN2dp6sJQ",
  authDomain: "raqqa-43dc8.firebaseapp.com",
  projectId: "raqqa-43dc8",
  storageBucket: "raqqa-43dc8.firebasestorage.app",
  messagingSenderId: "162488255991",
  appId: "1:162488255991:android:73d6299f11a1b7aec61af2"
};

// تهيئة Firebase بأمان
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const Main = () => {
  
  // وظيفة الحفظ وإرسال التوكن للباك اند (Vercel)
  const saveTokenToServer = async (tokenValue) => {
    try {
      // حفظ التوكن في الذاكرة المحلية فوراً لاستخدامه لاحقاً في أي عملية إرسال
      localStorage.setItem('fcm_token', tokenValue);
      
      const uId = localStorage.getItem('user_id') || 'user_' + Math.floor(Math.random() * 1000000);
      if (!localStorage.getItem('user_id')) localStorage.setItem('user_id', uId);

      // إرسال البيانات إلى Vercel API الجديد
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications', 
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: tokenValue, // تغيير الاسم ليتوافق مع متغير الباك اند الجديد
          user_id: uId,
          username: localStorage.getItem('username') || 'مستخدمة رقة',
          category: 'تسجيل تلقائي',
          note: 'تم حفظ التوكن محلياً وإرساله للباك اند بنجاح'
        }
      });
      console.log("تم تحديث البيانات في السيرفر:", response.data);
    } catch (err) {
      console.error("فشل إرسال البيانات للباك اند:", err);
    }
  };

  useEffect(() => {
    // تشغيل المنطق فقط على الهاتف
    if (Capacitor.isNativePlatform()) {
      
      const initPush = async () => {
        try {
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

      initPush();

      // مستمع استلام التوكن
      PushNotifications.addListener('registration', (token) => {
        const fcmToken = token.value;
        console.log("FCM Token Generated:", fcmToken);
        
        // تنفيذ دالة الحفظ التلقائي
        saveTokenToServer(fcmToken);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error("Error on registration: ", error.error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        alert(`${notification.title}\n${notification.body}`);
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
