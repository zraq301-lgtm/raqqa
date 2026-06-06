import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const ProfileSetup = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleManualRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setMessage({ type: 'error', text: 'يرجى ملء جميع الحقول أولاً 💕' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'تم إنشاء حسابكِ بنجاح! تفحصي بريدكِ الإلكتروني ✨' });
      if (onComplete && data?.user) setTimeout(() => onComplete(data.user), 2500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col justify-center items-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg border border-pink-100 flex flex-col">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full text-3xl mb-3">🌸</div>
          <h1 className="text-2xl font-bold text-pink-600">أهلاً بكِ في رقة</h1>
        </div>

        {message.text && (
          <div className={`mb-5 p-4 rounded-2xl text-sm text-center ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleManualRegister} className="space-y-4">
          <input type="text" placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-5 py-3 border border-gray-100 rounded-xl text-right" />
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 border border-gray-100 rounded-xl text-left" />
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 border border-gray-100 rounded-xl text-left" />
          <button type="submit" disabled={loading} className="w-full py-4 bg-pink-500 text-white font-bold rounded-xl shadow-md disabled:opacity-50">
            {loading ? 'جاري التحميل...' : 'ابدئي الآن ✨'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
