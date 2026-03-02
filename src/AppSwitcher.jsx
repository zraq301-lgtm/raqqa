import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
// تأكد من أن هذه الأسطر ليست تعليقات
import OneSignal from 'react-onesignal'; 

function AppSwitcher() {
  // التحقق من حالة التسجيل
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
      
      // طلب الإذن الذي سيظهر النافذة للمستخدم
      await OneSignal.Notifications.requestPermission();
      console.log("OneSignal Initialized and Permission Requested");
    } catch (error) {
      console.error("OneSignal Error:", error);
    }
  };

  useEffect(() => {
    // استدعاء تهيئة الإشعارات فور فتح التطبيق
    initOneSignalNotifications();

    // إدارة زر الرجوع
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
  };

  return (
    <div className="app-container">
      {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
    </div>
  );
}

export default AppSwitcher;
