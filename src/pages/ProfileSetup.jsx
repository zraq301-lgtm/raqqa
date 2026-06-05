import React, { useState, useEffect } from 'react';

// فحص آمن للاستيراد لتجنب انهيار الـ Runtime
let supabase;
try {
  const module = require('../services/supabaseClient');
  supabase = module.supabase;
} catch (e) {
  // استخدام التمرير الديناميكي القياسي لـ ESM كبديل آمن في Vite
  import('../services/supabaseClient').then(mod => {
    supabase = mod.supabase;
  }).catch(err => console.error("سوبابيز غير قادر على التحميل:", err));
}

const ProfileSetup = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!supabase) {
      setMessage({ 
        type: 'error', 
        text: 'تنبيه: لم يتم العثور على اتصال قاعدة البيانات بالمسار الجديد، جاري التحقق.' 
      });
    }
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
      if (!supabase) throw new Error("قاعدة البيانات غير متصلة بالواجهة حالياً.");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'تم إنشاء حسابكِ بنجاح! تفحصي بريدكِ الإلكتروني لتأكيده ✨' 
      });

      if (onComplete && data?.user) {
         setTimeout(() => onComplete(data.user), 2500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ غير متوقع.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF0F5] via-[#F3E5F5] to-[#E8F5E9] flex flex-col justify-center items-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-pink-100/50 flex flex-col">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full text-white text-3xl mb-3">🌸</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">أهلاً بكِ في رقة</h1>
        </div>

        {message.text && (
          <div className={`mb-5 p-4 rounded-2xl text-sm font-medium text-center border ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleManualRegister} className="space-y-4">
          <input type="text" placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-5 py-3.5 bg-pink-50/30 border border-pink-100/70 rounded-2xl text-right" />
          <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3.5 bg-pink-50/30 border border-pink-100/70 rounded-2xl text-left" />
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3.5 bg-pink-50/30 border border-pink-100/70 rounded-2xl text-left" />
          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50">{loading ? 'جاري التحميل...' : 'ابدئي رحلتكِ الآن ✨'}</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
