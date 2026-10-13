import React, { Component, useState, useEffect } from 'react';

// 2. استيراد التطبيق الرئيسي الفعلي لـ "رقة" من الـ src
import App from './App'; 

// 3. استيراد الخدمة الجديدة لالتقاط الإشعارات المجدولة من الأندرويد وضخها في نيون 📡
import { initializeNotificationsSyncListener } from './services/PendingNotificationsSync';

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
  // لا توجد بوابة تسجيل: يُفتح التطبيق مباشرة بمعرف محلي مجهول.
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 🔒 خطوة الأمان والمزامنة التلقائية الشاملة لبيانات الموبايل
  useEffect(() => {
    // 🔥 تفعيل مستمع المزامنة المستقل لالتقاط الإشعارات المجدولة (Pending) من نظام الهاتف
    initializeNotificationsSyncListener();

    let savedId = localStorage.getItem('user_id');
    if (!savedId) {
      savedId = `guest_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
      localStorage.setItem('user_id', savedId);
    }
    setUser({ id: savedId, anonymous: true });

    // إنهاء حالة الفحص فوراً والدخول للتطبيق
    setLoadingAuth(false);
  }, []);

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
        {user && <App user={user} />}
      </div>
    </ErrorBoundary>
  );
}
