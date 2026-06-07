import React, { useState } from 'react';
// استدعاء الدوال المعزولة والآمنة من ملف الخدمات
import { registerToSupabase, loginWithFacebook } from '../services/authService';

const ProfileSetup = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. معالجة التسجيل اليدوي
  const handleManualRegister = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      setMessage({ type: 'error', text: 'جميلتي، يرجى ملء جميع الحقول أولاً 💕' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    // استدعاء الدالة المعزولة
    const result = await registerToSupabase(email, password, fullName);

    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: 'تم إنشاء حسابكِ بنجاح! تفحصي بريدكِ الإلكتروني لتأكيده والانطلاق معنا ✨' 
      });

      // حفظ البيانات محلياً كإجراء أمان وسرعة استجابة
      localStorage.setItem('user_email', email.trim());
      localStorage.setItem('isProfileComplete', 'true');

      // الانتقال للواجهة الرئيسية بعد مهلة قصيرة ليرى المستخدم رسالة النجاح
      if (onComplete && result.user) {
         setTimeout(() => onComplete(result.user), 2500);
      }
    } else {
      // عرض الخطأ الراجع من السيرفر بدون كراش للواجهة
      setMessage({ type: 'error', text: result.error || 'حدث خطأ ما، أعيدي المحاولة.' });
    }
    setLoading(false);
  };

  // 2. معالجة التسجيل بـ Facebook
  const handleFacebookLogin = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    // استدعاء الدالة المعزولة
    const result = await loginWithFacebook();

    if (!result.success) {
      setMessage({ type: 'error', text: result.error || 'تعذر الاتصال بفيسبوك حالياً، حاولي مرة أخرى.' });
    }
    // في حالة النجاح، يتولى الـ Redirect التوجيه التلقائي
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF0F5] via-[#F3E5F5] to-[#E8F5E9] flex flex-col justify-center items-center p-6 font-sans" dir="rtl">
      
      {/* الكارد الرئيسي الأنيق */}
      <div className="w-full max-w-md bg-white/85 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(244,143,177,0.12)] border border-pink-100/50 flex flex-col">
        
        {/* الهيدر الترحيبي */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full text-white text-3xl shadow-md mb-3 animate-bounce duration-1000">
            🌸
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            أهلاً بكِ في رقة
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            مساحتكِ الآمنة لترتيب يومكِ والاعتناء بذاتكِ
          </p>
        </div>

        {/* صندوق رسائل التنبيه والخطأ الذكي */}
        {message.text && (
          <div className={`mb-5 p-4 rounded-2xl text-sm font-medium text-center border transition-all duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-rose-50 text-rose-500 border-rose-100'
          }`}>
            {message.text}
          </div>
        )}

        {/* فورمة الإدخال */}
        <form onSubmit={handleManualRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mr-2 mb-1 text-right">الاسم الكامل</label>
            <input
              type="text"
              placeholder="جميلتي، ما هو اسمكِ؟"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100/60 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all duration-200 text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mr-2 mb-1 text-right">البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100/60 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all duration-200 text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mr-2 mb-1 text-right">كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100/60 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all duration-200 text-left"
            />
          </div>

          {/* زر التثبيت والتسجيل اليدوي */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-2xl shadow-lg hover:from-pink-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-200 mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري تهيئة مساحتكِ...
              </span>
            ) : (
              'ابدئي رحلتكِ الجميلة الآن ✨'
            )}
          </button>
        </form>

        {/* خط فاصل للتصميم الأنيق */}
        <div className="relative flex py-5 items-center my-2">
          <div className="flex-grow border-t border-pink-100/50"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-normal">أو من خلال</span>
          <div className="flex-grow border-t border-pink-100/50"></div>
        </div>

        {/* زر فيسبوك المنفصل والمحمي */}
        <button
          type="button"
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-[#1877F2] text-white font-medium rounded-2xl shadow-md hover:bg-[#166FE5] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-sm">التسجيل السريع باستخدام فيسبوك</span>
        </button>

      </div>
    </div>
  );
};

export default ProfileSetup;
