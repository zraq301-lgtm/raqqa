import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
// تأكد من استيراد OneSignal و Capacitor هنا
// import OneSignal from 'onesignal-node'; 
// import { App as CapApp } from '@capacitor/app';

 function AppSwitcher() {
  // التحقق من الحالة فوراً عند التشغيل [cite: 2]
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('isProfileComplete') === 'true'; [cite: 2]
  });

  // دالة تهيئة OneSignal وطلب تصريح الإشعارات
  const initOneSignalNotifications = async () => {
    try {
      await OneSignal.init({
        appId: "726fe629-0b1e-4294-9a4b-39cf50212b42", // المعرف الخاص بك 
        allowLocalhostAsSecureOrigin: true, // للسماح بالتجربة المحلية 
      });
      
      // طلب تصريح الإشعارات من المستخدم فوراً
      await OneSignal.Notifications.requestPermission();
      
      console.log("OneSignal Initialized and Permission Requested");
    } catch (error) {
      console.error("OneSignal Error:", error);
    }
  };

  useEffect(() => {
    // استدعاء دالة الإشعارات التي كتبناها أعلاه
    const setup = async () => {
       await initOneSignalNotifications();
    };
    
    setup();

    // كود إدارة زر الرجوع الأصلي
    const backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) { 
        CapApp.exitApp(); 
      } else { 
        window.history.back(); 
      }
    });

    return () => {
      backButtonListener.remove();
    };
  }, []);

 const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true'); [cite: 3]
    setIsRegistered(true); [cite: 3]
 // هذا التغيير سيجعل التطبيق يعرض <App /> فوراً
  };

  return (
    <div className="app-container">
       {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />} [cite: 4]
    </div>
  );
 }

export default AppSwitcher;
