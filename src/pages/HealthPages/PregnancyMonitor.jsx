import React, { useState } from 'react';
import { iconMap } from '../../constants/iconMap';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('lady_fitness');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // تم تنظيف المصفوفة تماماً لضمان عدم وجود أخطاء في الأقواس
  const sections = [
    { title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "محيط الورك", "كتلة الجسم BMI", "نسبة العضلات", "ملاحظات"] },
    { title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات المحروقة", "مستوى الشدة", "وقت التمرين", "ملاحظات"] },
    { title: "التغذية الصحية", emoji: "🥗", fields: ["عدد السعرات", "كمية البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "عدد الوجبات", "جودة الأكل"] },
    { title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "مواعيد الشرب", "المشروبات العشبية", "الديتوكس", "مستوى الترطيب", "تجنب السكريات", "ملاحظات"] },
    { title: "جودة النوم", emoji: "😴", fields: ["ساعات النوم", "وقت الاستيقاظ", "جودة النوم", "وقت الاسترخاء", "تجنب الكافيين", "القيلولة", "مستوى الطاقة"] },
    { title: "الصحة النفسية", emoji: "🧠", fields: ["مستوى التوتر", "تمارين التنفس", "الحالة المزاجية", "الدافعية", "التأمل", "عادات إيجابية", "تحديات"] },
    { title: "المكملات والجمال", emoji: "✨", fields: ["الفيتامينات", "صحة الجلد", "صحة الشعر", "الكولاجين", "معدل الحرق", "أوميجا 3", "ملاحظات طبية"] },
    { title: "التحديات الأسبوعية", emoji: "🏆", fields: ["تحدي السكر", "تحدي الحركة", "الالتزام", "أصعب عقبة", "إنجاز الأسبوع", "خطة القادم", "ملاحظات"] },
    { title: "الهرمونات والدورة", emoji: "🩸", fields: ["يوم الدورة", "الرغبة بالأكل", "احتباس السوائل", "تغير الوزن", "نوع الرياضة", "ألم الجسم", "الحالة العامة"] },
    { title: "العادات اليومية", emoji: "✅", fields: ["الاستيقاظ مبكراً", "الصيام المتقطع", "الجلوس الصحي", "التعرض الشمس", "الحركة المكتبية", "مضغ الطعام", "ملاحظات"] }
  ];

  const updateData = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    localStorage.setItem('lady_fitness', JSON.stringify(newData));
  };

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)', direction: 'rtl' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6a1b9a', marginBottom: '15px' }}>
        <Icon size={24}/> 
        <h2 style={{ margin: 0 }}>متابعة الرشاقة</h2>
      </div>
      
      {sections.map((sec, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '15px', marginBottom: (i === sections.length - 1) ? '0' : '10px', overflow: 'hidden' }}>
          <div 
            style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }} 
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <span>{sec.emoji} {sec.title}</span>
            <span style={{ fontSize: '0.8rem' }}>{openIdx === i ? '▲' : '▼'}</span>
          </div>
          
          {openIdx === i && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              {sec.fields.map((f) => (
                <div key={f}>
                  <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '4px', color: '#4a148c' }}>{f}</label>
                  <input 
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.6)', boxSizing: 'border-box', fontSize: '0.85rem' }} 
                    value={data[f] || ''} 
                    onChange={(e) => updateData(f, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PregnancyMonitor;
