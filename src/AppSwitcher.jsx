import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom'; 

// استيراد ثابت ومباشر لصفحة الإعداد لضمان عدم حدوث مشاكل مسارات
import ProfileSetup from './pages/ProfileSetup';

// استيراد كسول للتطبيق الرئيسي
const App = lazy(() => import('./App'));

// جلب مفاتيح Supabase الآمنة كحائط صد بديل لـ Clerk
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; 

const SkeletonLoader = () => (
  <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center font-sans" dir="rtl">
    <div className="text-center space-y-4">
      <div className="text-3xl font-black text-rose-500 animate-pulse">رقة ✨</div>
      <div className="text-xs text-slate-400">جاري تهيئة المساحة الآمنة...</div>
    </div>
  </div>
);

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return localStorage.getItem('isProfileComplete') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // إعداد زر الرجوع الخاص بـ Capacitor لحماية بيئة الويب بشكل صارم
    const setupBackButton = () => {
      try {
        if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
          const CapApp = window.Capacitor.Plugins.App;
          CapApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              CapApp.exitApp();
            } else {
              window.history.back();
            }
          });
        }
      } catch (e) {
        console.warn("Capacitor App plugin not available on Web.");
      }
    };

    setupBackButton();
  }, []);

  const handleComplete = () => {
    try {
      localStorage.setItem('isProfileComplete', 'true');
      setIsRegistered(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="switcher-wrapper" style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Suspense fallback={<SkeletonLoader />}>
        {/* بمجرد اكتمال التسجيل يتم توجيه الفتاة تلقائياً للـ App الرئيسي */}
        {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
      </Suspense>
    </div>
  );
}

export default function RootApp() {
  // حائط صد أمني ذكي: إذا لم يجد مفاتيح Supabase، يعرض واجهة إرشادية بدلاً من الانهيار الأبيض
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6 text-center font-sans" dir="rtl">
        <div className="p-6 bg-white rounded-2xl shadow-xl max-w-sm border border-rose-100">
          <p className="text-rose-600 font-bold mb-2">⚠️ نظام الربط بـ Supabase معلق</p>
          <p className="text-xs text-slate-500">
            تأكد من إضافة المتغيرات <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-700 font-mono text-[11px]">VITE_SUPABASE_URL</code> و <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-700 font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> في إعدادات البيئة بـ Vercel ثم أعد البناء (Redeploy).
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppSwitcher />
    </BrowserRouter>
  );
}
