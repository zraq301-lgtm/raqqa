import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

const ProfileSetup = ({ onComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // نظام الكروت المتعددة لضمان التسجيل

  // حالة البيانات وفقاً للجدول المطلوب
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

  // دالة توليد UUID فريد تلقائياً
  const generateUserId = () => {
    return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const userId = generateUserId();
    const createdAt = new Date().toISOString();

    const finalData = {
      user_id: userId,
      ...formData,
      created_at: createdAt
    };

    // --- منطق الحفظ المرن ---
    
    // 1. الحفظ محلياً فوراً لضمان عدم توقف المستخدمة
    localStorage.setItem('user_profile', JSON.stringify(finalData));
    localStorage.setItem('isProfileComplete', 'true');

    try {
      // 2. محاولة الحفظ في قاعدة البيانات (Neon)
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: finalData 
      };

      const response = await CapacitorHttp.post(options);

      if (response.status === 200 || response.status === 201) {
        console.log("تم المزامنة مع السحابة بنجاح");
      }
    } catch (err) {
      // في حال فشل الإنترنت أو قاعدة البيانات، سجلنا البيانات محلياً بالفعل
      console.warn("فشل الاتصال بالقاعدة، تم الحفظ محلياً مؤقتاً:", err);
    } finally {
      setLoading(false);
      // توجيه المستخدمة فوراً سواء نجح الاتصال بالإنترنت أم لا
      if (onComplete) onComplete();
      navigate('/health');
    }
  };

  return (
    <div className="wizard-outer-container">
      <style>{`
        .wizard-outer-container {
          direction: rtl;
          background-color: #fff5f7;
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
          padding: 35px;
          border-radius: 30px;
          box-shadow: 0 15px 35px rgba(255, 77, 125, 0.1);
          border: 1px solid #ff4d7d20;
        }
        .wizard-header { text-align: center; margin-bottom: 25px; }
        .wizard-header h2 { color: #ff4d7d; font-size: 1.6rem; margin-bottom: 10px; }
        .progress-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: #eee; transition: 0.3s; }
        .dot.active { background: #ff4d7d; width: 25px; border-radius: 10px; }
        .form-group { margin-bottom: 20px; text-align: right; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #ff4d7d; font-size: 0.9rem; }
        input, select, textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1.5px solid #f0f0f0;
          border-radius: 12px;
          background: #fdfdfd;
          font-family: inherit;
        }
        input:focus { border-color: #ff4d7d; outline: none; background: #fff; }
        .btn-group { display: flex; gap: 10px; margin-top: 10px; }
        .next-btn { background: #ff4d7d; color: white; border: none; padding: 15px; border-radius: 15px; flex: 2; font-weight: bold; cursor: pointer; }
        .back-btn { background: #f0f0f0; color: #888; border: none; padding: 15px; border-radius: 15px; flex: 1; cursor: pointer; }
      `}</style>

      <div className="wizard-card">
        <div className="wizard-header">
          <h2>إعداد الملف الشخصي</h2>
          <div className="progress-dots">
            <div className={`dot ${step === 1 ? 'active' : ''}`}></div>
            <div className={`dot ${step === 2 ? 'active' : ''}`}></div>
            <div className={`dot ${step === 3 ? 'active' : ''}`}></div>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <div className="step-fade">
              <div className="form-group">
                <label>الاسم (تخصيص التجربة)</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="كيف نناديكِ؟" />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <div className="form-group">
                  <label>العمر (15 - 80)</label>
                  <input type="number" name="age" min="15" max="80" value={formData.age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>الوزن (كجم)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
                </div>
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
              <button className="next-btn" onClick={() => setStep(2)}>المتابعة</button>
            </div>
          )}

          {step === 2 && (
            <div className="step-fade">
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
                <label>عدد الأولاد</label>
                <input type="number" name="children_count" min="0" value={formData.children_count} onChange={handleChange} />
              </div>
              <div className="btn-group">
                <button className="back-btn" onClick={() => setStep(1)}>رجوع</button>
                <button className="next-btn" onClick={() => setStep(3)}>المتابعة</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-fade">
              <div className="form-group">
                <label>تاريخ آخر دورة</label>
                <input type="date" name="last_period" value={formData.last_period} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>الهوايات</label>
                <input type="text" name="hobbies" placeholder="القراءة، الطبخ، الرياضة..." value={formData.hobbies} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>رسالتكِ في الحياة (دعم نفسي)</label>
                <textarea name="life_mission" rows="3" value={formData.life_mission} onChange={handleChange} placeholder="اكتبي طموحاتكِ..."></textarea>
              </div>
              <div className="btn-group">
                <button className="back-btn" onClick={() => setStep(2)}>رجوع</button>
                <button className="next-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'جاري الحفظ...' : 'حفظ وإنهاء التسجيل'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
