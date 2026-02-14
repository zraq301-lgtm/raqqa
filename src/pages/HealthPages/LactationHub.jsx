import React, { useState, useRef, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';

const LactationHub = () => {
  const Icon = iconMap.feelings;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_lactation')) || {});
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('lactation_history')) || []);
  const fileInputRef = useRef(null);

  const sections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] },
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] },
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] },
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] }
  ];

  const getInputType = (fieldName) => {
    if (fieldName.includes("تاريخ") || fieldName === "تاريخ اليوم") return "date";
    if (fieldName.includes("الوقت") || fieldName.includes("ساعة") || fieldName.includes("بداية") || fieldName.includes("نهاية")) return "time";
    return "text";
  };

  const handleSaveAndAnalyze = async () => {
    setLoading(true);
    try {
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'lactation', data: data })
      });

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
      background: 'linear-gradient(160deg, #96b896 0%, #739673 100%)', 
      backdropFilter: 'blur(20px)', borderRadius: '40px', padding: '30px', 
      border: '8px solid rgba(255,255,255,0.1)', color: '#fff', direction: 'rtl',
      boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
    }}>
      
      {/* الجزء العلوي المستلهم من Dribbble الجديد */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
         <div style={{ display: 'flex', gap: '10px' }}>
            <div style={statCircleStyle}>28</div>
            <div style={{...statCircleStyle, background: '#4e6d4e'}}>20</div>
            <div style={statCircleStyle}><Icon size={18} /></div>
         </div>
         <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>سجل الإرضاع الذكي</h2>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Lactation History Tracker</div>
         </div>
      </div>

      {/* مؤشر الحالة المتوهج */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ width: '100%', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '20px', padding: '2px' }}>
          <div style={{ 
            width: '75%', height: '100%', 
            background: 'linear-gradient(90deg, #c5e1a5, #fff)', 
            borderRadius: '20px',
            boxShadow: '0 0 15px rgba(255,255,255,0.4)' 
          }}></div>
        </div>
      </div>

      {/* القوائم المنسدلة بتصميم البطاقات */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {sections.map((sec, i) => (
          <div key={i} style={{ 
            background: openIdx === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)', 
            borderRadius: '25px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <div style={{ padding: '18px 25px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} 
                 onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sec.emoji} {sec.title}</span>
              <span style={{ background: '#fff', color: '#739673', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                {openIdx === i ? '✕' : '＋'}
              </span>
            </div>
            
            {openIdx === i && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '20px', background: 'rgba(0,0,0,0.05)' }}>
                {sec.fields.map(f => (
                  <div key={f}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '6px', paddingRight: '10px' }}>{f}</label>
                    <input 
                      type={getInputType(f)}
                      style={{ 
                        width: '100%', padding: '12px 15px', borderRadius: '20px', border: 'none', 
                        background: '#fff', color: '#333', fontSize: '0.9rem', outline: 'none',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
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
      </div>

      {/* منطقة الأزرار والـ AI */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={handleSaveAndAnalyze} style={analyzeBtnStyle}>
          {loading ? '...تحليل' : 'تحليل الحالة بالذكاء الاصطناعي'}
        </button>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '25px 0' }}>
          <button onClick={() => fileInputRef.current.click()} style={roundBtnStyle}>📷</button>
          <button style={roundBtnStyle}>🎤</button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" />
        </div>

        {aiResponse && (
          <div style={{ background: '#fff', color: '#333', padding: '20px', borderRadius: '25px', textAlign: 'right', marginBottom: '20px', borderRight: '8px solid #c5e1a5' }}>
            <strong style={{ color: '#739673' }}>👨‍⚕️ الطبيب الذكي:</strong>
            <p style={{ margin: '10px 0 0', fontSize: '0.95rem', lineHeight: '1.6' }}>{aiResponse}</p>
          </div>
        )}

        <div style={{ maxHeight: '200px', overflowY: 'auto', paddingLeft: '10px' }}>
          {history.map(item => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '20px', marginBottom: '10px', position: 'relative', textAlign: 'right' }}>
              <small style={{ opacity: 0.7, fontSize: '0.7rem' }}>{item.date}</small>
              <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>{item.text}</div>
              <button onClick={() => deleteResponse(item.id)} style={{ position: 'absolute', top: '15px', left: '15px', border: 'none', background: 'none', color: '#ff8a80', cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// أنماط العناصر المستلهمة من التصميم
const statCircleStyle = {
  width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold'
};

const analyzeBtnStyle = {
  width: '100%', padding: '15px', borderRadius: '25px', border: 'none',
  background: '#fff', color: '#739673', fontWeight: '800', fontSize: '1rem',
  cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
};

const roundBtnStyle = {
  width: '60px', height: '60px', borderRadius: '50%', border: 'none',
  background: 'rgba(255,255,255,0.2)', fontSize: '1.5rem', color: '#fff',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(10px)', transition: '0.3s'
};

export default LactationHub;
