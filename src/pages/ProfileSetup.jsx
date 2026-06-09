import React, { useState, useEffect } from 'react';

const ProfileSetup = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVisible, setIsVisible] = useState(false);

  // تأثير لظهور العناصر بنعومة عند تحميل الصفحة
  useEffect(() => {
    setIsVisible(true);
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
      const fcmToken = localStorage.getItem('fcm_token');
      const { registerToSupabase } = await import('../services/authService');
      
      const result = await registerToSupabase(email, password, fullName, fcmToken);

      if (result.success) {
        setMessage({ type: 'success', text: 'تم إنشاء حسابكِ بنجاح! ✨' });
        
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('isProfileComplete', 'true');

        // الانتقال الفوري لـ App.jsx
        if (onComplete && result.user) {
          setTimeout(() => {
            onComplete({ ...result.user, fcmToken });
          }, 1500); // تأخير بسيط لتعيش المستخدمة فرحة النجاح
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

  return (
    <div className="min-h-screen bg-[#fff9fb] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans" dir="rtl">
      
      {/* دوائر خلفية جمالية لنشر الرقة */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-pink-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-60"></div>

      <div className={`w-full max-w-md transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* الكرت الزجاجي الرئيسي */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[40px] p-10 shadow-[0_30px_100px_rgba(255,182,193,0.2)] border border-white/80 relative z-10">
          
          {/* الأيقونة العلوية */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-pink-300 to-rose-200 rounded-full flex items-center justify-center text-5xl shadow-inner animate-bounce-slow">
                🌸
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl">✨</span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">أهلاً بكِ في <span className="text-pink-500">رقة</span></h1>
            <p className="text-gray-500 mt-3 font-light">مساحتكِ الهادئة لتكوني بأفضل حال</p>
          </div>

          {message.text && (
            <div className={`mb-8 p-4 rounded-2xl text-sm font-medium text-center border animate-fade-in ${
              message.type === 'success' 
                ? 'bg-green-50/50 text-green-600 border-green-100' 
                : 'bg-rose-50/50 text-rose-500 border-rose-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleManualRegister} className="space-y-6">
            {/* حقل الاسم */}
            <div className="group">
              <label className="block text-right mr-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">الاسم الكامل</label>
              <input
                type="text"
                placeholder="جميلتي، ما اسمكِ؟"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border-2 border-transparent rounded-3xl text-gray-700 focus:border-pink-200 focus:bg-white outline-none transition-all duration-300 shadow-sm placeholder:text-gray-300"
              />
            </div>

            {/* حقل البريد */}
            <div className="group">
              <label className="block text-right mr-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border-2 border-transparent rounded-3xl text-gray-700 focus:border-pink-200 focus:bg-white outline-none transition-all duration-300 shadow-sm text-left placeholder:text-gray-300"
              />
            </div>

            {/* حقل كلمة المرور */}
            <div className="group">
              <label className="block text-right mr-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">كلمة المرور</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border-2 border-transparent rounded-3xl text-gray-700 focus:border-pink-200 focus:bg-white outline-none transition-all duration-300 shadow-sm text-left placeholder:text-gray-300"
              />
            </div>

            {/* زر البدء */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-3xl font-bold shadow-[0_15px_30px_rgba(244,143,177,0.4)] hover:shadow-[0_20px_40px_rgba(244,143,177,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>ابدئي رحلتكِ الرقيقة ✨</>
              )}
            </button>
          </form>

          {/* الخيارات الأخرى */}
          <div className="mt-12 text-center">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-grow bg-gray-100"></div>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">أو عبر</span>
              <div className="h-[1px] flex-grow bg-gray-100"></div>
            </div>

            <button
              onClick={() => {}} // دالة الفيس بوك
              className="px-8 py-3 bg-white/80 border border-gray-100 rounded-2xl flex items-center gap-3 mx-auto hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span className="text-sm font-semibold text-gray-600">تسجيل سريع</span>
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-gray-400 text-xs font-light">
          بإنشاء حسابكِ، أنتِ توافقين على <span className="text-pink-400 font-medium cursor-pointer underline">خصوصية رقة</span>
        </p>
      </div>

      {/* إضافة انيميشن Tailwind مخصص في ملف CSS لاحقاً */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ProfileSetup;
