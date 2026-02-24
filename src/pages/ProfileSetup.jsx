import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

const ProfileSetup = ({ onComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 

  // حالة البيانات وفقاً للجدول المطلوب تماماً
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    social_status: 'دراسة',
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
    setFormData({ ...formData, [name]: value });
  };

  const handleFinalSubmit = async () => {
    setLoading(true);

    const finalData = {
      user_id: 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now(),
      ...formData,
      created_at: new Date().toISOString()
    };

    // 1. الحفظ المحلي فوراً (لضمان فتح التطبيق حتى لو انقطع الإنترنت)
    localStorage.setItem('user_profile', JSON.stringify(finalData));
    localStorage.setItem('isProfileComplete', 'true');

    try {
      // 2. محاولة الحفظ في قاعدة البيانات
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: finalData 
      });
    } catch (err) {
      console.warn("فشل الحفظ السحابي، تم الاعتماد على الحفظ المحلي:", err);
    } finally {
      setLoading(false);
      // الانتقال للتطبيق مهما كانت النتيجة
      if (onComplete) {
        onComplete();
      } else {
        navigate('/health');
      }
    }
  };

  return (
    <div className="wizard-full-page">
      <style>{`
        .wizard-full-page {
          direction: rtl;
          background: #fff5f7;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Tajawal', sans-serif;
        }
        .wizard-card {
          background: white;
          width: 100%;
          max-width: 450px;
          padding: 30px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(255, 77, 125, 0.1);
          border: 1px solid rgba(255, 77, 125, 0.2);
        }
        .step-title { color: #ff4d7d; font-size: 1.5rem; margin-bottom: 10px; text-align: center; }
        .step-desc { color: #666; text-align: center; margin-bottom: 25px; font-size: 0.9rem; }
        .form-group { margin-bottom: 15px; text-align: right; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #ff4d7d; }
        input, select, textarea {
          width: 100%;
          padding: 12px;
          border: 1.5px solid #eee;
          border-radius: 12px;
          background: #fdfdfd;
          font-family: inherit;
        }
        .btn-next {
          background: #ff4d7d;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 15px;
          width: 100%;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 15px;
        }
        .btn-back {
          background: none;
          color: #888;
          border: none;
          width: 100%;
          margin-top: 10px;
          cursor: pointer;
          text-decoration: underline;
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      `}</style>

      <div className="wizard-card">
        {step === 1 && (
          <div className="step-content">
            <h2 className="step-title">مرحباً بكِ في رقة ✨</h2>
            <p className="step-desc">لنبدأ بإعداد ملفكِ الشخصي</p>
            <div className="form-group">
              <label>الاسم</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="كيف ننباديكِ؟" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>العمر</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>الوزن</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
              </div>
            </div>
            <button className="btn-next" onClick={() => setStep(2)} disabled={!formData.name}>التالي</button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className="step-title">حالتكِ واهتماماتكِ</h2>
            <div className="form-group">
              <label>الحالة الاجتماعية</label>
              <select name="social_status" value={formData.social_status} onChange={handleChange}>
                <option value="دراسة">دراسة</option>
                <option value="مخطوبة">مخطوبة</option>
                <option value="متزوجة">متزوجة</option>
                <option value="مطلقة">مطلقة</option>
                <option value="أرملة">أرملة</option>
              </select>
            </div>
            <div className="form-group">
              <label>الحالة الصحية</label>
              <select name="health_status" value={formData.health_status} onChange={handleChange}>
                <option value="عزباء">عزباء</option>
                <option value="حامل">حامل</option>
                <option value="مرضعة">مرضعة</option>
                <option value="سن الأمل">سن الأمل</option>
              </select>
            </div>
            <div className="form-group">
              <label>المؤهل الدراسي</label>
              <select name="education_level" value={formData.education_level} onChange={handleChange}>
                <option value="ثانوي">ثانوي</option>
                <option value="جامعي">جامعي</option>
                <option value="ماجستير">ماجستير</option>
                <option value="دكتوراه">دكتوراه</option>
              </select>
            </div>
            <button className="btn-next" onClick={() => setStep(3)}>التالي</button>
            <button className="btn-back" onClick={() => setStep(1)}>رجوع</button>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 className="step-title">الخطوة الأخيرة</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>عدد الأولاد</label>
                <input type="number" name="children_count" value={formData.children_count} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>آخر دورة</label>
                <input type="date" name="last_period" value={formData.last_period} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>الأمراض المزمنة</label>
              <input type="text" name="chronic_diseases" value={formData.chronic_diseases} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>رسالتكِ في الحياة</label>
              <textarea name="life_mission" rows="2" value={formData.life_mission} onChange={handleChange}></textarea>
            </div>
            <button className="btn-next" onClick={handleFinalSubmit} disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'ابدئي رحلتكِ الآن'}
            </button>
            <button className="btn-back" onClick={() => setStep(2)}>رجوع</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
