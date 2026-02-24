import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';
import './ProfileSetup.css'; // تأكدي من إنشاء ملف التنسيق أو إضافته لـ App.css

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

    // تجميع البيانات النهائية للإرسال
    const finalData = {
      user_id: userId,
      ...formData,
      created_at: createdAt
    };

    try {
      // منطق الاتصال الخارجي عبر CapacitorHttp
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: finalData
      };

      const response = await CapacitorHttp.post(options);

      if (response.status === 200 || response.status === 201) {
        console.log("تم حفظ البيانات بنجاح:", response.data);
        // التوجيه إلى صفحة الصحة بعد النجاح كما طلبت
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
      <div className="profile-header">
        <h2>إعداد ملفكِ الشخصي</h2>
        <p>ساعدينا لنخصص لكِ تجربة رقة فريدة</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* الاسم */}
        <div className="form-group">
          <label>الاسم</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="كيف ننباديكِ؟" />
        </div>

        <div className="form-row">
          {/* العمر */}
          <div className="form-group">
            <label>العمر</label>
            <input type="number" name="age" min="15" max="80" required value={formData.age} onChange={handleChange} />
          </div>
          {/* الوزن */}
          <div className="form-group">
            <label>الوزن (كجم)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
          </div>
        </div>

        {/* الحالة الاجتماعية */}
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

        {/* الحالة الصحية */}
        <div className="form-group">
          <label>الحالة الصحية</label>
          <select name="health_status" value={formData.health_status} onChange={handleChange}>
            <option value="عزباء">عزباء</option>
            <option value="حامل">حامل</option>
            <option value="مرضعة">مرضعة</option>
            <option value="سن الأمل">سن الأمل</option>
          </select>
        </div>

        {/* المؤهل الدراسي */}
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
          {/* عدد الأولاد */}
          <div className="form-group">
            <label>عدد الأولاد</label>
            <input type="number" name="children_count" min="0" max="10" value={formData.children_count} onChange={handleChange} />
          </div>
          {/* تاريخ آخر دورة */}
          <div className="form-group">
            <label>تاريخ آخر دورة</label>
            <input type="date" name="last_period" value={formData.last_period} onChange={handleChange} />
          </div>
        </div>

        {/* الهوايات */}
        <div className="form-group">
          <label>الهوايات</label>
          <input type="text" name="hobbies" placeholder="القراءة، الرياضة..." value={formData.hobbies} onChange={handleChange} />
        </div>

        {/* الأمراض المزمنة */}
        <div className="form-group">
          <label>الأمراض المزمنة (إن وجدت)</label>
          <input type="text" name="chronic_diseases" placeholder="سكري، ضغط، تكيسات..." value={formData.chronic_diseases} onChange={handleChange} />
        </div>

        {/* الرسالة في الحياة */}
        <div className="form-group">
          <label>رسالتكِ في الحياة</label>
          <textarea name="life_mission" rows="3" placeholder="اكتبي مقالاً قصيراً عن طموحاتكِ..." value={formData.life_mission} onChange={handleChange}></textarea>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ والدخول لعالم رقة'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
