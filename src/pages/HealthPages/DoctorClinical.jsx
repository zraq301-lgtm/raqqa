import React, { useState, useEffect } from 'react';
import { iconMap } from '../constants/iconMap';

const DoctorClinical = () => {
  const Icon = iconMap.insight; // تعبر عن التبصر والتحليل الطبي
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {});

  useEffect(() => {
    localStorage.setItem('lady_doctor', JSON.stringify(data));
  }, [data]);

  const categories = [
    { name: "العظام", icon: "🦴" }, { name: "العيون", icon: "👁️" }, 
    { name: "الأسنان", icon: "🦷" }, { name: "القلب", icon: "🫀" }, 
    { name: "التحاليل", icon: "📝" }, { name: "الجلدية", icon: "✨" },
    { name: "الباطنة", icon: "🩺" }, { name: "الأعصاب", icon: "🧠" },
    { name: "الجراحة", icon: "🩹" }, { name: "الصيدلية", icon: "💊" }
  ];

  const fields = ["التاريخ", "اسم الطبيب", "التشخيص", "الدواء", "الموعد القادم", "الملاحظات", "النتيجة"];

  const styles = {
    card: { background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)', marginBottom: '20px' },
    accItem: { background: 'rgba(255,255,255,0.2)', borderRadius: '15px', marginBottom: '8px' },
    input: { width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }
  };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1565c0', marginBottom: '20px' }}>
        <Icon size={24} /> <h2>متابعة الطبيب والعيادات</h2>
      </div>
      {categories.map((cat, i) => (
        <div key={i} style={styles.accItem}>
          <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span>{cat.icon} عيادة {cat.name}</span>
            <span>{openIdx === i ? '−' : '+'}</span>
          </div>
          {openIdx === i && (
            <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {fields.map(f => (
                <div key={f}>
                  <label style={{ fontSize: '0.7rem' }}>{f}</label>
                  <input style={styles.input} value={data[`${cat.name}_${f}`] || ''} onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DoctorClinical;
