import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';
// استيراد دالات Firebase Web SDK الجديدة
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

// تهيئة Firebase والـ Messaging
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return localStorage.getItem('isProfileComplete') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // 2. دالة طلب الإذن وجلب التوكن وإرساله لـ Neon/Make
    const setupWebPush = async () => {
      try {
        // طلب إذن المتصفح للإشعارات
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // جلب التوكن الحقيقي باستخدام مفتاح VAPID الخاص بك
          const currentToken = await getToken(messaging, { 
            vapidKey: "USA0sr7ibILdXx1IdNyUIZGNAZxosK9trp5z96f45Nk" 
          });

          if (currentToken) {
            console.log('Firebase Web Token:', currentToken);
            
            // --- إرسال التوكن للباك إند (Vercel/Neon) لإنهاء مشكلة الـ NULL ---
            try {
              // استبدل الرابط أدناه برابط الـ API الفعلي الخاص بك على Vercel
              await fetch('/api/update-fcm-token', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: localStorage.getItem('userId'),
                  fcmToken: currentToken
                }),
              });
              console.log('Token updated in Neon successfully');
            } catch (fetchError) {
              console.error("Error sending token to Backend:", fetchError);
            }
          }
        }
      } catch (err) {
        console.error("Web Push Setup Error:", err);
      }
    };

    setupWebPush();

    // الاستماع للإشعارات في حال كان التطبيق مفتوحاً
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      // يمكنك هنا إظهار تنبيه داخلي أو تحديث واجهة المستخدم
    });

    // إدارة زر الرجوع (فقط إذا كان التطبيق يعمل كـ Capacitor Native)
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
