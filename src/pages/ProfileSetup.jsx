import React, { useState, useEffect } from 'react';

const ProfileSetup = ({ onComplete }) => {
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

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setMessage({ type: '', text: '' });
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    
    if (!email || !password || (!isLoginMode && !fullName)) {
      setMessage({ type: 'error', text: 'جميلتي، يرجى ملء الحقول المطلوبة أولاً 💕' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const fcmToken = localStorage.getItem('fcm_token');
      
      // 🚀 الاتصال المباشر عبر الـ API المربوط بـ Neon PostgreSQL
      const response = await fetch('https://raqqa-hjl8.vercel.app/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: isLoginMode ? 'login' : 'register',
          email: email.trim(),
          password: password,
          fullName: fullName.trim(),
          fcmToken: fcmToken
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: isLoginMode ? 'أهلاً بعودتكِ يا جميلتي! ✨' : 'تم إنشاء حسابكِ بنجاح! ✨' 
        });
        
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('isProfileComplete', 'true');
        
        if (result.user?.id) {
          localStorage.setItem('user_id', String(result.user.id));
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
      console.error("Auth System Connection Error:", err);
      setMessage({ type: 'error', text: 'مشكلة في الاتصال بالخدمة وقاعدة البيانات.' });
    } finally {
      setLoading(false);
    }
  };

  // ... (احتفظ بكامل كود الـ styles والـ return الخاص بـ JSX كما هو تماماً بدون تغيير)
