import React, { Component } from 'react';

// استيراد الواجهة المراد عرضها فوراً
import ProfileSetup from './pages/ProfileSetup';

// جدار حماية بسيط ومطور لعرض الخطأ الفعلي إن حدث داخل ProfileSetup نفسها
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { 
    // طباعة الخطأ الفعلي في الكونسول لمعرفة الملف المكسور بدقة
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

// قمنا بتغيير اسم الدالة ليتوافق تماماً مع الاستدعاء في الملف الرئيسي المتصل بـ SplashScreen
export default function AppSwitcher() {
  return (
    <ErrorBoundary>
      {/* تم حذف الـ BrowserRouter من هنا لمنع تداخل الراوتر الذي يسبب الشاشة البيضاء */}
      <div className="w-full min-h-screen bg-white">
        <ProfileSetup onComplete={() => console.log('التسجيل وهمي تجريبي')} />
      </div>
    </ErrorBoundary>
  );
}
