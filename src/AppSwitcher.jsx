import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';

function AppSwitcher() {
  // التحقق من حالة التسجيل
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('isProfileComplete') === 'true';
  });

  // دالة تهيئة OneSignal وطلب الإذن (Native)
  const initNotifications = () => {
    // التحقق من وجود إضافة OneSignal في نافذة المتصفح/التطبيق
    const OneSignal = window.OneSignal;

    if (OneSignal) {
      // إعداد معرف التطبيق
      OneSignal.setAppId("726fe629-0b1e-4294-9a4b-39cf50212b42");

      // طلب الإذن الصريح الذي يظهر نافذة النظام (Native Popup)
      OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
        console.log("User responded to notifications:", accepted);
      });

      console.log("OneSignal Native Initialized successfully");
    } else {
      console.warn("OneSignal Native Plugin not found yet...");
    }
  };

  useEffect(() => {
    // انتظر حتى يتم تحميل إضافات Capacitor/Cordova بالكامل
    const onDeviceReady = () => {
      initNotifications();
    };

    document.addEventListener("deviceready", onDeviceReady, false);

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

    // تنظيف المستمع عند مسح المكون
    return () => {
      document.removeEventListener("deviceready", onDeviceReady);
    };
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
