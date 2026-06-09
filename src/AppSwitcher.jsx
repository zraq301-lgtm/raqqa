import React, { Component, useState, useEffect } from 'react';

// 1. استيراد واجهة التسجيل (الملف الحالي)
import ProfileSetup from './pages/ProfileSetup';

// 2. استيراد التطبيق الرئيسي الفعلي لـ "رقة" من الـ src
import App from './App'; 

// جدار حماية بسيط ومطور لعرض الخطأ الفعلي إن حدث
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { 
    console.error("💥 الخطأ الحقيقي المسبب للمشكلة هو:", error, errorInfo); 
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6 text-center font-sans" dir="rtl">
          <div className="p-6 bg-white rounded-2xl shadow-xl max-w-md border border-rose-100">
            <p className="text-rose-600 font-bold mb-2">⚠️ حدث خطأ داخلي أثناء تشغيل واجهة التسجيل</p>
            <p className="text-xs text-left overflow-auto max-h-40 bg-slate-50 p-3 rounded-lg text-slate-600 font-mono mb-4 border border-slate-100">
              {this.state.error?.toString()}
            </p>
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

export default function AppSwitcher() {
  // إضافة State لمعرفة هل تم تسجيل الدخول بنجاح وحفظ بيانات المستخدم
  const [user, setUser] = useState(null);
  // حالة مؤقتة لمنع وميض الشاشة أثناء قراءة الذاكرة التخزينية للهاتف
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 🔒 خطوة الأمان: فحص الـ LocalStorage فور فتح التطبيق للتأكد من الجلسة الحية
  useEffect(() => {
    const isProfileComplete = localStorage.getItem('isProfileComplete');
    const savedEmail = localStorage.getItem('user_email');
    const savedId = localStorage.getItem('user_id');

    if (isProfileComplete === 'true' && savedEmail) {
      // إذا تم العثور على البيانات، نقوم بتسجيل دخول البنت تلقائياً بدون عرض صفحة الكروت
      setUser({ email: savedEmail, id: savedId });
    }

    // إنهاء حالة الفحص فوراً والدخول للتطبيق
    setLoadingAuth(false);
  }, []);

  // دالة تُستدعى فور نجاح التسجيل في واجهة ProfileSetup
  const handleRegistrationComplete = (userData) => {
    console.log("✨ نجح التسجيل! بيانات المستخدمة جاهزة ونقلناها لـ App:", userData);
    setUser(userData); // حفظ المستخدم في الـ State ليتم الانتقال فوراً لملف App.jsx
  };

  // شاشة انتظار رقيقة جداً لكسر الأجزاء من الثانية أثناء فحص الذاكرة المحفوظة بالهاتف
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#fff9fb] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full min-h-screen bg-white">
        {/* الشرط الحقيقي والنظيف: إذا وجد المستخدم اعرض الـ App الرئيسي، وإلا اعرض صفحة التسجيل */}
        {user ? (
          
          // هنا نقوم باستدعاء التطبيق الرئيسي الفعلي كاملاً وتمرير بيانات المستخدم له كـ props إذا احتجتها
          <App user={user} />
          
        ) : (
          <ProfileSetup onComplete={handleRegistrationComplete} />
        )}
      </div>
    </ErrorBoundary>
  );
}
