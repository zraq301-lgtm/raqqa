import React, { useState, useEffect } from 'react';
import { iconMap } from '../constants/iconMap';

const MenstrualTracker = () => {
  // استخدام أيقونة الصحة من الملف المرفوع
  const HealthIcon = iconMap.health;
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('menstrual_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [openAccordion, setOpenAccordion] = useState(null);
  const [prediction, setPrediction] = useState('');

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
  }, [data]);

  // منطق حاسبة الدورة
  const calculateCycle = () => {
    const startDate = data['سجل التواريخ_تاريخ البدء'];
    const duration = parseInt(data['سجل التواريخ_مدة الدورة']) || 28;
    if (startDate) {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + duration);
      setPrediction(nextDate.toLocaleDateString('ar-EG'));
    }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 3, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "رغبة بالبكاء"] },
    { id: 4, title: "الصحة الزوجية", emoji: "🥚", fields: ["تنبيهات الخصوبة", "تحذيرات طبية", "جفاف مهبلي"] },
    { id: 5, title: "التغذية", emoji: "💧", fields: ["شرب الماء", "مغنيسيوم", "تجنب الكافيين"] },
    { id: 6, title: "النشاط البدني", emoji: "🧘‍♀️", fields: ["يوغا", "مشي خفيف", "إطالة"] },
    { id: 7, title: "النظافة الشخصية", emoji: "🧼", fields: ["سجل التغيير", "منتجات الرعاية"] },
  ];

  // الستايلات المدمجة (Glassmorphism)
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    color: '#444'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '5px 0',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.5)',
    background: 'rgba(255,255,255,0.4)'
  };

  return (
    <div style={glassStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <HealthIcon size={24} color="#ad1457" />
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>نظام متابعة الحيض</h2>
      </div>

      {/* حاسبة الدورة */}
      <div style={{ background: 'rgba(255,255,255,0.3)', padding: '15px', borderRadius: '15px', marginBottom: '15px' }}>
        <button onClick={calculateCycle} style={{ background: '#ad1457', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>
          توقع الدورة القادمة
        </button>
        {prediction && <div style={{ marginTop: '10px', fontWeight: 'bold' }}>الموعد المتوقع: {prediction}</div>}
      </div>

      {/* الأكورديون */}
      {sections.map((sec) => (
        <div key={sec.id} style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <div 
            onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)}
            style={{ cursor: 'pointer', padding: '10px', display: 'flex', justifyContent: 'space-between' }}
          >
            <span>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          
          {openAccordion === sec.id && (
            <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '0.75rem' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={inputStyle}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
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

export default MenstrualTracker;
