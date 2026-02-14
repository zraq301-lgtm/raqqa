import React, { useState, useRef, useEffect } from 'react';
// التصحيح: الوصول إلى constants [cite: 11]
import { iconMap } from '../../constants/iconMap';

const LactationHub = () => {
  // استخدام أيقونة المشاعر (feelings) [cite: 12]
  const Icon = iconMap.feelings;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_lactation')) || {});
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('lactation_history')) || []);
  const fileInputRef = useRef(null);

  // الأقسام كما هي في الكود الأصلي [cite: 14, 15]
  const sections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] },
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] },
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] },
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] }
  ];

  // دالة لتحديد نوع المدخل بناءً على الاسم
  const getInputType = (fieldName) => {
    if (fieldName.includes("تاريخ") || fieldName === "تاريخ اليوم") return "date";
    if (fieldName.includes("الوقت") || fieldName.includes("ساعة") || fieldName.includes("بداية") || fieldName.includes("نهاية")) return "time";
    return "text";
  };

  const handleSaveAndAnalyze = async () => {
    setLoading(true);
    try {
      // 1. حفظ في Neon DB [رابط api/save-health]
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'lactation', data: data })
      });

      // 2. تحليل البيانات عبر AI [رابط api/raqqa-ai]
      const prompt = `أنا مرضعة، هذه بياناتي الحالية: ${JSON.stringify(data)}. حلل الحالة كطبيب مختص وقدم نصائح محددة.`;
      const aiRes = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const resData = await aiRes.json();
      
      const newEntry = { id: Date.now(), text: resData.reply, date: new Date().toLocaleString() };
      setAiResponse(resData.reply);
      const newHistory = [newEntry, ...history];
      setHistory(newHistory);
      localStorage.setItem('lactation_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = (id) => {
    const filtered = history.filter(item => item.id !== id);
    setHistory(filtered);
    localStorage.setItem('lactation_history', JSON.stringify(filtered));
  };

  return (
    <div style={{ 
      background: 'linear-gradient(145deg, rgba(232, 245, 233, 0.4), rgba(129, 199, 132, 0.2))', 
      backdropFilter: 'blur(20px)', borderRadius: '30px', padding: '25px', 
      border: '1px solid rgba(255,255,255,0.4)', color: '#1b5e20', direction: 'rtl' 
    }}>
      
      {/* مؤشر الحالة (Progress Indicator) */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>مؤشر كفاية الرضاعة اليومي</div>
        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '10px' }}>
          <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #4caf50, #81c784)', borderRadius: '10px', boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icon size={28} color="#2e7d32"/> 
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>نظام الرضاعة الذكي</h2>
        </div>
        <button onClick={handleSaveAndAnalyze} style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', background: '#2e7d32', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'جاري التحليل...' : 'استشارة AI'}
        </button>
      </div>

      {sections.map((sec, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', marginBottom: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span>{sec.emoji} {sec.title}</span>
            <span>{openIdx === i ? '▲' : '▼'}</span>
          </div>
          {openIdx === i && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '15px', background: 'rgba(255,255,255,0.1)' }}>
              {sec.fields.map(f => (
                <div key={f}>
                  <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '4px', color: '#388e3c' }}>{f}</label>
                  <input 
                    type={getInputType(f)}
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid rgba(46, 125, 50, 0.2)', 
                      background: 'rgba(255,255,255,0.8)', color: '#1b5e20', outline: 'none' 
                    }} 
                    value={data[f] || ''} 
                    onChange={e => {
                      const newData = {...data, [f]: e.target.value};
                      setData(newData);
                      localStorage.setItem('lady_lactation', JSON.stringify(newData));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* منطقة الوسائط والردود */}
      <div style={{ marginTop: '25px', borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
          <button onClick={() => fileInputRef.current.click()} style={mediaBtnStyle} title="صورة">📷</button>
          <button style={mediaBtnStyle} title="تسجيل صوتي">🎤</button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" />
        </div>

        {aiResponse && (
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '15px', borderRadius: '20px', borderLeft: '5px solid #2e7d32', marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '5px' }}>👨‍⚕️ نصيحة الطبيب الذكي:</div>
            <div style={{ fontSize: '0.9rem' }}>{aiResponse}</div>
          </div>
        )}

        <div style={{ marginTop: '15px' }}>
          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px' }}>📜 الردود المحفوظة</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {history.map(item => (
              <div key={item.id} style={{ background: 'rgba(255,255,255,0.3)', padding: '10px', borderRadius: '15px', marginBottom: '10px', position: 'relative' }}>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>{item.date}</div>
                <div style={{ fontSize: '0.85rem' }}>{item.text}</div>
                <button onClick={() => deleteResponse(item.id)} style={{ position: 'absolute', top: '10px', left: '10px', border: 'none', background: 'none', cursor: 'pointer', color: '#d32f2f' }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const mediaBtnStyle = {
  width: '55px', height: '55px', borderRadius: '50%', border: 'none', 
  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
  fontSize: '1.4rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
};

export default LactationHub;
