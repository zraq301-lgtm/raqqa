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

// تهيئة Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const Main = () => {
  useEffect(() => {
    // العمل فقط إذا كان التطبيق يعمل كـ Native (أندرويد/iOS)
    if (Capacitor.isNativePlatform()) {
      
      const setupPush = async () => {
        try {
          // 1. التحقق من صلاحيات الإشعارات
          let permStatus = await PushNotifications.checkPermissions();
          
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive === 'granted') {
            // 2. تسجيل الجهاز للحصول على التوكن
            await PushNotifications.register();
          } else {
            console.error("لم يتم منح صلاحية الإشعارات");
          }
        } catch (error) { 
          console.error("خطأ في تهيئة الإشعارات: ", error); 
        }
      };

      // تنفيذ عملية التهيئة
      setupPush();

      // 3. مستمع تسجيل التوكن (Registration)
      PushNotifications.addListener('registration', async (token) => {
        const fcmToken = token.value;
        console.log("تم توليد توكن FCM بنجاح:", fcmToken);
        
        // حفظ التوكن محلياً لاستخدامه في أي صفحة أخرى (مثل صفحة الوزن والطول)
        localStorage.setItem('fcm_token', fcmToken);

        // إنشاء user_id إذا لم يكن موجوداً
        if (!localStorage.getItem('user_id')) {
            localStorage.setItem('user_id', 'user_' + Math.floor(Math.random() * 1000000));
        }
        
        try {
          // إرسال التوكن مباشرة للـ API لضمان ربطه بالمستخدم فوراً
          const response = await CapacitorHttp.post({
            url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
            headers: { 'Content-Type': 'application/json' },
            data: {
              fcm_token: fcmToken,
              user_id: localStorage.getItem('user_id'),
              username: localStorage.getItem('username') || 'مستخدمة جديدة',
              category: 'تسجيل جهاز أول مرة',
              note: 'تم حفظ التوكن محلياً وإرساله للسيرفر'
            }
          });
          console.log("تم ربط الجهاز بالسيرفر:", response.data);
        } catch (err) { 
          console.error("فشل إرسال التوكن للسيرفر:", err); 
        }
      });

      // 4. مستمع الخطأ في التسجيل
      PushNotifications.addListener('registrationError', (error) => {
        console.error("خطأ في تسجيل التوكن: ", error.error);
      });

      // 5. التعامل مع الإشعار عند وصوله والتطبيق مفتوح
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        alert(`إشعار جديد: ${notification.title}\n${notification.body}`);
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
