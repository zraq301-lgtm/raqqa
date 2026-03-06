import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';
import { initializeApp, getApps, getApp } from "firebase/app";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

/**
 * إعدادات Firebase
 */
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
          // استدعاء المكتبة
          const OneSignal = (await import('onesignal-cordova-plugin')).default;
          
          // إعدادات لوحة تحكم OneSignal
          OneSignal.setAppId("cd7a8168-5e86-4fa8-a32d-58791213b25a");

          // خطوة هامة لربط الواجهة بالمحرك
          OneSignal.initWithContext(window);

          // طلب الإذن وإظهار الرسالة للمستخدم
          OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
            console.log("OneSignal Permission Status: " + accepted);
          });

          // تعيين معرف المستخدم الخارجي لسهولة التتبع
          const userId = localStorage.getItem('user_id') || 'raqqa_user_' + Math.floor(Math.random() * 1000);
          OneSignal.setExternalUserId(userId);

          // مستمع لإشعارات OneSignal
          OneSignal.setNotificationWillShowInForegroundHandler((event) => {
            let notification = event.getNotification();
            event.complete(notification);
          });

        } catch (e) {
          console.error("OneSignal Setup Error:", e);
        }
      };
      
      setupOneSignal();

      // إعداد Capacitor Push Notifications التقليدي (للفايربيس)
      const setupPush = async () => {
        try {
          await PushNotifications.createChannel({
            id: 'fcm_default_channel',
            name: 'Default',
            importance: 5,
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
          console.error("Push Setup Error: ", error);
        }
      };

      setupPush();

      // إرسال التوكن لسيرفر Vercel الخاص بك
      PushNotifications.addListener('registration', async (token) => {
        localStorage.setItem('fcm_token', token.value);
        try {
          await CapacitorHttp.post({
            url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
            headers: { 'Content-Type': 'application/json' },
            data: {
              fcm_token: token.value,
              user_id: localStorage.getItem('user_id') || 'new_device_init',
              username: localStorage.getItem('username') || 'مستخدمة رقة',
              category: 'تسجيل تلقائي للجهاز',
              note: 'تم الربط مع OneSignal و Firebase بنجاح'
            }
          });
        } catch (err) {
          console.error("فشل إرسال التوكن:", err);
        }
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
