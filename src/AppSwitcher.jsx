import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom'; 
import { ClerkProvider } from "@clerk/clerk-react";

// 🛠️ الطريقة الاحترافية: استيراد المكونات بشكل كسول (Lazy Loading) لمنع انهيار الشاشة البيضاء
const App = lazy(() => import('./App'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));

const CLERK_PUBLISHABLE_KEY = "pk_test_Y2xlcmstcmVxLWFwcC0xMi5jbGVyay5hY2NvdW50cy5kZXYk"; 

// واجهة تحميل مؤقتة فخمة وسريعة تظهر أثناء تبديل المكاتب خلف الكواليس
const SkeletonLoader = () => (
  <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center font-sans" dir="rtl">
    <div className="text-center space-y-4">
      <div className="text-3xl font-black text-rose-500 animate-pulse">رقة ✨</div>
      <div className="text-xs text-slate-400">جاري تهيئة المساحة الآمنة...</div>
    </div>
  </div>
);

function AppSwitcher({ onComplete }) {
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
      const CURRENT_VERSION_CODE = 1653; 
      const JSON_URL = "https://raw.githubusercontent.com/zraq301-lgtm/raqqa/main/update.json";
      
      try {
        const response = await fetch(JSON_URL);
        const data = await response.json();
        
        if (data.is_live && data.latest_version_code > CURRENT_VERSION_CODE) {
          const lastIgnored = localStorage.getItem('ignored_version');
          
          if (lastIgnored !== data.latest_version_code.toString()) {
            const confirmUpdate = window.confirm("يوجد تحديث جديد لتطبيق رقة، هل تريد تحميل النسخة المحدثة الآن؟");
            if (confirmUpdate) {
              window.location.href = data.download_url;
            } else {
              localStorage.setItem('ignored_version', data.latest_version_code.toString());
            }
          }
        }
      } catch (err) {
        console.warn("فشل فحص التحديثات:", err);
      }
    };

    // إعداد زر الرجوع في الأندرويد بشكل ديناميكي آمن
    const setupBackButton = async () => {
      if (window && window.Capacitor && window.Capacitor.isNativePlatform()) {
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
          console.error("Capacitor App module not found:", e);
        }
      }
    };

    checkUpdate();
    setupBackButton();
  }, []);

  const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true');
    setIsRegistered(true);
    if (onComplete) onComplete();
  };

  return (
    <div className="switcher-wrapper" style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* غلاف الـ Suspense يمنع الشاشة البيضاء ويظهر الـ Loader لحين جاهزية المكون تماماً */}
      <Suspense fallback={<SkeletonLoader />}>
        {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
      </Suspense>
    </div>
  );
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <AppSwitcher />
      </ClerkProvider>
    </BrowserRouter>
  );
}
