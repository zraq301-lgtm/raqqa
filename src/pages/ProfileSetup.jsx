import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

const ProfileSetup = ({ onComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    social_status: 'متزوجة',
    health_status: 'عزباء',
    education_level: 'جامعي',
    hobbies: '',
    life_mission: '',
    weight: '',
    children_count: 0,
    chronic_diseases: 'لا يوجد',
    last_period: '',
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
      // حفظ محلي فوري
      localStorage.setItem('isProfileComplete', 'true');
      localStorage.setItem('user_data', JSON.stringify(finalData));

      // محاولة الإرسال للسيرفر
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: finalData 
      });

    } catch (err) {
      console.error("خطأ في الحفظ السحابي، تم الحفظ محلياً:", err);
    } finally {
      setLoading(false);
      // استخدام آلية مزدوجة للتأكد من الانتقال
      if (onComplete) {
        onComplete();
      } else {
        window.location.href = '/health'; // حل أخير لضمان الانتقال
      }
    }
  };

  return (
    <div className="setup-wrapper">
      <style>{`
        .setup-wrapper { direction: rtl; background: #fff5f7; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; }
        .setup-card { background: white; width: 100%; max-width: 400px; padding: 30px; border-radius: 25px; box-shadow: 0 10px 30px rgba(255,77,125,0.1); border: 1px solid #ff4d7d30; }
        .setup-card h2 { color: #ff4d7d; text-align: center; margin-bottom: 20px; }
        .input-group { margin-bottom: 15px; text-align: right; }
        label { display: block; margin-bottom: 5px; color: #ff4d7d; font-weight: bold; font-size: 0.9rem; }
        input, select, textarea { width: 100%; padding: 12px; border: 1.5px solid #eee; border-radius: 12px; box-sizing: border-box; }
        .btn-main { background: #ff4d7d; color: white; border: none; padding: 15px; border-radius: 15px; width: 100%; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .btn-sub { background: none; color: #888; border: none; width: 100%; margin-top: 10px; cursor: pointer; }
      `}</style>

      <div className="setup-card">
        {step === 1 && (
          <div>
            <h2>مرحباً بكِ ✨</h2>
            <div className="input-group">
              <label>الاسم الكامل</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="كيف نناديكِ؟" />
            </div>
            <div style={{display:'flex', gap:'10px'}}>
               <div className="input-group">
                 <label>العمر</label>
                 <input type="number" name="age" value={formData.age} onChange={handleChange} />
               </div>
               <div className="input-group">
                 <label>الوزن</label>
                 <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
               </div>
            </div>
            <button className="btn-main" onClick={() => setStep(2)} disabled={!formData.name}>التالي</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>بيانات تهمنا</h2>
            <div className="input-group">
              <label>الحالة الاجتماعية</label>
              <select name="social_status" value={formData.social_status} onChange={handleChange}>
                <option value="دراسة">دراسة</option>
                <option value="مخطوبة">مخطوبة</option>
                <option value="متزوجة">متزوجة</option>
                <option value="مطلقة">مطلقة</option>
                <option value="أرملة">أرملة</option>
              </select>
            </div>
            <div className="input-group">
              <label>الحالة الصحية</label>
              <select name="health_status" value={formData.health_status} onChange={handleChange}>
                <option value="عزباء">عزباء</option>
                <option value="حامل">حامل</option>
                <option value="مرضعة">مرضعة</option>
              </select>
            </div>
            <button className="btn-main" onClick={() => setStep(3)}>التالي</button>
            <button className="btn-sub" onClick={() => setStep(1)}>رجوع</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>الخطوة الأخيرة</h2>
            <div className="input-group">
              <label>تاريخ آخر دورة</label>
              <input type="date" name="last_period" value={formData.last_period} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>رسالتكِ في الحياة</label>
              <textarea name="life_mission" rows="3" value={formData.life_mission} onChange={handleChange} placeholder="طموحاتك..."></textarea>
            </div>
            <button className="btn-main" onClick={handleFinalSubmit} disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ والدخول لرقة'}
            </button>
            <button className="btn-sub" onClick={() => setStep(2)}>رجوع</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
