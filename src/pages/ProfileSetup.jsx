import React, { useState } from 'react';
import { CapacitorHttp } from '@capacitor/core';

// أضفنا { onComplete } هنا لاستقبالها من ملف AppSwitcher
const ProfileSetup = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    maritalStatus: 'single'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.age) {
      setMessage('من فضلكِ أكملي البيانات أولاً رقيقة.');
      return;
    }

    setLoading(true);
    try {
      const options = {
        url: 'https://raqqa-ruddy.vercel.app/api/save-post',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          prompt: `تسجيل مستخدم: ${formData.name}`,
          name: formData.name,
          age: formData.age 
        },
      };

      const response = await CapacitorHttp.post(options);

      if (response.status >= 200 && response.status < 300) {
        // 1. تخزين البيانات بالأسماء التي يتوقعها ملف AppSwitcher
        localStorage.setItem('user_name', formData.name);
        localStorage.setItem('user_age', formData.age);
        localStorage.setItem('user_status', formData.maritalStatus);
        
        // أهم خطوة: حفظ العلامة التي يفحصها AppSwitcher
        localStorage.setItem('isProfileComplete', 'true'); 

        setMessage('تم التسجيل! جاري فتح التطبيق...');

        // 2. إبلاغ الـ AppSwitcher بأن عملية التسجيل تمت بنجاح
        setTimeout(() => {
          if (onComplete) {
            onComplete(); // هذه الدالة ستحول الواجهة إلى <App /> فوراً
          }
        }, 800);

      } else {
        setMessage('السيرفر سجل خطأ، حاولي مجدداً.');
      }
    } catch (error) {
      setMessage('فشل الاتصال، تأكدي من الإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { 
      padding: '40px 20px', 
      direction: 'rtl', 
      textAlign: 'center', 
      minHeight: '100vh',
      backgroundColor: '#fffaff' 
    },
    input: { 
      width: '100%', 
      padding: '15px', 
      margin: '10px 0', 
      borderRadius: '15px', 
      border: '1px solid #ffd1dc',
      backgroundColor: '#fff',
      fontSize: '16px',
      outline: 'none'
    },
    button: { 
      width: '100%', 
      padding: '15px', 
      marginTop: '20px',
      backgroundColor: '#ff85a2', 
      color: 'white', 
      border: 'none', 
      borderRadius: '30px', 
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 5px 15px rgba(255,133,162,0.4)',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#d81b60', marginBottom: '30px' }}>مرحباً بكِ في رقة</h2>
      
      <input style={styles.input} name="name" placeholder="الاسم أو اللقب" onChange={handleChange} />
      <input style={styles.input} name="age" type="number" placeholder="العمر" onChange={handleChange} />
      
      <select style={styles.input} name="maritalStatus" onChange={handleChange}>
        <option value="single">عزباء</option>
        <option value="married">متزوجة</option>
        <option value="engaged">مخطوبة</option>
        <option value="divorced">مطلقة</option>
        <option value="widowed">أرملة</option>
      </select>

      <button style={styles.button} onClick={handleSave} disabled={loading}>
        {loading ? 'انتظري رقيقة...' : 'حفظ والدخول'}
      </button>

      {message && <p style={{ marginTop: '20px', color: '#ff4d7d' }}>{message}</p>}
    </div>
  );
};

export default ProfileSetup;
