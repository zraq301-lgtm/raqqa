import React, { useState, useEffect, Suspense, lazy, Component } from 'react';
import { BrowserRouter } from 'react-router-dom'; 

// استيراد ثابت لضمان سرعة ظهور مكون التثبيت الأولي
import ProfileSetup from './pages/ProfileSetup';

// استيراد كسول محمي مع آلية إعادة المحاولة التلقائية في حال فشل الشبكة
const App = lazy(() => {
  return Promise.all([
    import('./App'),
    new Promise((resolve) => setTimeout(resolve, 300)) // مهلة استقرار ميكروية لمنع فلاش الشاشة
  ])
  .then(([module]) => module)
  .catch((err) => {
    console.error("خطأ حرج في تحميل ملف التطبيق الرئيسي، جاري إعادة المحاولة:", err);
    window.location.reload(); // إنقاذ التطبيق بدلاً من تركه على شاشة بيضاء
  });
});

// مكوّن جدار حماية الأخطاء (Error Boundary) لمنع انهيار الـ React Tree بالكامل
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("💥 جدار الحماية التقط خطأ كودياً:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6 text-center font-sans" dir="rtl">
          <div className="p-6 bg-white rounded-2xl shadow-xl max-w-sm border border-rose-100">
            <p className="text-rose-600 font-bold mb-2">⚠️ حدث خطأ غير متوقع في الواجهة</p>
            <p className="text-xs text-slate-500 mb-4">جاري استعادة توازن التطبيق تلقائياً.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-600 transition-colors">
              إعادة تحميل الواجهة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// لودر الهيكل الأنيق المطور (Skeleton Loader)
const SkeletonLoader = () => (
  <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center font-sans" dir="rtl">
    <div className="text-center space-y-4">
      <div className="text-3xl font-black text-rose-500 animate-pulse tracking-wide">رقة ✨</div>
      <div className="text-xs text-slate-400 font-medium">جاري تهيئة المساحة الآمنة...</div>
    </div>
  </div>
);

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return localStorage.getItem('isProfileComplete') === 'true';
    } catch (e) {
      console.error("فشل قراءة حالة التسجيل من الكاش المحلي:", e);
      return false;
    }
  });

  useEffect(() => {
    // معالجة زر الرجوع الفيزيائي الخاص بـ Capacitor بشكل معزول وآمن
    const setupBackButton = async () => {
      try {
        const nativeApp = window?.Capacitor?.Plugins?.App;
        if (nativeApp) {
          await nativeApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              nativeApp.exitApp();
            } else {
              window.history.back();
            }
          });
        }
      } catch (e) {
        console.warn("بيئة التشغيل الحالية ويب (لم يتم رصد حزم Capacitor).");
      }
    };

    setupBackButton();
  }, []);

  const handleComplete = () => {
    try {
      localStorage.setItem('isProfileComplete', 'true');
      setIsRegistered(true);
    } catch (e) {
      console.error("فشل حفظ حالة التسجيل:", e);
    }
  };

  return (
    <div className="switcher-wrapper w-full min-h-screen bg-white">
      <Suspense fallback={<SkeletonLoader />}>
        {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
      </Suspense>
    </div>
  );
}

export default function RootApp() {
  // تم إلغاء جدار الحظر والمنع الصارم هنا لفتح شاشة التسجيل مباشرة دون قيود 🚀
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppSwitcher />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
