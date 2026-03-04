import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';
import { initializeApp, getApps, getApp } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

/**
 * إعدادات Firebase لمشروع raqqa-43dc8
 */
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
} else {
  getApp();
}

const Main = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const setupPush = async () => {
        try {
          // 1. إنشاء قناة الإشعارات (مهم جداً لأندرويد)
          await PushNotifications.createChannel({
            id: 'fcm_default_channel',
            name: 'Default',
            description: 'قناة الإشعارات العامة لتطبيق رقة',
            importance: 5, // أعلى درجة للأهمية لظهور الإشعار فوراً
            visibility: 1,
            sound: 'default',
            vibration: true
          });

          let permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }
          if (permStatus.receive === 'granted') {
            await PushNotifications.register();
          }
        } catch (error) {
          console.error("خطأ أثناء إعداد الإشعارات: ", error);
        }
      };

      setupPush();

      // 2. الاستماع للتوكن والتسجيل في السيرفر
      PushNotifications.addListener('registration', async (token) => {
        localStorage.setItem('fcm_token', token.value);
        try {
          await CapacitorHttp.post({
            url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
            headers: { 'Content-Type': 'application/json' },
            data: {
              fcm_token: token.value,
              user_id: localStorage.getItem('user_id') || 'new_device_init',
              username: 'جهاز مسجل حديثاً',
              category: 'تسجيل تلقائي للجهاز',
              note: 'تم تفعيل مستمعات الإشعارات بنجاح'
            }
          });
        } catch (err) {
          console.error("فشل إرسال التوكن المبدئي:", err);
        }
      });

      // 3. دالة سماع الإشعار عند وصوله والتطبيق مفتوح (Foreground)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('وصل إشعار جديد:', notification);
        // يمكنك هنا إظهار نافذة منبثقة داخل التطبيق إذا أردت
        alert(`${notification.title}\n\n${notification.body}`);
      });

      // 4. دالة سماع الإشعار عند الضغط عليه (Action Performed)
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('تم الضغط على الإشعار:', notification.notification);
        // يمكنك هنا توجيه المستخدم لصفحة معينة
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Registration error: ', error);
      });
    }
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <AppSwitcher />
      </BrowserRouter>
    </React.StrictMode>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Main />);
}
