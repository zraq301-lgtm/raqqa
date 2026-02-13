import React, { useState, useEffect } from 'react';
// التصحيح: الخروج مستويين للوصول إلى مجلد src ثم constants
import { iconMap } from '../../constants/iconMap'; 

const FitnessWellness = () => {
  const Icon = iconMap.health;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_fitness')) || {});

  useEffect(() => {
    localStorage.setItem('lady_fitness', JSON.stringify(data));
  }, [data]);

  const sections = [
    { title: "قياسات الجسم", emoji: "📏", fields: ["الوزن", "الطول", "الخصر", "الورك", "الصدر", "الرقبة", "الفخذ", "الذراع", "نسبة الدهون", "كتلة العضلات"] },
    { title: "السعرات الحرارية", emoji: "🥗", fields: ["الفطور", "الغداء", "العشاء", "سناك 1", "سناك 2", "المجموع", "المحروقة", "الهدف", "بروتين", "كربوهيدرات"] },
    { title: "شرب الماء", emoji: "💧", fields: ["كوب 1", "كوب 2", "كوب 3", "كوب 4", "كوب 5", "كوب 6", "كوب 7", "كوب 8", "تذكير", "المجموع"] },
    { title: "نوع التمرين", emoji: "💪", fields: ["مقاومة", "كارديو", "يوغا", "زمن التمرين", "شدة التمرين", "تاريخ اليوم", "النبض", "ملاحظات", "المدرب", "المكان"] },
    { title: "جودة النوم", emoji: "😴", fields: ["ساعة النوم", "ساعة الاستيقاظ", "العميق", "الأحلام", "الاضطرابات", "المجموع", "الراحة", "تاريخ", "القلق", "ملاحظات"] },
    { title: "الخطوات", emoji: "👟", fields: ["العدد اليومي", "الهدف", "المسافة", "الوقت", "المكان", "الحذاء المستخدم", "السرعة", "الرفيق", "الطقس", "ملاحظات"] },
    { title: "الصيام المتقطع", emoji: "⏱️", fields: ["بداية الصيام", "نهاية الصيام", "عدد الساعات", "أول وجبة", "آخر وجبة", "المشروبات", "الوزن صباحاً", "الشعور", "تاريخ", "ملاحظات"] }
  ];

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2e7d32', marginBottom: '15px' }}>
        <Icon size={24} /> <h2>الرشاقة والوزن المثالي</h2>
      </div>
      {sections.map((sec, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '15px', marginBottom: '8px', overflow: 'hidden' }}>
          <div 
            style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} 
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <span>{sec.emoji} {sec.title}</span>
            <span>{openIdx === i ? '▲' : '▼'}</span>
          </div>
          {openIdx === i && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', padding: '15px' }}>
              {sec.fields.map(f => (
                <input 
                  key={f} 
                  placeholder={f} 
                  style={{ padding: '8px', border: 'none', borderRadius: '8px', background: 'rgba(255,255,255,0.6)' }} 
                  value={data[f] || ''} 
                  onChange={e => setData({...data, [f]: e.target.value})} 
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FitnessWellness;
