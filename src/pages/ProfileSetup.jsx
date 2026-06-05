import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// تأكدنا أن الاسم ProfileSetup ليتوافق مع الـ AppSwitcher
const ProfileSetup = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. التسجيل اليدوي (إيميل وباسورد)
  const handleManualRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setMessage({ type: 'error', text: 'جميلتي، يرجى ملء جميع الحقول أولاً 💕' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      // نجاح التسجيل
      setMessage({ 
        type: 'success', 
        text: 'تم إنشاء حسابك بنجاح! تفحصي بريدك الإلكتروني لتأكيده ✨' 
      });

      // إبلاغ التطبيق الرئيسي بنجاح الخطوة (اختياري حسب منطق الـ Redirect عندك)
      if (onComplete) {
         // تأخير بسيط لكي ترى المستخدمة رسالة النجاح
         setTimeout(() => onComplete(data.user), 2000);
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ ما، أعيدي المحاولة يا جميلة.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. التسجيل السريع عبر فيسبوك
  const handleFacebookLogin = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error) {
      setMessage({ type: 'error', text: 'تعذر الاتصال بفيسبوك، حاولي مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF0F5] via-[#F3E5F5] to-[#E8F5E9] flex flex-col justify-center items-center p-6 font-sans" dir="rtl">
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(244,143,177,0.15)] border border-pink-100/50 flex flex-col">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full text-white text-3xl shadow-md mb-3 animate-pulse">
            🌸
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            أهلاً بكِ في رقة
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            مساحتكِ الآمنة لترتيب يومكِ والاعتناء بذاتكِ
          </p>
        </div>

        {message.text && (
          <div className={`mb-5 p-4 rounded-2xl text-sm font-medium text-center border transition-all duration-200 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-rose-50 text-rose-500 border-rose-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleManualRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mr-2 mb-1 text-right">الاسم الكامل</label>
            <input
              type="text"
              placeholder="جميلتي، ما هو اسمكِ؟"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-3.5 bg-pink-50/30 border border-pink-100/70 rounded-2xl text-gray-700 placeholder-gray-400/80 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all duration-200 text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mr-2 mb-1 text-right">البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-pink-50/30 border border-pink-100/70 rounded-2xl text-gray-700 placeholder-gray-400/80 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all duration-200 text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mr-2 mb-1 text-right">كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-pink-50/30 border border-pink-100/70 rounded-2xl text-gray-700 placeholder-gray-400/80 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all duration-200 text-left"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-2xl shadow-lg hover:from-pink-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-200 mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'جاري تهيئة مساحتكِ...' : 'ابدئي رحلتكِ الجميلة الآن ✨'}
          </button>
        </form>

        <div className="relative flex py-5 items-center my-2">
          <div className="flex-grow border-t border-pink-100/60"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-normal">أو من خلال</span>
          <div className="flex-grow border-t border-pink-100/60"></div>
        </div>

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

        <p className="text-center text-xs text-gray-400 mt-8">
          لديكِ حساب بالفعل؟ <span className="text-pink-500 font-medium cursor-pointer hover:underline">تسجيل الدخول</span>
        </p>

      </div>
    </div>
  );
};

// التصدير الافتراضي باسم المكون الصحيح
export default ProfileSetup;
