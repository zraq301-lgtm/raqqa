import React, { useState, useMemo, useCallback } from 'react';
import { iconMap } from '../../constants/iconMap';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  
  // استخدام حالة ابتدائية آمنة مع التعامل مع الأخطاء [cite: 3]
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('lady_fitness_data');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error loading data", e);
      return {};
    }
  });

  // مصفوفة الأقسام مع إضافة معرفات فريدة للحقول لتجنب تداخل البيانات 
  const sections = useMemo(() => [
    { id: 'bio', title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "محيط الورك", "BMI", "نسبة العضلات", "ملاحظات الحيوية"] },
    { id: 'act', title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات المحروقة", "مستوى الشدة", "ملاحظات النشاط"] },
    { id: 'nut', title: "التغذية الصحية", emoji: "🥗", fields: ["عدد السعرات", "البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "جودة الأكل"] },
    { id: 'hyd', title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "مواعيد الشرب", "المشروبات العشبية", "الديتوكس", "مستوى الترطيب"] },
    { id: 'slp', title: "جودة النوم", emoji: "😴", fields: ["ساعات النوم", "وقت الاستيقاظ", "جودة النوم", "وقت الاسترخاء", "مستوى الطاقة"] },
    { id: 'mnt', title: "الصحة النفسية", emoji: "🧠", fields: ["مستوى التوتر", "تمارين التنفس", "الحالة المزاجية", "الدافعية", "التأمل"] },
    { id: 'sup', title: "المكملات والجمال", emoji: "✨", fields: ["الفيتامينات", "صحة الجلد", "صحة الشعر", "الكولاجين", "أوميجا 3"] },
    { id: 'chlng', title: "التحديات الأسبوعية", emoji: "🏆", fields: ["تحدي السكر", "تحدي الحركة", "الالتزام", "إنجاز الأسبوع", "خطة القادم"] },
    { id: 'horm', title: "الهرمونات والدورة", emoji: "🩸", fields: ["يوم الدورة", "الرغبة بالأكل", "احتباس السوائل", "تغير الوزن", "الحالة العامة"] },
    { id: 'daily', title: "العادات اليومية", emoji: "✅", fields: ["الاستيقاظ مبكراً", "الصيام المتقطع", "الجلوس الصحي", "التعرض الشمس", "مضغ الطعام"] }
  ], []);

  // تحسين دالة التحديث باستخدام useCallback للأداء [cite: 7, 8]
  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness_data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
      backdropFilter: 'blur(15px)', 
      borderRadius: '25px', 
      padding: '20px', 
      border: '1px solid rgba(255,255,255,0.3)', 
      direction: 'rtl',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6a1b9a', marginBottom: '20px' }}>
        <Icon size={28} /> 
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>متابعة الرشاقة والصحة</h2>
      </div>
      
      {sections.map((sec, i) => (
        <div key={sec.id} style={{ 
          background: 'rgba(255,255,255,0.3)', 
          borderRadius: '18px', 
          marginBottom: '12px', 
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <div 
            style={{ 
              padding: '18px', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontWeight: 'bold',
              color: '#4a148c'
            }} 
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>{sec.emoji}</span>
              {sec.title}
            </span>
            <span style={{ 
              transition: 'transform 0.3s', 
              transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)' 
            }}>▼</span>
          </div>
          
          {openIdx === i && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '12px', 
              padding: '15px', 
              borderTop: '1px solid rgba(255,255,255,0.2)',
              animation: 'fadeIn 0.4s ease'
            }}>
              {sec.fields.map((f) => {
                const fieldId = `${sec.id}_${f}`; // إنشاء معرف فريد لكل حقل
                return (
                  <div key={fieldId}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '5px', color: '#6a1b9a', fontWeight: '600' }}>
                      {f}
                    </label>
                    <input 
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '10px', 
                        border: '1px solid rgba(255,255,255,0.4)', 
                        background: 'rgba(255,255,255,0.7)', 
                        boxSizing: 'border-box', 
                        fontSize: '0.9rem',
                        outline: 'none'
                      }} 
                      value={data[fieldId] || ''} 
                      onChange={(e) => updateData(fieldId, e.target.value)}
                      placeholder="..."
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus { border-color: #9c27b0 ! insecurity !important; background: #fff !important; }
      `}</style>
    </div>
  );
};

export default PregnancyMonitor;
