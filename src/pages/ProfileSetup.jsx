import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const UserProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    maritalStatus: 'single'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // تحميل البيانات المحفوظة محلياً عند فتح الصفحة
  useEffect(() => {
    const savedAge = localStorage.getItem('user_age');
    const savedStatus = localStorage.getItem('user_marital_status');
    if (savedAge || savedStatus) {
      setFormData(prev => ({
        ...prev,
        age: savedAge || '',
        maritalStatus: savedStatus || 'single'
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 1. حفظ الاسم/اللقب في الجدول الخارجي (Vercel API)
      const options = {
        url: 'https://raqqa-ruddy.vercel.app/api/save-post',
        headers: { 'Content-Type': 'application/json' },
        data: { name: formData.name },
      };

      const response = await CapacitorHttp.post(options);

      if (response.status === 200 || response.status === 201) {
        // 2. حفظ باقي البيانات محلياً داخل التطبيق
        localStorage.setItem('user_age', formData.age);
        localStorage.setItem('user_marital_status', formData.maritalStatus);
        
        setMessage('تم حفظ البيانات بنجاح!');
      } else {
        setMessage('حدث خطأ أثناء حفظ الاسم في السيرفر.');
      }
    } catch (error) {
      console.error('Save Error:', error);
      setMessage('فشل الاتصال بالسيرفر، تأكد من إعدادات Capacitor.');
    } finally {
      setLoading(false);
    }
  };

  // تنسيق بسيط وعصري
  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif', direction: 'rtl' },
    field: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' },
    button: { 
      width: '100%', 
      padding: '12px', 
      backgroundColor: '#ff85a2', 
      color: 'white', 
      border: 'none', 
      borderRadius: '25px', 
      fontSize: '16px',
      cursor: 'pointer' 
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center' }}>الملف الشخصي</h2>
      
      <div style={styles.field}>
        <label style={styles.label}>الاسم أو اللقب:</label>
        <input 
          style={styles.input}
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="أدخل اسمك"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>العمر:</label>
        <input 
          style={styles.input}
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="أدخل عمرك"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>الحالة الاجتماعية:</label>
        <select 
          style={styles.input}
          name="maritalStatus"
          value={formData.maritalStatus}
          onChange={handleChange}
        >
          <option value="single">عزباء</option>
          <option value="married">متزوجة</option>
          <option value="divorced">مطلقة</option>
          <option value="widowed">أرملة</option>
        </select>
      </div>

      <button 
        style={styles.button} 
        onClick={handleSave} 
        disabled={loading}
      >
        {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
      </button>

      {message && <p style={{ textAlign: 'center', marginTop: '10px', color: '#d81b60' }}>{message}</p>}
    </div>
  );
};

export default UserProfile;
