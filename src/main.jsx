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
    // التعديل الجديد: منع الإرسال إذا كان التوكن فارغاً (لتجنب خطأ 400)
    if (!tokenValue) {
      console.log("التوكن غير متوفر بعد، تم إلغاء الإرسال التلقائي.");
      return;
    }

    try {
      // حفظ التوكن في الذاكرة المحلية فوراً
      localStorage.setItem('fcm_token', tokenValue);
      
      const uId = localStorage.getItem('user_id') || 'user_' + Math.floor(Math.random() * 1000000);
      if (!localStorage.getItem('user_id')) localStorage.setItem('user_id', uId);

      // إرسال البيانات إلى Vercel API
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications', 
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: tokenValue, // الاسم المتوافق مع الباك اند الجديد
          user_id: uId,
          username: localStorage.getItem('username') || 'زائرة رقة',
          category: 'تسجيل تلقائي عند الفتح',
          note: 'تم استلام التوكن بنجاح بعد منح الصلاحية'
        }
      });
      console.log("استجابة السيرفر:", response.data);
    } catch (err) {
      console.error("فشل إرسال البيانات للباك اند:", err);
    }
  };

  useEffect(() => {
    // تشغيل المنطق فقط على منصات الهواتف (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      
      const initPush = async () => {
        try {
          let permStatus = await PushNotifications.checkPermissions();
          
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive === 'granted') {
            // التسجيل لجلب التوكن من Firebase
            await PushNotifications.register();
          }
        } catch (error) {
          console.error("خطأ في تهيئة الإشعارات:", error);
        }
      };

      initPush();

      // مستمع استلام التوكن (يعمل فور نجاح التسجيل)
      PushNotifications.addListener('registration', (token) => {
        const fcmToken = token.value;
        console.log("FCM Token Generated:", fcmToken);
        
        // استدعاء دالة الحفظ مع التوكن المستلم
        saveTokenToServer(fcmToken);
      });

      // مستمع أخطاء التسجيل
      PushNotifications.addListener('registrationError', (error) => {
        console.error("خطأ في تسجيل التوكن: ", error.error);
      });

      // معالجة استلام الإشعار والتطبيق مفتوح
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        // يمكنك استبدال alert بـ Toast أو Notification UI مخصص
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
