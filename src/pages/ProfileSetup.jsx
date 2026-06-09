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
    <div className="min-h-screen bg-gradient-to-tr from-[#fff5f9] via-[#ffffff] to-[#fef6fb] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans selection:bg-pink-100 selection:text-pink-600" dir="rtl">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-25%] right-[-15%] w-[600px] h-[600px] bg-gradient-to-br from-pink-300/30 via-rose-200/20 to-transparent rounded-full blur-[130px] opacity-90 animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-[-25%] left-[-15%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-300/20 via-pink-100/30 to-transparent rounded-full blur-[130px] opacity-90 animate-pulse duration-[10000ms]"></div>

      <div className={`w-full max-w-md transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        {/* The Luxury Ultra-Modern Glass Card */}
        <div className="bg-white/60 backdrop-blur-3xl rounded-[40px] p-8 md:p-11 shadow-[0_32px_100px_-20px_rgba(244,143,177,0.2)] border border-white/80 relative z-10 overflow-hidden ring-1 ring-black/[0.02]">
          
          {/* Top Artistic Ambient Line */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 opacity-80"></div>

          {/* Icon Header Area */}
          <div className="flex justify-center mb-8">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-300 to-purple-300 rounded-full blur-2xl opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"></div>
              <div className="w-24 h-24 bg-gradient-to-b from-white to-pink-50/50 rounded-full flex items-center justify-center text-4xl shadow-[0_12px_30px_rgba(244,143,177,0.15)] shadow-[inset_0_2px_8px_rgba(255,255,255,1)] border border-pink-100/40 transform transition-all cubic-bezier(0.175,0.885,0.32,1.275) group-hover:scale-105 group-hover:rotate-[8deg] duration-500 relative z-10">
                🌸
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl animate-bounce duration-1000">✨</span>
            </div>
          </div>

          {/* Dynamic Titles */}
          <div className="text-center mb-9">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight leading-tight">
              {isLoginMode ? (
                <>مرحباً <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">بعودتكِ</span></>
              ) : (
                <>أهلاً بكِ في <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">رقة</span></>
              )}
            </h1>
            <p className="text-gray-400 mt-3 text-sm font-light leading-relaxed max-w-[280px] mx-auto">
              {isLoginMode ? 'سجّلي دخولكِ لمتابعة رحلتكِ الهادئة' : 'مساحتكِ الآمنة لترتيب يومكِ والاعتناء بذاتكِ'}
            </p>
          </div>

          {/* Feedback Alert Container */}
          {message.text && (
            <div className={`mb-7 p-4 rounded-2xl text-xs font-medium text-center border transition-all duration-500 transform scale-100 ${
              message.type === 'success' 
                ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100/70 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' 
                : 'bg-rose-50/50 text-rose-500 border-rose-100/70 shadow-[0_4px_20px_rgba(244,63,94,0.05)]'
            }`}>
              {message.text}
            </div>
          )}

          {/* Unified Form */}
          <form onSubmit={handleAuthAction} className="space-y-6">
            
            {/* Full Name Field (Smooth Animated Collapse) */}
            <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top overflow-hidden ${
              isLoginMode ? 'max-h-0 opacity-0 scale-95 pointer-events-none mb-0' : 'max-h-[100px] opacity-100 scale-100 mb-2'
            }`}>
              <label className="block text-right mr-2 mb-2 text-[11px] font-bold text-gray-400 tracking-wider uppercase opacity-80">الاسم الجميل</label>
              <div className="relative flex items-center group">
                <span className="absolute right-4 text-gray-300 group-focus-within:text-pink-400 transition-colors duration-300 pointer-events-none text-base">✨</span>
                <input
                  type="text"
                  placeholder="ما هو اسمكِ يا رقيقة؟"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full pr-11 pl-4 py-3.5 bg-white/80 border border-gray-100 rounded-2xl text-gray-700 text-sm placeholder:text-gray-300 shadow-sm shadow-gray-50/50 focus:outline-none focus:ring-4 focus:ring-pink-100/40 focus:border-pink-300 focus:bg-white transition-all duration-300 text-right"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-right mr-2 mb-2 text-[11px] font-bold text-gray-400 tracking-wider uppercase opacity-80">البريد الإلكتروني</label>
              <div className="relative flex items-center group">
                <span className="absolute right-4 text-gray-300 group-focus-within:text-pink-400 transition-colors duration-300 pointer-events-none text-base">✉️</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pr-11 pl-4 py-3.5 bg-white/80 border border-gray-100 rounded-2xl text-gray-700 text-sm placeholder:text-gray-300 shadow-sm shadow-gray-50/50 focus:outline-none focus:ring-4 focus:ring-pink-100/40 focus:border-pink-300 focus:bg-white transition-all duration-300 text-left font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-right mr-2 mb-2 text-[11px] font-bold text-gray-400 tracking-wider uppercase opacity-80">كلمة المرور</label>
              <div className="relative flex items-center group">
                <span className="absolute right-4 text-gray-300 group-focus-within:text-pink-400 transition-colors duration-300 pointer-events-none text-base">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pr-11 pl-4 py-3.5 bg-white/80 border border-gray-100 rounded-2xl text-gray-700 text-sm placeholder:text-gray-300 shadow-sm shadow-gray-50/50 focus:outline-none focus:ring-4 focus:ring-pink-100/40 focus:border-pink-300 focus:bg-white transition-all duration-300 text-left"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 hover:from-pink-500 hover:via-rose-500 hover:to-purple-500 text-white rounded-2xl font-bold text-sm shadow-[0_10px_25px_-5px_rgba(244,143,177,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(244,143,177,0.5)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 disabled:pointer-events-none mt-8"
            >
              {loading ? (
                <div className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="tracking-wide">{isLoginMode ? 'تسجيل الدخول ✨' : 'ابدئي رحلتكِ الجميلة الآن ✨'}</span>
              )}
            </button>
          </form>

          {/* Elegant Divider */}
          <div className="relative flex py-7 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[11px] text-gray-400/80 font-medium tracking-wide">أو التبديل إلى</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Mode Toggle Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-xs font-bold text-purple-500/90 hover:text-pink-500 transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1px] after:bg-current after:transform after:scale-x-100 hover:after:scale-x-0 after:transition-transform after:duration-300"
            >
              {isLoginMode ? 'إنشاء حساب جديد ومساحة جديدة 🌸' : 'لديكِ حساب قديم بالفعل؟ تسجيل الدخول ✉️'}
            </button>
          </div>

        </div>

        {/* Footer Privacy Note */}
        <p className="mt-8 text-center text-gray-400 text-[11px] font-light tracking-wide leading-relaxed">
          بفتح الحساب، أنتِ توافقين على <span className="text-pink-400 font-semibold cursor-pointer hover:text-pink-500 transition-colors duration-200">خصوصية وسرية رقة</span>
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;
