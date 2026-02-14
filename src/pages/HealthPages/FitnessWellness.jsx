import React, { useState, useRef, useEffect } from 'react';
// استيراد الأيقونات من المسار المحدد
import { iconMap } from '../../constants/iconMap';

const IntegratedHealthHub = () => {
  // استخدام أيقونات الحمل والرضاعة
  const PregnancyIcon = iconMap.intimacy;
  const LactationIcon = iconMap.feelings;
  
  const [openIdx, setOpenIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('pregnancy'); // التنقل بين الحمل والرضاعة
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('ai_chat_history')) || []);
  
  // دمج البيانات في حالة واحدة وحفظها في localStorage
  const [data, setData] = useState(() => {
    const savedPregnancy = JSON.parse(localStorage.getItem('lady_pregnancy')) || {};
    const savedLactation = JSON.parse(localStorage.getItem('lady_lactation')) || {};
    return { ...savedPregnancy, ...savedLactation };
  });

  const fileInputRef = useRef(null);

  // قوائم الحمل [cite: 3, 4]
  const pregnancySections = [
    { title: "نمو الجنين", emoji: "⚖️", fields: ["الوزن", "الطول", "النبض", "الحركة", "حجم الرأس", "طول الفخذ", "وضعية الجنين", "كمية السائل", "ركلات اليوم", "ملاحظات"] },
    { title: "صحة الأم", emoji: "🩺", fields: ["الضغط", "السكر", "الوزن", "الغثيان", "تورم القدم", "الصداع", "الشهية", "النوم", "الإرهاق", "ملاحظات"] },
    { title: "الفحوصات", emoji: "🖥️", fields: ["السونار", "دم", "بول", "تاريخ الفحص", "اسم الطبيب", "المكان", "التكلفة", "النتيجة", "موعد القادم", "ملاحظات"] },
    { title: "سجل المكملات", emoji: "💊", fields: ["فوليك", "حديد", "كالسيوم", "أوميجا3", "فيتامين د", "وقت الجرعة", "الكمية", "تاريخ البدء", "تاريخ الانتهاء", "ملاحظات"] },
    { title: "الاستعداد للولادة", emoji: "👜", fields: ["حقيبة المشفى", "ملابس البيبي", "أغراض الأم", "أوراق رسمية", "خطة الولادة", "اسم المستشفى", "رقم الطوارئ", "تجهيز المنزل", "الميزانية", "ملاحظات"] },
    { title: "تطور الأسابيع", emoji: "📅", fields: ["الأسبوع الحالي", "الشهر", "موعد الولادة", "أيام متبقية", "تطور المرحلة", "نصيحة الأسبوع", "تغيرات جسدية", "الحالة النفسية", "تاريخ اليوم", "ملاحظات"] },
    { title: "التواصل مع الجنين", emoji: "🎈", fields: ["تفاعل مع الصوت", "تفاعل مع الضوء", "أغاني/أذكار", "كتابة رسالة", "اسم مقترح", "تجهيز الغرفة", "أول صورة سونار", "شعور الأب", "لحظات مميزة", "ملاحظات"] }
  ];

  // قوائم الرضاعة [cite: 14, 15]
  const lactationSections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] },
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] },
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] },
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] }
  ];

  const currentSections = activeTab === 'pregnancy' ? pregnancySections : lactationSections;

  // تحديد نوع المدخل (تاريخ/وقت/نص) بناءً على اسم الحقل
  const getInputType = (f) => {
    if (f.includes("تاريخ") || f === "تاريخ اليوم" || f.includes("موعد")) return "date";
    if (f.includes("وقت") || f.includes("ساعة") || f.includes("بداية") || f.includes("نهاية")) return "time";
    return "text";
  };

  // دالة الحفظ والتحليل
  const handleSaveAndAnalyze = async () => {
    setLoading(true);
    try {
      // 1. الحفظ في Neon DB
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeTab, data: data })
      });

      // 2. تحليل البيانات عبر AI
      const prompt = `أنا في مرحلة ${activeTab === 'pregnancy' ? 'الحمل' : 'الرضاعة'}. هذه بياناتي الحالية: ${JSON.stringify(data)}. حلل حالتي كطبيب مختص وقدم نصيحة مفصلة وطويلة.`;
      const aiRes = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const resData = await aiRes.json();
      
      const newResponse = { id: Date.now(), text: resData.reply, date: new Date().toLocaleString(), type: activeTab };
      setAiResponse(resData.reply);
      const updatedHistory = [newResponse, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('ai_chat_history', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = (id) => {
    const filtered = chatHistory.filter(r => r.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('ai_chat_history', JSON.stringify(filtered));
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))', 
      backdropFilter: 'blur(20px)', borderRadius: '30px', padding: '25px', 
      border: '1px solid rgba(255,255,255,0.3)', color: '#333', direction: 'rtl' 
    }}>
      
      {/* تبديل الأقسام */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActiveTab('pregnancy')}
          style={{ ...tabBtnStyle, background: activeTab === 'pregnancy' ? '#6a1b9a' : 'rgba(255,255,255,0.3)', color: activeTab === 'pregnancy' ? '#fff' : '#6a1b9a' }}
        >
          <PregnancyIcon size={18}/> متابعة الحمل
        </button>
        <button 
          onClick={() => setActiveTab('lactation')}
          style={{ ...tabBtnStyle, background: activeTab === 'lactation' ? '#2e7d32' : 'rgba(255,255,255,0.3)', color: activeTab === 'lactation' ? '#fff' : '#2e7d32' }}
        >
          <LactationIcon size={18}/> نظام الرضاعة
        </button>
      </div>

      {/* قوائم المدخلات [cite: 6, 7, 17] */}
      <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingLeft: '5px' }}>
        {currentSections.map((sec, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{sec.emoji} {sec.title}</span>
              <span>{openIdx === i ? '▲' : '▼'}</span>
            </div>
            {openIdx === i && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '15px' }}>
                {sec.fields.map(f => (
                  <div key={f}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>{f}</label>
                    <input 
                      type={getInputType(f)}
                      style={{ 
                        width: '100%', padding: '10px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.5)', 
                        background: '#fff', color: '#333', outline: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                      }} 
                      value={data[f] || ''} 
                      onChange={e => {
                        const newData = {...data, [f]: e.target.value};
                        setData(newData);
                        localStorage.setItem(activeTab === 'pregnancy' ? 'lady_pregnancy' : 'lady_lactation', JSON.stringify(newData));
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* شات الذكاء الاصطناعي والوسائط */}
      <div style={{ marginTop: '20px', borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
        <button 
          onClick={handleSaveAndAnalyze}
          style={{ width: '100%', padding: '12px', borderRadius: '15px', border: 'none', background: activeTab === 'pregnancy' ? '#6a1b9a' : '#2e7d32', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}
        >
          {loading ? 'جاري الحفظ والتحليل...' : 'حفظ وتحليل الطبيب الذكي'}
        </button>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
          <button title="فتح الكاميرا" style={mediaBtnStyle} onClick={() => fileInputRef.current.click()}>📷</button>
          <button title="تحدث للذكاء" style={mediaBtnStyle}>🎤</button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" />
        </div>

        {aiResponse && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '20px', marginBottom: '20px', borderRight: `5px solid ${activeTab === 'pregnancy' ? '#6a1b9a' : '#2e7d32'}` }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>👨‍⚕️ نصيحة الطبيب المختص:</strong>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{aiResponse}</p>
          </div>
        )}

        {/* سجل الردود المحفوظة */}
        <div style={{ marginTop: '10px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>📜 سجل الاستشارات</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {chatHistory.map(res => (
              <div key={res.id} style={{ background: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '15px', marginBottom: '10px', position: 'relative' }}>
                <small style={{ fontSize: '0.65rem', color: '#666' }}>{res.date} ({res.type === 'pregnancy' ? 'حمل' : 'رضاعة'})</small>
                <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>{res.text}</p>
                <button 
                  onClick={() => deleteResponse(res.id)}
                  style={{ position: 'absolute', top: '5px', left: '10px', border: 'none', background: 'transparent', color: '#d32f2f', cursor: 'pointer' }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const tabBtnStyle = {
  flex: 1, padding: '10px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.3s'
};

const mediaBtnStyle = {
  width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#fff', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export default IntegratedHealthHub;
