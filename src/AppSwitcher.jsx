import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';

// استيراد Firebase Messaging بطريقة آمنة
import { initializeApp, getApps } from "firebase/app";
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

// تهيئة Firebase بشكل آمن لضمان عدم التكرار
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return localStorage.getItem('isProfileComplete') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // --- وظيفة فحص التحديثات الجديدة ---
    const checkUpdate = async () => {
      const CURRENT_VERSION_CODE = 1653; // إصدارك الحالي الثابت
      const JSON_URL = "https://raw.githubusercontent.com/zraq301-lgtm/raqqa/main/update.json";
      
      try {
        const response = await fetch(JSON_URL);
        const data = await response.json();
        
        // لا يظهر التحديث إلا إذا كانت الحالة live والنسخة أحدث من نسخة المستخدم
        if (data.is_live && data.latest_version_code > CURRENT_VERSION_CODE) {
          
          // فحص هل قام المستخدم بتجاهل هذه النسخة المحددة من قبل
          const lastIgnored = localStorage.getItem('ignored_version');
          
          if (lastIgnored !== data.latest_version_code.toString()) {
            const confirmUpdate = window.confirm("يوجد تحديث جديد لتطبيق رقة، هل تريد تحميل النسخة المحدثة الآن؟");
            if (confirmUpdate) {
              window.location.href = data.download_url;
            } else {
              // حفظ رقم النسخة التي تم تجاهلها لعدم إظهار الرسالة مرة أخرى
              localStorage.setItem('ignored_version', data.latest_version_code.toString());
            }
          }
        }
      } catch (err) {
        console.warn("فشل فحص التحديثات:", err);
      }
    };

    // وظيفة إعداد الإشعارات - معزولة لمنع انهيار الواجهة
    const setupWebPush = async () => {
      try {
        // التحقق من دعم المتصفح قبل فعل أي شيء
        if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window)) {
          console.warn("إشعارات الويب غير مدعومة في هذه البيئة.");
          return;
        }

        const messaging = getMessaging(firebaseApp);
        
        // طلب الإذن
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, { 
            vapidKey: "USA0sr7ibILdXx1IdNyUIZGNAZxosK9trp5z96f45Nk" 
          });

          if (currentToken) {
            console.log('FCM Token Ready:', currentToken);
            
            // تحديث التوكن في نيون
            const userId = localStorage.getItem('userId');
            if (userId) {
              await fetch('/api/update-fcm-token', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, fcmToken: currentToken }),
              }).catch(e => console.error("Database update failed:", e));
            }
          }
        }

        // الاستماع للإشعارات والتطبيق مفتوح
        onMessage(messaging, (payload) => {
          console.log('إشعار جديد أثناء التشغيل:', payload);
        });

      } catch (err) {
        console.error("فشل إعداد Firebase Messaging ولكن سيستمر التطبيق بالعمل:", err);
      }
    };

    // إعداد زر الرجوع في الأندرويد بشكل ديناميكي آمن
    const setupBackButton = async () => {
      // التحقق من وجود Capacitor في النافذة ومن أنه هاتف أندرويد/آيفون
      if (window && window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
          // استيراد الموديول برمجياً فقط عند الحاجة
          const { App: CapApp } = await import('@capacitor/app');
          CapApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              CapApp.exitApp();
            } else {
              window.history.back();
            }
          });
        } catch (e) {
          console.error("Capacitor App module not found:", e);
        }
      }
    };

    checkUpdate(); // تشغيل فحص التحديث
    setupWebPush();
    setupBackButton();
  }, []);

  const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true');
    setIsRegistered(true);
  };

  return (
    <div className="switcher-wrapper" style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
    </div>
  );
}

export default AppSwitcher;
