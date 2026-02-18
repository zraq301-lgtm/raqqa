import React, { useState, useEffect } from 'react';
// التصحيح: الخروج مستويين للوصول من HealthPages إلى مجلد constants الرئيسي
import { iconMap } from '../../constants/iconMap'; [cite: 1]

const FitnessMonitor = () => {
  const Icon = iconMap.intimacy; [cite: 2]
  const [openIdx, setOpenIdx] = useState(null); [cite: 2]
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_fitness')) || {}); [cite: 3]

  // القوائم العشر المخصصة للرشاقة مع 7 مدخلات لكل منها
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
    { title: "العادات اليومية", emoji: "✅", fields: ["الاستيقاظ مبكراً", "الصيام المتقطع", "الجلوس الصحي", "التعرض للشمس", "الحركة المكتبية", "مضغ الطعام", "ملاحظات"] }
  ]; [cite: 3, 4, 5]

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)', direction: 'rtl' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6a1b9a', marginBottom: '15px' }}>
        <Icon size={24}/> <h2>متابعة الرشاقة والجمال</h2>
      </div>
      
      {sections.map((sec, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span>{sec.emoji} {sec.title}</span>
            <span>{openIdx === i ? '▲' : '▼'}</span>
          </div>
          {openIdx === i && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px' }}>
              {sec.fields.map(f => (
                <div key={f}>
                  <label style={{fontSize:'0.75rem', display: 'block', marginBottom: '4px'}}>{f}</label>
                  <input 
                    style={{ width: '100%', padding: '6px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.5)', boxSizing: 'border-box' }} 
                    value={data[f] || ''} 
                    onChange={e => {
                      const newData = {...data, [f]: e.target.value}; [cite: 8]
                      setData(newData); [cite: 9]
                      localStorage.setItem('lady_fitness', JSON.stringify(newData)); [cite: 9]
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  ); [cite: 5, 6, 7, 8, 9]
};

export default FitnessMonitor; [cite: 10]
