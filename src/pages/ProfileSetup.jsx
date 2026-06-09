import React, { useState } from 'react';

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

    try {
      // استيراد ديناميكي معزول تماماً لمنع الكراش وقت تحميل الواجهة
      const { registerToSupabase } = await import('../services/authService');
      const result = await registerToSupabase(email, password, fullName);

      if (result.success) {
        setMessage({ type: 'success', text: 'تم إنشاء حسابكِ بنجاح! ✨' });
        
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('isProfileComplete', 'true');

        if (onComplete && result.user) {
          onComplete(result.user);
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'حدث خطأ ما، أعيدي المحاولة.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'مشكلة في الاتصال بالخدمة الخارجية.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. معالجة التسجيل بـ Facebook
  const handleFacebookLogin = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { loginWithFacebook } = await import('../services/authService');
      const result = await loginWithFacebook();

      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'تعذر الاتصال بفيسبوك حالياً.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'بوابة تسجيل فيسبوك غير متوفرة.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF0F5] via-[#F3E5F5] to-[#E8F5E9] flex flex-col justify-center items-center p-4 font-sans" dir="rtl">
      
      <div className="w-full max-w-md bg-white/75 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_20px_50px_rgba(244,143,177,0.15)] border border-white/60 flex flex-col transition-all duration-300">
        
        {/* الهيدر الترحيبي الأنيق */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-pink-200 via-pink-300 to-purple-300 rounded-full text-4xl shadow-[0_8px_20px_rgba(244,143,177,0.2)] mb-4">
            🌸
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-wide">
            أهلاً بكِ في رقة
          </h1>
          <p className="text-gray-400 text-xs font-medium mt-2 tracking-normal">
            مساحتكِ الآمنة لترتيب يومكِ والاعتناء بذاتكِ
          </p>
        </div>

        {/* صندوق التنبيهات المهندل */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold text-center border shadow-sm transition-all duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-50/80 text-emerald-600 border-emerald-100 backdrop-blur-sm' 
              : 'bg-rose-50/80 text-rose-500 border-rose-100 backdrop-blur-sm'
          }`}>
            {message.text}
          </div>
        )}

        {/* استمارة إدخال البيانات الجذابة */}
        <form onSubmit={handleManualRegister} className="space-y-5">
          
          {/* حقل الاسم */}
          <div className="relative flex items-center">
            <span className="absolute right-4 text-pink-400 text-lg pointer-events-none">✨</span>
            <input
              type="text"
              placeholder="جميلتي، ما هو اسمكِ؟"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="w-full pr-11 pl-5 py-4 bg-white/60 border border-pink-100/80 rounded-2xl text-gray-700 text-sm placeholder-gray-400/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 focus:bg-white transition-all text-right font-medium"
            />
          </div>

          {/* حقل البريد الإلكتروني */}
          <div className="relative flex items-center">
            <span className="absolute right-4 text-pink-400 text-base pointer-events-none">✉️</span>
            <input
              type="email"
              placeholder="البريد الإلكتروني (name@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full pr-11 pl-5 py-4 bg-white/60 border border-pink-100/80 rounded-2xl text-gray-700 text-sm placeholder-gray-400/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 focus:bg-white transition-all text-left font-medium"
            />
          </div>

          {/* حقل كلمة المرور */}
          <div className="relative flex items-center">
            <span className="absolute right-4 text-pink-400 text-base pointer-events-none">🔒</span>
            <input
              type="password"
              placeholder="كلمة المرور (••••••••)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full pr-11 pl-5 py-4 bg-white/60 border border-pink-100/80 rounded-2xl text-gray-700 text-sm placeholder-gray-400/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 focus:bg-white transition-all text-left font-medium"
            />
          </div>

          {/* زر الإرسال الرئيسي */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-400 via-pink-500 to-purple-400 text-white text-sm font-bold rounded-2xl shadow-[0_10px_25px_rgba(244,143,177,0.3)] hover:shadow-[0_12px_30px_rgba(244,143,177,0.4)] active:scale-[0.98] transition-all duration-200 mt-6 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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

        {/* فاصل خطي أنيق جداً */}
        <div className="relative flex py-6 items-center">
          <div className="flex-grow border-t border-pink-100/40"></div>
          <span className="flex-shrink mx-4 text-[11px] text-gray-400 font-medium tracking-wider">أو التسجيل عبر</span>
          <div className="flex-grow border-t border-pink-100/40"></div>
        </div>

        {/* زر فيسبوك الصغير والدائري الأنيق أسفل الصفحة */}
        <div className="flex justify-center items-center">
          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={loading}
            title="التسجيل بواسطة فيسبوك"
            className="w-11 h-11 bg-[#1877F2] text-white rounded-full shadow-md hover:bg-[#166FE5] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileSetup;
