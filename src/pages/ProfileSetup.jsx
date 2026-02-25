import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

const ProfileSetup = ({ onComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '', age: '', social_status: 'متزوجة', health_status: 'عزباء',
    education_level: 'جامعي', hobbies: '', life_mission: '', weight: '',
    children_count: 0, chronic_diseases: 'لا يوجد', last_period: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const finalData = {
      user_id: 'user-' + Math.random().toString(36).substr(2, 9),
      ...formData,
      created_at: new Date().toISOString()
    };

    try {
      // 1. الحفظ في قاعدة البيانات
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: finalData 
      });
    } catch (err) {
      console.warn("Database error, saving locally only.");
    } finally {
      setLoading(false);
      // 2. تفعيل التبديل إلى App.jsx
      if (onComplete) onComplete(); 
      // 3. التوجيه لصفحة الصحة داخل App.jsx
      navigate('/health'); 
    }
  };

  return (
    <div style={{ direction: 'rtl', textAlign: 'center', padding: '50px 20px', background: '#fff5f7', minHeight: '100vh' }}>
       <div style={{ background: 'white', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#ff4d7d' }}>إعداد ملفكِ الشخصي</h2>
          {step === 1 ? (
            <div>
              <input style={{width:'100%', padding:'12px', margin:'10px 0', borderRadius:'10px', border:'1px solid #eee'}} type="text" name="name" placeholder="الاسم" onChange={handleChange} />
              <button style={{width:'100%', padding:'12px', background:'#ff4d7d', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold'}} onClick={() => setStep(2)}>التالي</button>
            </div>
          ) : (
            <div>
              <p>اضغطي حفظ للدخول إلى عالم رقة</p>
              <button style={{width:'100%', padding:'12px', background:'#ff4d7d', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold'}} onClick={handleFinalSubmit} disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ والدخول'}
              </button>
            </div>
          )}
       </div>
    </div>
  );
};

export default ProfileSetup;
