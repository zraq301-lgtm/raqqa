import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

const ProfileSetup = ({ onComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // الحالة الابتدائية لجميع المدخلات المطلوبة برمجياً
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
      // 1. الحفظ المحلي فوراً لضمان تخطي صفحة التسجيل للأبد
      localStorage.setItem('isProfileComplete', 'true');
      localStorage.setItem('user_data', JSON.stringify(finalData));

      // 2. محاولة الحفظ في قاعدة البيانات (نيون)
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: finalData 
      });

    } catch (err) {
      console.warn("حدث خلل في الشبكة، تم الاعتماد على الحفظ المحلي:", err);
    } finally {
      setLoading(false);
      
      // 3. الانتقال الإجباري لملف App.jsx
      if (onComplete) {
        onComplete(); // هذا سيغير الحالة في AppSwitcher ليفتح App.jsx
      } else {
        // إذا لم يتم تمرير props، نستخدم التوجيه المباشر كخيار احتياطي
        navigate('/health'); 
      }
    }
  };

  return (
    <div className="setup-container">
      <style>{`
        .setup-container { 
          direction: rtl; 
          background: #fff5f7; 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-family: 'Tajawal', sans-serif; 
          padding: 20px; 
        }
        .setup-card { 
          background: white; 
          width: 100%; 
          max-width: 420px; 
          padding: 30px; 
          border-radius: 25px; 
          box-shadow: 0 15px 35px rgba(255, 77, 125, 0.1); 
          border: 1px solid rgba(255, 77, 125, 0.2); 
        }
        .step-indicator { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #eee; }
        .dot.active { background: #ff4d7d; width: 20px; border-radius: 10px; }
        h2 { color: #ff4d7d; text-align: center; margin-bottom: 15px; font-size: 1.4rem; }
        .input-field { margin-bottom: 15px; text-align: right; }
        label { display: block; margin-bottom: 5px; color: #ff4d7d; font-weight: bold; font-size: 0.85rem; }
        input, select, textarea { 
          width: 100%; padding: 12px; border: 1.5px solid #f0f0f0; border-radius: 12px; 
          box-sizing: border-box; font-family: inherit; font-size: 1rem; background: #fafafa;
        }
        input:focus { border-color: #ff4d7d; background: #fff; outline: none; }
        .primary-btn { 
          background: #ff4d7d; color: white; border: none; padding: 15px; border-radius: 15px; 
          width: 100%; font-weight: bold; cursor: pointer; margin-top: 15px; font-size: 1.1rem;
          box-shadow: 0 4px 12px rgba(255, 77, 125, 0.2);
        }
        .secondary-btn { 
          background: none; color: #999; border: none; width: 100%; margin-top: 10px; 
          cursor: pointer; text-decoration: underline; font-size: 0.9rem;
        }
        .row { display: flex; gap: 10px; }
        .row > div { flex: 1; }
      `}</style>

      <div className="setup-card">
        <div className="step-indicator">
          <div className={`dot ${step === 1 ? 'active' : ''}`}></div>
          <div className={`dot ${step === 2 ? 'active' : ''}`}></div>
          <div className={`dot ${step === 3 ? 'active' : ''}`}></div>
        </div>

        {step === 1 && (
          <div>
            <h2>أهلاً بكِ في رقة ✨</h2>
            <div className="input-field">
              <label>الاسم</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="اكتبي اسمكِ هنا" />
            </div>
            <div className="row">
              <div className="input-field">
                <label>العمر</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <div className="input-field">
                <label>الوزن (كجم)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
              </div>
            </div>
            <div className="input-field">
              <label>المؤهل الدراسي</label>
              <select name="education_level" value={formData.education_level} onChange={handleChange}>
                <option value="ثانوي">ثانوي</option>
                <option value="جامعي">جامعي</option>
                <option value="ماجستير">ماجستير</option>
                <option value="دكتوراه">دكتوراه</option>
              </select>
            </div>
            <button className="primary-btn" onClick={() => setStep(2)} disabled={!formData.name}>المتابعة</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>بياناتكِ الأساسية</h2>
            <div className="input-field">
              <label>الحالة الاجتماعية</label>
              <select name="social_status" value={formData.social_status} onChange={handleChange}>
                <option value="دراسة">دراسة</option>
                <option value="مخطوبة">مخطوبة</option>
                <option value="متزوجة">متزوجة</option>
                <option value="مطلقة">مطلقة</option>
                <option value="أرملة">أرملة</option>
              </select>
            </div>
            <div className="input-field">
              <label>الحالة الصحية</label>
              <select name="health_status" value={formData.health_status} onChange={handleChange}>
                <option value="عزباء">عزباء</option>
                <option value="حامل">حامل</option>
                <option value="مرضعة">مرضعة</option>
                <option value="سن الأمل">سن الأمل</option>
              </select>
            </div>
            <div className="input-field">
              <label>عدد الأولاد</label>
              <input type="number" name="children_count" value={formData.children_count} onChange={handleChange} min="0" />
            </div>
            <button className="primary-btn" onClick={() => setStep(3)}>المتابعة</button>
            <button className="secondary-btn" onClick={() => setStep(1)}>رجوع</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>الخطوة الأخيرة</h2>
            <div className="input-field">
              <label>تاريخ آخر دورة</label>
              <input type="date" name="last_period" value={formData.last_period} onChange={handleChange} />
            </div>
            <div className="input-field">
              <label>الأمراض المزمنة (إن وجد)</label>
              <input type="text" name="chronic_diseases" value={formData.chronic_diseases} onChange={handleChange} placeholder="لا يوجد" />
            </div>
            <div className="input-field">
              <label>رسالتكِ في الحياة</label>
              <textarea name="life_mission" rows="2" value={formData.life_mission} onChange={handleChange} placeholder="طموحاتك باختصار..."></textarea>
            </div>
            <button className="primary-btn" onClick={handleFinalSubmit} disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ والدخول للتطبيق'}
            </button>
            <button className="secondary-btn" onClick={() => setStep(2)}>رجوع</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
