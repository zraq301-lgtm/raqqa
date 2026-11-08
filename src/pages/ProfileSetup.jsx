import React, { useState } from 'react';
import { signInWithGoogle } from '../services/authService';

const ProfileSetup = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const handleGoogleSignIn = async () => {
    setLoading(true); setMessage('');
    const result = await signInWithGoogle();
    if (result.success && !result.redirecting) onComplete?.(result.profile || result.user);
    else if (!result.success) setMessage(result.error || 'تعذر تسجيل الدخول بواسطة Google.');
    setLoading(false);
  };
  return <main dir="rtl" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(135deg,#fff5f9,#fff)' }}>
    <section style={{ width: '100%', maxWidth: 430, padding: 36, borderRadius: 28, background: '#fff', boxShadow: '0 18px 50px rgba(190,80,130,.14)', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
      <h1 style={{ margin: '0 0 10px', color: '#7b3157' }}>رفيقتكِ رقة</h1>
      <p style={{ color: '#777', lineHeight: 1.8 }}>سجّلي دخولكِ بحساب Google لحفظ ملفكِ وبياناتكِ بأمان عبر Firebase.</p>
      {message && <p role="alert" style={{ color: '#b42318', background: '#fff1f0', padding: 12, borderRadius: 12 }}>{message}</p>}
      <button type="button" onClick={handleGoogleSignIn} disabled={loading} style={{ width: '100%', padding: '15px 18px', border: 0, borderRadius: 15, background: '#7b3157', color: '#fff', fontWeight: 700, fontSize: 16, cursor: loading ? 'wait' : 'pointer' }}>
        {loading ? 'جارٍ فتح Google…' : 'المتابعة باستخدام Google'}
      </button>
      <small style={{ display: 'block', marginTop: 18, color: '#999' }}>لن يتم تخزين رمز الدخول في localStorage.</small>
    </section>
  </main>;
};
export default ProfileSetup;
