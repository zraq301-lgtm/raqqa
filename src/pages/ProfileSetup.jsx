import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // حالة البيانات الأولية للحقول المطلوبة
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

  // دالة لتوليد معرف فريد (UUID) تلقائياً
  const generateUserId = () => {
    return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = generateUserId();
    const createdAt = new Date().toISOString();

    const finalData = {
      user_id: userId,
      ...formData,
      created_at: createdAt
    };

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: finalData
      };

      const response = await CapacitorHttp.post(options);

      if (response.status === 200 || response.status === 201) {
        console.log("تم حفظ البيانات بنجاح:", response.data);
        navigate('/health');
      } else {
        alert("حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error("فشل الاتصال الأصلي:", err);
      alert("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-setup-container">
      {/* دمج التنسيقات مباشرة لحل مشكلة Build failed */}
      <style>{`
        :root {
          --female-pink: #ff4d7d;
          --female-pink-light: rgba(255, 77, 125, 0.15);
          --soft-bg: #fff5f7;
          --glass-white: rgba(255, 255, 255, 0.95);
        }

        .profile-setup-container {
          direction: rtl;
          background-color: var(--soft-bg);
          min-height: 100vh;
          padding: 20px;
          padding-bottom: 40px;
          font-family: 'Tajawal', sans-serif;
        }

        .profile-header {
          text-align: center;
          margin-bottom: 30px;
          padding-top: 20px;
        }

        .profile-header h2 {
          color: var(--female-pink);
          font-size: 1.8rem;
          margin-bottom: 10px;
        }

        .profile-header p {
          color: #666;
          font-size: 1rem;
        }

        .profile-form {
          background: var(--glass-white);
          padding: 25px;
          border-radius: 25px;
          box-shadow: 0 10px 25px rgba(255, 77, 125, 0.1);
          max-width: 500px;
          margin: 0 auto;
          border: 1px solid var(--female-pink-light);
        }

        .form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        label {
          color: var(--female-pink);
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 0.95rem;
          display: block;
        }

        input, select, textarea {
          padding: 12px 15px;
          border: 1.5px solid #eee;
          border-radius: 12px;
          font-family: inherit;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
          background: #f9f9f9;
        }

        input:focus, select:focus, textarea:focus {
          border-color: var(--female-pink);
          background: #fff;
          box-shadow: 0 0 0 4px var(--female-pink-light);
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: var(--female-pink);
          color: white;
          border: none;
          border-radius: 15px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 20px;
          box-shadow: 0 5px 15px rgba(255, 77, 125, 0.3);
        }

        .submit-btn:disabled {
          background: #ccc;
          box-shadow: none;
        }

        .submit-btn:active {
          transform: scale(0.98);
        }

        textarea {
          resize: none;
        }
      `}</style>

      <div className="profile-header">
        <h2>إعداد ملفكِ الشخصي</h2>
        <p>ساعدينا لنخصص لكِ تجربة رقة فريدة</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>الاسم</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="كيف نناديكِ؟" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>العمر</label>
            <input type="number" name="age" min="15" max="80" required value={formData.age} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>الوزن (كجم)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
          </div>
        </div>

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

        <div className="form-row">
          <div className="form-group">
            <label>عدد الأولاد</label>
            <input type="number" name="children_count" min="0" max="10" value={formData.children_count} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>تاريخ آخر دورة</label>
            <input type="date" name="last_period" value={formData.last_period} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>الهوايات</label>
          <input type="text" name="hobbies" placeholder="القراءة، الرياضة..." value={formData.hobbies} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>الأمراض المزمنة (إن وجدت)</label>
          <input type="text" name="chronic_diseases" placeholder="سكري، ضغط، تكيسات..." value={formData.chronic_diseases} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>رسالتكِ في الحياة</label>
          <textarea name="life_mission" rows="3" placeholder="اكتبي طموحاتكِ باختصار..." value={formData.life_mission} onChange={handleChange}></textarea>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ والدخول لعالم رقة'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
