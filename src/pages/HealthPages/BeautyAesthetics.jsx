import React, { useState, useEffect } from 'react';
// التصحيح: الخروج مستويين للوصول من HealthPages إلى src ثم constants
import { iconMap } from '../../constants/iconMap'; 

const BeautyAesthetics = () => {
  // استخدام أيقونة الجمال (beauty) من الخريطة المرفوعة
  const Icon = iconMap.beauty; 
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_beauty')) || {});

  useEffect(() => {
    localStorage.setItem('lady_beauty', JSON.stringify(data));
  }, [data]);

  const sections = [
    { title: "روتين البشرة", emoji: "🧼", fields: ["غسول صباحي", "مرطب", "واقي شمس", "سيروم", "كريم ليلي", "تقشير أسبوعي", "ماسك", "تحت العين", "تونر", "ملاحظات"] },
    { title: "صحة الشعر", emoji: "🌿", fields: ["نوع الشامبو", "بلسم", "حمام زيت", "فيتامينات", "معدل التساقط", "صبغة", "قص الأطراف", "قشرة", "لمعان", "ملاحظات"] },
    { title: "العناية بالأظافر", emoji: "💅", fields: ["ترطيب", "مقوي", "برد الأظافر", "لون المناكير", "جلد ميت", "فطريات", "طول", "شكل", "ملاحظات", "موعد الصالون"] },
    { title: "مكافحة الشيخوخة", emoji: "✨", fields: ["ريتينول", "كولاجين", "تجاعيد العين", "نضارة", "مساج وجه", "شرب ماء", "نوم مبكر", "واقي حرارة", "ملاحظات", "نتائج"] },
    { title: "العناية بالجسم", emoji: "🧴", fields: ["لوشن", "عطر", "تقشير", "ليزر", "حمام مغربي", "ترطيب اليدين", "كعب القدم", "نعومة", "ملاحظات", "منتجات"] },
    { title: "الملابس والأناقة", emoji: "👗", fields: ["تنسيق اليوم", "ألوان", "اكسسوار", "عطر", "حقيبة", "حذاء", "كي الملابس", "مشتريات", "مناسبة قادمة", "ملاحظات"] },
    { title: "الصحة الجمالية", emoji: "🧬", fields: ["تأثير الهرمونات", "نوم الجمال", "توتر", "زنك", "حديد", "شحوب", "هالات سوداء", "لمعان العين", "تاريخ اليوم", "ملاحظات"] }
  ];

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ec407a', marginBottom: '15px' }}>
        <Icon size={24} /> <h2>الأناقة والجمال</h2>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '15px' }}>
              {sec.fields.map(f => (
                <div key={f}>
                  <label style={{fontSize: '0.7rem'}}>{f}</label>
                  <input 
                    style={{ width: '100%', padding: '6px', border: 'none', borderRadius: '8px', background: 'rgba(255,255,255,0.5)' }} 
                    value={data[f] || ''} 
                    onChange={e => setData({...data, [f]: e.target.value})} 
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

export default BeautyAesthetics;
