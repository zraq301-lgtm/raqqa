import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 1. إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyCT2wRZgzPv1Xg3M41ZhN7-_RGze_HrZkk",
  authDomain: "raqqa-43dc8.firebaseapp.com",
  projectId: "raqqa-43dc8",
  storageBucket: "raqqa-43dc8.firebasestorage.app",
  messagingSenderId: "162488255991",
  appId: "1:162488255991:web:74fe1680fc6cb5bbc61af2"
};

// تهيئة Firebase مع فحص الدعم لتجنب تعليق المتصفحات القديمة
const firebaseApp = initializeApp(firebaseConfig);
let messaging = null;

try {
  // لا يتم تفعيل Messaging إلا إذا كان المتصفح يدعم الـ Service Worker
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    messaging = getMessaging(firebaseApp);
  }
} catch (e) {
  console.error("Firebase Messaging non-compatible browser:", e);
}

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return localStorage.getItem('isProfileComplete') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const setupWebPush = async () => {
      // التأكد من وجود دعم للإشعارات في المتصفح قبل البدء
      if (!("Notification" in window) || !messaging) {
        console.warn("هذا المتصفح لا يدعم إشعارات الويب.");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // جلب التوكن باستخدام مفتاح VAPID الخاص بك
          const currentToken = await getToken(messaging, { 
            vapidKey: "USA0sr7ibILdXx1IdNyUIZGNAZxosK9trp5z96f45Nk" 
          }).catch(err => {
            console.error("فشل في استخراج التوكن (VAPID Error):", err);
            return null;
          });

          if (currentToken) {
            console.log('FCM Token Ready:', currentToken);
            
            // محاولة تحديث التوكن في الباك إند
            try {
              const response = await fetch('/api/update-fcm-token', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: localStorage.getItem('userId'),
                  fcmToken: currentToken
                }),
              });

              if (!response.ok) throw new Error("Server response not OK");
              console.log('تم تحديث التوكن في قاعدة البيانات بنجاح');
            } catch (fetchError) {
              console.error("فشل إرسال التوكن للباك إند:", fetchError);
            }
          }
        }
      } catch (err) {
        console.error("خطأ عام في إعدادات الإشعارات:", err);
      }
    };

    setupWebPush();

    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('إشعار جديد في الواجهة:', payload);
      });
    }

    const setupBackButton = async () => {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
          const { App: CapApp } = await import('@capacitor/app');
          CapApp.addListener('backButton', ({ canGoBack }) => {
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
