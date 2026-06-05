import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom'; 
import { ClerkProvider } from "@clerk/clerk-react";

const App = lazy(() => import('./App'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));

// 🔐 الحل السحري: نجعل Vite يقرأ مفتاح Clerk التلقائي القادم من الـ Integration مباشرة
const CLERK_PUBLISHABLE_KEY = 
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || // 👈 هذا هو المتغير الذي حقنه Clerk تلقائياً
  window._env_?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
            if (confirmUpdate) window.location.href = data.download_url;
            else localStorage.setItem('ignored_version', data.latest_version_code.toString());
          }
        }
      } catch (err) {
        console.warn("فشل فحص التحديثات:", err);
      }
    };

    const setupBackButton = async () => {
      if (window && window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
          const { App: CapApp } = await import('@capacitor/app');
          CapApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) CapApp.exitApp();
            else window.history.back();
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
      <Suspense fallback={<SkeletonLoader />}>
        {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
      </Suspense>
    </div>
  );
}

export default function RootApp() {
  // شاشة حماية مخصصة تخبرك فوراً إذا كان المتصفح عاجزاً عن قراءة المتغير
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6 text-center font-sans" dir="rtl">
        <div className="p-6 bg-white rounded-2xl shadow-xl max-w-sm border border-rose-100">
          <p className="text-rose-600 font-bold mb-2">⚠️ جاري الربط التلقائي بـ Clerk...</p>
          <p className="text-xs text-slate-500 mb-4">
            إذا استمرت هذه الشاشة، ادخل إعدادات مشروعك في فيرسل (Environment Variables) وقم بنسخ نفس قيمة المتغير وضعه باسم جديد وهو:
          </p>
          <div className="bg-slate-100 p-2 rounded font-mono text-xs text-rose-700 select-all mb-2">
            VITE_CLERK_PUBLISHABLE_KEY
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <AppSwitcher />
      </ClerkProvider>
    </BrowserRouter>
  );
}
