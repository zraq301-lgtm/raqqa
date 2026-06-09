import React, { useState, useEffect } from 'react';

const ProfileSetup = ({ onComplete }) => {
  // تفعيل التبديل بين وضع "إنشاء حساب الجديد" ووضع "تسجيل الدخول للحساب القديم"
  const [isLoginMode, setIsLoginMode] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // تفريغ الرسائل عند التبديل بين الكروت
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setMessage({ type: '', text: '' });
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    
    // التحقق من الحقول بناءً على الوضع الحالي
    if (!email || !password || (!isLoginMode && !fullName)) {
      setMessage({ type: 'error', text: 'جميلتي، يرجى ملء الحقول المطلوبة أولاً 💕' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const fcmToken = localStorage.getItem('fcm_token');
      const { registerToSupabase, loginToSupabase } = await import('../services/authService');
      
      let result;
      
      if (isLoginMode) {
        // 1. منطق تسجيل الدخول للحساب القديم
        result = await loginToSupabase(email, password, fcmToken);
      } else {
        // 2. منطق إنشاء حساب جديد
        result = await registerToSupabase(email, password, fullName, fcmToken);
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: isLoginMode ? 'أهلاً بعودتكِ يا جميلتي! ✨' : 'تم إنشاء حسابكِ بنجاح! ✨' 
        });
        
        // حفظ التوكن والحالة محلياً لضمان عدم الخروج نهائياً حتى لو أُغلق التطبيق من الخلفية
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('isProfileComplete', 'true');
        if (result.user?.id) {
          localStorage.setItem('user_id', result.user.id);
        }

        if (onComplete && result.user) {
          setTimeout(() => {
            onComplete({ ...result.user, fcmToken });
          }, 1200);
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
    <div className="min-h-screen bg-[#fffafd] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans" dir="rtl">
      
      {/* شبكة توزيع إضاءة خلفية فائقة النعومة والرقة */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-pink-200/40 via-rose-100/30 to-transparent rounded-full blur-3xl opacity-80 mix-blend-multiply"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/40 via-indigo-50/20 to-transparent rounded-full blur-3xl opacity-80 mix-blend-multiply"></div>

      <div className={`w-full max-w-md transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
        
        {/* الكرت الزجاجي الفاخر بـ حواف ثلاثية الأبعاد خفيفة */}
        <div className="bg-white/50 backdrop-blur-3xl rounded-[48px] p-8 md:p-10 shadow-[0_40px_120px_rgba(255,182,193,0.25)] border border-white/90 relative z-10 overflow-hidden">
          
          {/* تأثير توهج داخلي علوي ناعم */}
          <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300"></div>

          {/* الأيقونة العلوية برقصة دائرية عند الـ Hover */}
          <div className="flex justify-center mb-6">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-pink-200 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="w-24 h-24 bg-gradient-to-tr from-pink-200 via-white to-rose-200 rounded-full flex items-center justify-center text-5xl shadow-[inset_0_4px_12px_rgba(255,182,193,0.2)] transform transition-transform group-hover:rotate-12 duration-500 relative z-10">
                🌸
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl animate-pulse">✨</span>
            </div>
          </div>

          {/* العناوين التفاعلية حسب الوضع */}
          <div className="text-center mb-8 transition-all duration-300">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
              {isLoginMode ? <>مرحباً <span className="text-pink-500">بعودتكِ</span></> : <>أهلاً بكِ في <span className="text-pink-500">رقة</span></>}
            </h1>
            <p className="text-gray-400 mt-2.5 text-sm font-light">
              {isLoginMode ? 'سجّلي دخولكِ لمتابعة رحلتكِ الهادئة' : 'مساحتكِ الآمنة لترتيب يومكِ والاعتناء بذاتكِ'}
            </p>
          </div>

          {/* التنبيهات المهندلة */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold text-center border shadow-inner transition-all duration-500 ${
              message.type === 'success' 
                ? 'bg-green-50/60 text-green-600 border-green-100' 
                : 'bg-rose-50/60 text-rose-500 border-rose-100'
            }`}>
              {message.text}
            </div>
          )}

          {/* الفورم الموحد */}
          <form onSubmit={handleAuthAction} className="space-y-5">
            
            {/* حقل الاسم - يختفي وينعم في وضع تسجيل الدخول */}
            <div className={`transition-all duration-500 origin-top overflow-hidden ${
              isLoginMode ? 'max-h-0 opacity-0 scale-95 pointer-events-none mb-0' : 'max-h-24 opacity-100 scale-100 mb-5'
            }`}>
              <label className="block text-right mr-3 mb-2 text-[11px] font-bold text-gray-400 tracking-widest">الاسم الجميل</label>
              <div className="relative flex items-center">
                <span className="absolute right-5 text-gray-300 group-focus-within:text-pink-400 transition-colors pointer-events-none">✨</span>
                <input
                  type="text"
                  placeholder="ما هو اسمكِ يا رقيقة؟"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full pr-12 pl-5 py-4 bg-white/70 border border-pink-100/50 rounded-2xl text-gray-700 text-sm placeholder:text-gray-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-100/50 focus:border-pink-300 focus:bg-white transition-all duration-300 text-right"
                />
              </div>
            </div>

            {/* حقل البريد الإلكتروني */}
            <div>
              <label className="block text-right mr-3 mb-2 text-[11px] font-bold text-gray-400 tracking-widest">البريد الإلكتروني</label>
              <div className="relative flex items-center">
                <span className="absolute right-5 text-gray-300 pointer-events-none">✉️</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pr-12 pl-5 py-4 bg-white/70 border border-pink-100/50 rounded-2xl text-gray-700 text-sm placeholder:text-gray-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-100/50 focus:border-pink-300 focus:bg-white transition-all duration-300 text-left"
                />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-right mr-3 mb-2 text-[11px] font-bold text-gray-400 tracking-widest">كلمة المرور</label>
              <div className="relative flex items-center">
                <span className="absolute right-5 text-gray-300 pointer-events-none">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pr-12 pl-5 py-4 bg-white/70 border border-pink-100/50 rounded-2xl text-gray-700 text-sm placeholder:text-gray-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-100/50 focus:border-pink-300 focus:bg-white transition-all duration-300 text-left"
                />
              </div>
            </div>

            {/* زر الإرسال المتفاعل */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 text-white rounded-2xl font-bold shadow-[0_12px_30px_rgba(244,143,177,0.35)] hover:shadow-[0_18px_45px_rgba(244,143,177,0.45)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>{isLoginMode ? 'تسجيل الدخول ✨' : 'ابدئي رحلتكِ الجميلة الآن ✨'}</span>
              )}
            </button>
          </form>

          {/* الفاصل الخطي */}
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-pink-100/40"></div>
            <span className="flex-shrink mx-4 text-[11px] text-gray-400 font-medium">أو التبديل إلى</span>
            <div className="flex-grow border-t border-pink-100/40"></div>
          </div>

          {/* زر السحر والتبديل الجذاب المخصص للتطبيق القديم والجديد */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-xs font-semibold text-purple-500 hover:text-pink-500 underline underline-offset-4 active:scale-95 transition-all"
            >
              {isLoginMode ? 'إنشاء حساب جديد ومساحة جديدة 🌸' : 'لديكِ حساب قديم بالفعل؟ تسجيل الدخول ✉️'}
            </button>
          </div>

        </div>

        <p className="mt-8 text-center text-gray-400 text-[11px] font-light">
          بفتح الحساب، أنتِ توافقين على <span className="text-pink-400 font-medium cursor-pointer hover:underline">خصوصية وسرية رقة</span>
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;
