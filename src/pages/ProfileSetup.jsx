import React, { useState, useEffect } from 'react';
/* التعديل الذهبي: في Vite، استخدام './supabaseClient' (بنقطة واحدة) 
  أو المسار المباشر بدون إضافات معقدة هو الأضمن.
  تأكد أن الملف في المجلد الرئيسي (src) وهذا الملف في (src/pages)
*/
import { supabase } from '../supabaseClient'; 

const ProfileSetup = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // فحص صامت للتأكد من أن الكود لم ينهر عند التحميل
    console.log("ProfileSetup Loaded");
  }, []);

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
          data: { full_name: fullName }
        }
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'تم إنشاء حسابك بنجاح! تفحصي بريدك الإلكتروني لتأكيده ✨' 
      });

      if (onComplete && data?.user) {
         setTimeout(() => onComplete(data.user), 2500);
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ ما، أعيدي المحاولة.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error) {
      setMessage({ type: 'error', text: 'تعذر الاتصال بفيسبوك حالياً.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col justify-center items-center p-6 font-sans" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-pink-100 flex flex-col">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full text-3xl mb-3">🌸</div>
          <h1 className="text-2xl font-bold text-pink-600">أهلاً بكِ في رقة</h1>
          <p className="text-gray-400 text-sm mt-1">مساحتكِ الآمنة للاعتناء بذاتكِ</p>
        </div>

        {message.text && (
          <div className={`mb-5 p-4 rounded-2xl text-sm text-center border ${
            message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleManualRegister} className="space-y-4">
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-right"
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-left"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-left"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : 'ابدئي الآن ✨'}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="mx-4 text-xs text-gray-300">أو</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <button
          type="button"
          onClick={handleFacebookLogin}
          className="w-full py-3 bg-[#1877F2] text-white font-medium rounded-xl flex items-center justify-center gap-2"
        >
          <span>التسجيل عبر فيسبوك</span>
        </button>

      </div>
    </div>
  );
};

export default ProfileSetup;
