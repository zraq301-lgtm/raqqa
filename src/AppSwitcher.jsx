import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom'; 
import { ClerkProvider } from "@clerk/clerk-react";

// استيراد المكونات بشكل كسول
const App = lazy(() => import('./App'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));

const CLERK_PUBLISHABLE_KEY = "pk_test_Y2xlcmstcmVxLWFwcC0xMi5jbGVyay5hY2NvdW50cy5kZXYk"; 

// --- مصيدة الأخطاء العالمية (لتظهر لك سبب الشاشة البيضاء على الهاتف) ---
function ErrorVisualizer({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");

  useEffect(() => {
    // دالة لالتقاط أي خطأ يحدث في الجافاسكريبت فجأة
    const handleGlobalError = (event) => {
      setHasError(true);
      setErrorDetails(event.message + " في ملف: " + (event.filename || "").split('/').pop() + " سطر: " + event.lineno);
    };

    window.addEventListener("error", handleGlobalError);
    return () => window.removeEventListener("error", handleGlobalError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-mono" dir="rtl">
        <div className="w-full max-w-md bg-red-950/80 border-2 border-red-500 rounded-3xl p-6 shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">🚨 تم اصطياد الخطأ القاتل!</h1>
          <p className="text-sm text-slate-300 mb-6 font-sans">هذا السطر أدناه هو السبب الحقيقي وراء الشاشة البيضاء في Vercel:</p>
          <div className="bg-black/60 p-4 rounded-xl text-right text-xs text-red-300 border border-red-900/50 break-all select-all overflow-x-auto">
            {errorDetails || "خطأ صامت في الـ Rendering"}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition"
          >
            تحديث الصفحة 🔄
          </button>
        </div>
      </div>
    );
  }

  return children;
}

// واجهة تحميل مؤقتة فخمة
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
  return (
    <ErrorVisualizer> {/* 👈 يراقب ويصطاد أي انهيار ويظهره على الشاشة فوراً */}
      <BrowserRouter>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <AppSwitcher />
        </ClerkProvider>
      </BrowserRouter>
    </ErrorVisualizer>
  );
}
