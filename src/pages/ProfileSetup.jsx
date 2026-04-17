import React, { useState } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', age: '', maritalStatus: 'single' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.age) {
      setMessage('يرجى كتابة الاسم والعمر أولاً رقيقة.');
      return;
    }

    setLoading(true);
    setMessage('جاري الاتصال بسيرفر رقة...');

    try {
      const options = {
        url: 'https://raqqa-ruddy.vercel.app/api/save-post',
        headers: { 'Content-Type': 'application/json' },
        // إرسال البيانات للسيرفر
        data: { 
          prompt: `تسجيل مستخدم جديد: ${formData.name}`, // البرومبت الأساسي
          name: formData.name, 
          age: formData.age 
        },
      };

      const response = await CapacitorHttp.post(options);

      // التحقق من النجاح (سواء 200 أو 201)
      if (response.status >= 200 && response.status < 300) {
        // حفظ البيانات محلياً في الجهاز لضمان بقائها
        localStorage.setItem('user_name', formData.name);
        localStorage.setItem('user_age', formData.age);
        localStorage.setItem('user_status', formData.maritalStatus);
        
        setMessage('تم التسجيل بنجاح! ننتقل الآن...');
        
        setTimeout(() => {
          navigate('/'); // الانتقال إلى App.jsx
        }, 1200);
      } else {
        setMessage(`عذراً، السيرفر رد بـ خطأ (${response.status}). حاولي مرة أخرى.`);
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setMessage('تعذر الاتصال بالسيرفر، تأكد من اتصال الإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl', textAlign: 'center' }}>
      <h2 style={{ color: '#d81b60' }}>انضمي إلى رقة</h2>
      <input 
        style={inputStyle} 
        name="name" 
        placeholder="الاسم أو اللقب" 
        onChange={handleChange} 
      />
      <input 
        style={inputStyle} 
        name="age" 
        type="number" 
        placeholder="العمر" 
        onChange={handleChange} 
      />
      <select style={inputStyle} name="maritalStatus" onChange={handleChange}>
        <option value="single">عزباء</option>
        <option value="married">متزوجة</option>
      </select>
      
      <button 
        style={buttonStyle} 
        onClick={handleSave} 
        disabled={loading}
      >
        {loading ? 'انتظري قليلاً...' : 'حفظ البيانات والدخول'}
      </button>

      {message && <p style={{ marginTop: '15px', color: '#888' }}>{message}</p>}
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '10px', border: '1px solid #ffc1e3' };
const buttonStyle = { width: '100%', padding: '14px', backgroundColor: '#ff85a2', color: 'white', border: 'none', borderRadius: '25px', fontSize: '16px' };

export default UserProfile;
