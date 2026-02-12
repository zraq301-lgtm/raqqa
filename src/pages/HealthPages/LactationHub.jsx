import React, { useState } from 'react';
import { iconMap } from '../constants/iconMap';

const LactationHub = () => {
  const Icon = iconMap.feelings;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_lactation')) || {});

  const sections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] },
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] },
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] },
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] }
  ];

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2e7d32', marginBottom: '15px' }}>
        <Icon size={24}/> <h2>نظام الرضاعة</h2>
      </div>
      {sections.map((sec, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span>{sec.emoji} {sec.title}</span>
            <span>{openIdx === i ? '−' : '+'}</span>
          </div>
          {openIdx === i && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', padding: '12px' }}>
              {sec.fields.map(f => (
                <div key={f}><input style={{ width: '100%', padding: '5px', borderRadius: '5px', border: 'none', background: 'white' }} 
                placeholder={f} value={data[f] || ''} onChange={e => {
                  const newData = {...data, [f]: e.target.value};
                  setData(newData);
                  localStorage.setItem('lady_lactation', JSON.stringify(newData));
                }}/></div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LactationHub;
