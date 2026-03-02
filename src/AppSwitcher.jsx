import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
// استيراد مكتبة Firebase الرسمية لـ Capacitor
import { PushNotifications } from '@capacitor/push-notifications';

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return localStorage.getItem('isProfileComplete') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // دالة تهيئة Firebase وطلب الإذن
    const setupFirebasePush = async () => {
      try {
        // 1. التحقق من صلاحيات الإشعارات الحالية
        let permStatus = await PushNotifications.checkPermissions();

        // 2. إذا لم يتم السؤال من قبل، نطلب الإذن الآن
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        // 3. إذا وافق المستخدم، نقوم بتسجيل الجهاز في Firebase
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
        }

        // 4. الحصول على الـ Token (ستحتاجه لربط Make.com لاحقاً)
        await PushNotifications.addListener('registration', (token) => {
          console.log('Firebase Token:', token.value);
          // يمكنك إرسال التوكن لسيرفرك أو حفظه هنا
        });

        // 5. معالجة الخطأ في حال فشل التسجيل
        await PushNotifications.addListener('registrationError', (error) => {
          console.error('Firebase Registration Error:', error);
        });

      } catch (err) {
        console.error("Firebase Setup Error:", err);
      }
    };

    // تشغيل الإعداد فوراً
    setupFirebasePush();

    // إدارة زر الرجوع
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
  }, []);

  const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true');
    setIsRegistered(true);
  };

  return (
    <div className="switcher-wrapper" style={{ minHeight: '100vh' }}>
      {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
    </div>
  );
}

export default AppSwitcher;
