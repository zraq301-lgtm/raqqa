import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_pregnancy')) || {});
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [savedResponses, setSavedResponses] = useState(() => JSON.parse(localStorage.getItem('pregnancy_ai_history')) || []);
  const fileInputRef = useRef(null);

  const sections = [
    { title: "نمو الجنين", emoji: "⚖️", fields: ["الوزن", "الطول", "النبض", "الحركة", "حجم الرأس", "طول الفخذ", "وضعية الجنين", "كمية السائل", "ركلات اليوم", "ملاحظات"] },
    { title: "صحة الأم", emoji: "🩺", fields: ["الضغط", "السكر", "الوزن", "الغثيان", "تورم القدم", "الصداع", "الشهية", "النوم", "الإرهاق", "ملاحظات"] },
    { title: "الفحوصات", emoji: "🖥️", fields: ["السونار", "دم", "بول", "تاريخ الفحص", "اسم الطبيب", "المكان", "التكلفة", "النتيجة", "موعد القادم", "ملاحظات"] },
    { title: "سجل المكملات", emoji: "💊", fields: ["فوليك", "حديد", "كالسيوم", "أوميجا3", "فيتامين د", "وقت الجرعة", "الكمية", "تاريخ البدء", "تاريخ الانتهاء", "ملاحظات"] },
    { title: "الاستعداد للولادة", emoji: "👜", fields: ["حقيبة المشفى", "ملابس البيبي", "أغراض الأم", "أوراق رسمية", "خطة الولادة", "اسم المستشفى", "رقم الطوارئ", "تجهيز المنزل", "الميزانية", "ملاحظات"] },
    { title: "تطور الأسابيع", emoji: "📅", fields: ["الأسبوع الحالي", "الشهر", "موعد الولادة", "أيام متبقية", "تطور المرحلة", "نصيحة الأسبوع", "تغيرات جسدية", "الحالة النفسية", "تاريخ اليوم", "ملاحظات"] },
    { title: "التواصل مع الجنين", emoji: "🎈", fields: ["تفاعل مع الصوت", "تفاعل مع الضوء", "أغاني/أذكار", "كتابة رسالة", "اسم مقترح", "تجهيز الغرفة", "أول صورة سونار", "شعور الأب", "لحظات مميزة", "ملاحظات"] }
  ];

  // دالة حفظ البيانات في DB وتحليلها عبر AI
  const handleSyncAndAnalyze = async () => {
    setLoading(true);
    try {
      // 1. حفظ البيانات في Neon DB
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pregnancy', details: data })
      });

      // 2. تحليل البيانات عبر AI (كطبيب)
      const aiQuery = `كمختص، حلل بيانات حملي الحالية واعطني نصيحة: ${JSON.stringify(data)}`;
      const aiRes = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiQuery })
      });
      const aiData = await aiRes.json();
      
      const newResponse = { id: Date.now(), text: aiData.reply, date: new Date().toLocaleString() };
      setAiResponse(aiData.reply);
      const updatedHistory = [newResponse, ...savedResponses];
      setSavedResponses(updatedHistory);
      localStorage.setItem('pregnancy_ai_history', JSON.stringify(updatedHistory));

    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = (id) => {
    const filtered = savedResponses.filter(r => r.id !== id);
    setSavedResponses(filtered);
    localStorage.setItem('pregnancy_ai_history', JSON.stringify(filtered));
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, rgba(255,182,193,0.4), rgba(138,43,226,0.2))', 
      backdropFilter: 'blur(20px)', borderRadius: '30px', padding: '25px', 
      border: '1px solid rgba(255,255,255,0.4)', color: '#4a148c', fontFamily: 'Arial, sans-serif' 
    }}>
      
      {/* مؤشر التقدم (Progress Tracker) مستوحى من Dribbble */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>تقدم المرحلة الحالية</div>
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.3)', borderRadius: '10px', marginTop: '8px' }}>
          <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #ff4081, #7c4dff)', borderRadius: '10px', boxShadow: '0 0 10px rgba(124,77,255,0.5)' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon size={28} color="#7b1fa2"/> 
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>متابعة الحمل الذكية</h2>
        </div>
        <button onClick={handleSyncAndAnalyze} style={{ padding: '8px 15px', borderRadius: '12px', border: 'none', background: '#7b1fa2', color: '#fff', cursor: 'pointer' }}>
          {loading ? 'جاري التحليل...' : 'تحليل الطبيب AI'}
        </button>
      </div>
      
      {sections.map((sec, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span>
            <span style={{ fontSize: '0.8rem' }}>{openIdx === i ? '▲' : '▼'}</span>
          </div>
          {openIdx === i && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px', paddingTop: '0' }}>
              {sec.fields.map(f => (
                <div key={f}>
                  <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '4px', opacity: 0.8 }}>{f}</label>
                  <input 
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.6)', outline: 'none' }} 
                    value={data[f] || ''} 
                    onChange={e => {
                      const newData = {...data, [f]: e.target.value};
                      setData(newData);
                      localStorage.setItem('lady_pregnancy', JSON.stringify(newData));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* منطقة الأدوات والردود */}
      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
          <button title="فتح الكاميرا" style={actionBtnStyle} onClick={() => fileInputRef.current.click()}>📷</button>
          <button title="تسجيل صوتي" style={actionBtnStyle}>🎤</button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" />
        </div>

        {aiResponse && (
          <div style={{ background: 'rgba(123, 31, 162, 0.1)', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #7b1fa2' }}>
            <strong style={{ display: 'block', marginBottom: '5px' }}>👨‍⚕️ توصية الطبيب الذكي:</strong>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>{aiResponse}</p>
          </div>
        )}

        <h3 style={{ fontSize: '1rem' }}>📜 سجل الردود السابقة</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {savedResponses.map(res => (
            <div key={res.id} style={{ background: 'rgba(255,255,255,0.3)', padding: '10px', borderRadius: '12px', marginBottom: '8px', position: 'relative' }}>
              <small style={{ fontSize: '0.6rem', color: '#666' }}>{res.date}</small>
              <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>{res.text}</p>
              <button onClick={() => deleteResponse(res.id)} style={{ position: 'absolute', top: '5px', left: '10px', border: 'none', background: 'transparent', color: 'red', cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const actionBtnStyle = {
  width: '50px', height: '50px', borderRadius: '50%', border: 'none', 
  background: 'white', fontSize: '1.2rem', cursor: 'pointer', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export default PregnancyMonitor;
