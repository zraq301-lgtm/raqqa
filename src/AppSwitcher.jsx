import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
// ملاحظة: تأكد من استيراد OneSignal و Capacitor في مشروعك
// import OneSignal from 'react-onesignal';
// import { App as CapApp } from '@capacitor/app';

function AppSwitcher() {
  // التحقق من الحالة فوراً عند التشغيل
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('isProfileComplete') === 'true';
  });

  // دالة تهيئة OneSignal وطلب تصريح الإشعارات
  const initOneSignalNotifications = async () => {
    try {
      await OneSignal.init({
        appId: "726fe629-0b1e-4294-9a4b-39cf50212b42",
        allowLocalhostAsSecureOrigin: true,
      });
      
      await OneSignal.Notifications.requestPermission();
      console.log("OneSignal Initialized");
    } catch (error) {
      console.error("OneSignal Error:", error);
    }
  };

  useEffect(() => {
    // استدعاء تهيئة الإشعارات
    initOneSignalNotifications();

    // إدارة زر الرجوع لمنع خروج التطبيق المفاجئ
    const setupBackButton = async () => {
      if (window.Capacitor) {
        const { App: CapApp } = await import('@capacitor/app');
        CapApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapApp.exitApp();
          } else {
            window.history.back();
          }
        });
      }
    };

    setupBackButton();
  }, []);

const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true');
    setIsRegistered(true);
// هذا التغيير سيجعل التطبيق يعرض <App /> فوراً
  };

  return (
    <div className="app-container">
      {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
    </div>
  );
}

export default AppSwitcher;
