import React, { useState, useEffect } from 'react';
import { iconMap } from '../constants/iconMap';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_pregnancy')) || {});

  const sections = [
    { title: "نمو الجنين", emoji: "⚖️", fields: ["الوزن", "الطول", "النبض", "الحركة", "حجم الرأس", "طول الفخذ", "وضعية الجنين", "كمية السائل", "ركلات اليوم", "ملاحظات"] },
    { title: "صحة الأم", emoji: "🩺", fields: ["الضغط", "السكر", "الوزن", "الغثيان", "تورم القدم", "الصداع", "الشهية", "النوم", "الإرهاق", "ملاحظات"] },
    { title: "الفحوصات", emoji: "🖥️", fields: ["السونار", "دم", "بول", "تاريخ الفحص", "اسم الطبيب", "المكان", "التكلفة", "النتيجة", "موعد القادم", "ملاحظات"] },
    { title: "سجل المكملات", emoji: "💊", fields: ["فوليك", "حديد", "كالسيوم", "أوميجا3", "فيتامين د", "وقت الجرعة", "الكمية", "تاريخ البدء", "تاريخ الانتهاء", "ملاحظات"] },
    { title: "الاستعداد للولادة", emoji: "🌬️", fields: ["تمارين التنفس", "حقيبة المشفى", "اسم المشفى", "خطة الولادة", "رقم الطوارئ", "تجهيز الملابس", "سرير الطفل", "حفاضات", "رضاعات", "ملاحظات"] },
    { title: "النشاط البدني", emoji: "🏊‍♀️", fields: ["سباحة", "مشي", "حوض", "مدة التمرين", "عدد المرات", "معدل النبض", "الراحة", "نوع التمرين", "المدرب", "ملاحظات"] },
    { title: "التغذية", emoji: "🥦", fields: ["سعرات", "بروتين", "ألياف", "ماء", "خضار", "فواكه", "البعد عن السكر", "منتجات ألبان", "وجبات خفيفة", "ملاحظات"] }
  ];

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6a1b9a', marginBottom: '15px' }}>
        <Icon size={24}/> <h2>متابعة الحمل</h2>
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
                <div key={f}><label style={{fontSize:'0.75rem'}}>{f}</label>
                <input style={{ width: '100%', padding: '6px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.5)' }} 
                value={data[f] || ''} onChange={e => {
                  const newData = {...data, [f]: e.target.value};
                  setData(newData);
                  localStorage.setItem('lady_pregnancy', JSON.stringify(newData));
                }}/></div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PregnancyMonitor;
