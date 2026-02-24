import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // نظام التتبع للكروت

  const [formData, setFormData] = useState({
    name: '', age: '', social_status: 'دراسة', health_status: 'عزباء',
    education_level: 'جامعي', hobbies: '', life_mission: '', weight: '',
    children_count: 0, chronic_diseases: 'لا يوجد', last_period: '',
  });

  const totalSteps = 4; // عدد الكروت الإجمالي

  const generateUserId = () => {
    return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalData = {
      user_id: generateUserId(),
      ...formData,
      created_at: new Date().toISOString()
    };

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: finalData
      };

      const response = await CapacitorHttp.post(options);
      if (response.status === 200 || response.status === 201) {
        navigate('/health'); // العودة لصفحة الصحة بعد الحفظ [cite: 50]
      } else {
        alert("حدث خطأ أثناء حفظ البيانات.");
      }
    } catch (err) {
      alert("حدث خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-wizard-container">
      <style>{`
        .profile-wizard-container {
          direction: rtl;
          background-color: #fff5f7;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Tajawal', sans-serif;
        }
        .step-card {
          background: white;
          width: 100%;
          max-width: 450px;
          padding: 40px 30px;
          border-radius: 30px;
          box-shadow: 0 15px 35px rgba(255, 77, 125, 0.15);
          text-align: center;
          position: relative;
          border: 2px solid #ff4d7d20;
        }
        .progress-bar {
          height: 6px;
          background: #eee;
          border-radius: 10px;
          margin-bottom: 30px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #ff4d7d;
          transition: width 0.4s ease;
        }
        h2 { color: #ff4d7d; margin-bottom: 20px; font-size: 1.5rem; }
        .form-group { text-align: right; margin-bottom: 20px; }
        label { display: block; margin-bottom: 10px; font-weight: bold; color: #555; }
        input, select, textarea {
          width: 100%;
          padding: 15px;
          border: 1.5px solid #eee;
          border-radius: 15px;
          background: #f9f9f9;
          font-size: 1rem;
        }
        .btn-row { display: flex; gap: 10px; margin-top: 25px; }
        .next-btn, .submit-btn {
          flex: 2;
          padding: 15px;
          background: #ff4d7d;
          color: white;
          border: none;
          border-radius: 15px;
          font-weight: bold;
          cursor: pointer;
        }
        .back-btn {
          flex: 1;
          padding: 15px;
          background: #eee;
          color: #666;
          border: none;
          border-radius: 15px;
          cursor: pointer;
        }
      `}</style>

      <div className="step-card">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>

        {currentStep === 1 && (
          <div className="step-content">
            <h2>أهلاً بكِ في رقة ✨</h2>
            <div className="form-group">
              <label>ما هو اسمكِ؟</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="اكتبي اسمكِ هنا" />
            </div>
            <div className="form-group">
              <label>كم عمركِ؟</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} />
            </div>
            <button className="next-btn" onClick={nextStep} disabled={!formData.name}>المتابعة</button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h2>حالكِ الاجتماعي والصحي</h2>
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
            <div className="btn-row">
              <button className="back-btn" onClick={prevStep}>رجوع</button>
              <button className="next-btn" onClick={nextStep}>المتابعة</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h2>بيانات تهمنا</h2>
            <div className="form-group">
              <label>تاريخ آخر دورة</label>
              <input type="date" name="last_period" value={formData.last_period} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>عدد الأولاد</label>
              <input type="number" name="children_count" value={formData.children_count} onChange={handleChange} />
            </div>
            <div className="btn-row">
              <button className="back-btn" onClick={prevStep}>رجوع</button>
              <button className="next-btn" onClick={nextStep}>المتابعة</button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content">
            <h2>رسالتكِ في الحياة</h2>
            <div className="form-group">
              <label>ما هي هواياتكِ؟</label>
              <input type="text" name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="القراءة، الرياضة..." />
            </div>
            <div className="form-group">
              <label>رسالتكِ بالحياة</label>
              <textarea name="life_mission" rows="3" value={formData.life_mission} onChange={handleChange} placeholder="اكتبي طموحاتكِ..."></textarea>
            </div>
            <div className="btn-row">
              <button className="back-btn" onClick={prevStep}>رجوع</button>
              <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ وإنهاء'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
