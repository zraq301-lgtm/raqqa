import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return localStorage.getItem('isProfileComplete') === 'true';
    } catch (e) {
      return false; // ضمان عدم توقف التطبيق إذا فشل الوصول لـ localStorage
    }
  });

  useEffect(() => {
    // تعريف الدالة بالداخل لضمان الوصول إليها
    const initNotifications = () => {
      try {
        const OneSignal = window.OneSignal;
        if (OneSignal && typeof OneSignal.setAppId === 'function') {
          OneSignal.setAppId("726fe629-0b1e-4294-9a4b-39cf50212b42");
          OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
            console.log("Notification Permission:", accepted);
          });
        }
      } catch (err) {
        console.error("OneSignal Error:", err);
      }
    };

    // إضافة المستمع
    document.addEventListener("deviceready", initNotifications, false);

    // إدارة زر الرجوع - معالجة الـ Promise لضمان عدم تعليق الشاشة
    const setupBackButton = async () => {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
          const { App: CapApp } = await import('@capacitor/app');
          await CapApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              CapApp.exitApp();
            } else {
              window.history.back();
            }
          });
        } catch (e) {
          console.error("Capacitor BackButton Error:", e);
        }
      }
    };

    setupBackButton();

    return () => {
      document.removeEventListener("deviceready", initNotifications);
    };
  }, []);

  const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true');
    setIsRegistered(true);
  };

  // إضافة تغليف بسيط (Container) لضمان وجود DOM جاهز للرندرة
  return (
    <div className="switcher-wrapper" style={{ minHeight: '100vh' }}>
      {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
    </div>
  );
}

export default AppSwitcher;
