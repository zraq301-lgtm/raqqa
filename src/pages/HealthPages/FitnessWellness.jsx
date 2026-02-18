import React, { useState, useRef } from 'react';
// استيراد CapacitorHttp بشكل صحيح لتجنب خطأ الـ Build
import { CapacitorHttp } from '@capacitor/core';
import { iconMap } from '../../constants/iconMap';

const IntegratedHealthHub = () => {
  const PregnancyIcon = iconMap.intimacy;
  const LactationIcon = iconMap.feelings;
  
  const [openIdx, setOpenIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('pregnancy');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false); 
  const [aiResponse, setAiResponse] = useState('');
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('ai_chat_history')) || []);
  
  const [data, setData] = useState(() => {
    const savedPregnancy = JSON.parse(localStorage.getItem('lady_pregnancy')) || {};
    const savedLactation = JSON.parse(localStorage.getItem('lady_lactation')) || {};
    return { ...savedPregnancy, ...savedLactation };
  });

  const fileInputRef = useRef(null);

  const pregnancySections = [
    { title: "نمو الجنين", emoji: "⚖️", fields: ["الوزن", "الطول", "النبض", "الحركة", "حجم الرأس", "طول الفخذ", "وضعية الجنين", "كمية السائل", "ركلات اليوم", "ملاحظات"] },
    { title: "صحة الأم", emoji: "🩺", fields: ["الضغط", "السكر", "الوزن", "الغثيان", "تورم القدم", "الصداع", "الشهية", "النوم", "الإرهاق", "ملاحظات"] },
    { title: "الفحوصات", emoji: "🖥️", fields: ["السونار", "دم", "بول", "تاريخ الفحص", "اسم الطبيب", "المكان", "التكلفة", "النتيجة", "موعد القادم", "ملاحظات"] },
    { title: "سجل المكملات", emoji: "💊", fields: ["فوليك", "حديد", "كالسيوم", "أوميجا3", "فيتامين د", "وقت الجرعة", "الكمية", "تاريخ البدء", "تاريخ الانتهاء", "ملاحظات"] },
    { title: "الاستعداد للولادة", emoji: "👜", fields: ["حقيبة المشفى", "ملابس البيبي", "أغراض الأم", "أوراق رسمية", "خطة الولادة", "اسم المستشفى", "رقم الطوارئ", "تجهيز المنزل", "الميزانية", "ملاحظات"] }
  ];

  const lactationSections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "وجبة الغذاء", "فيتامينات", "يانسون", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] }
  ];

  const currentSections = activeTab === 'pregnancy' ? pregnancySections : lactationSections;

  const getInputType = (f) => {
    if (f.includes("تاريخ") || f === "تاريخ اليوم" || f.includes("موعد")) return "date";
    if (f.includes("وقت") || f.includes("ساعة") || f.includes("بداية") || f.includes("نهاية")) return "time";
    return "text";
  };

  const handleSaveAndAnalyze = async () => {
    setLoading(true);
    setShowChat(true);
    
    try {
      // 1. حفظ البيانات في Neon DB باستخدام CapacitorHttp
      const saveOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          category: activeTab,
          value: "تحديث ملف صحي",
          note: JSON.stringify(data),
          user_id: 1
        }
      };
      await CapacitorHttp.post(saveOptions);

      // 2. تحليل البيانات كطبيبة نساء وتوليد
      const aiPrompt = `أنا طبيبة نساء وتوليد متخصصة في رقة. هذه بيانات مريضتي في مرحلة ${activeTab === 'pregnancy' ? 'الحمل' : 'الرضاعة'}: ${JSON.stringify(data)}. قدمي تحليلاً طبياً مفصلاً بأسلوب دافئ ومهني مع نصائح لكل مدخل.`;
      
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: aiPrompt }
      };

      const response = await CapacitorHttp.post(aiOptions);
      const responseText = response.data.reply || response.data.message || "عذراً، لم أتمكن من الحصول على رد حالياً.";
      
      const newResponse = { id: Date.now(), text: responseText, date: new Date().toLocaleString(), type: activeTab };
      setAiResponse(responseText);
      
      const updatedHistory = [newResponse, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('ai_chat_history', JSON.stringify(updatedHistory));

    } catch (err) {
      console.error("Connection Error:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.");
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
    <div style={containerStyle}>
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

      <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingLeft: '5px' }}>
        {currentSections.map((sec, i) => (
          <div key={i} style={sectionCardStyle}>
            <div style={sectionHeaderStyle} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{sec.emoji} {sec.title}</span>
              <span>{openIdx === i ? '▲' : '▼'}</span>
            </div>
            {openIdx === i && (
              <div style={gridStyle}>
                {sec.fields.map(f => (
                  <div key={f}>
                    <label style={labelStyle}>{f}</label>
                    <input 
                      type={getInputType(f)}
                      style={inputStyle} 
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

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSaveAndAnalyze} style={{ ...actionBtnStyle, background: activeTab === 'pregnancy' ? '#6a1b9a' : '#2e7d32' }}>
           تحليل البيانات مع طبيبة رقة 👩‍⚕️
        </button>
      </div>

      {showChat && (
        <div style={chatOverlayStyle}>
          <div style={chatWindowStyle}>
            <div style={chatHeaderStyle}>
              <span>👨‍⚕️ عيادة رقة الذكية</span>
              <button onClick={() => setShowChat(false)} style={closeBtnStyle}>✕</button>
            </div>
            <div style={chatBodyStyle}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>الطبيبة تقوم بمراجعة بياناتك... ✨</div>
              ) : (
                <div style={messageBoxStyle}>
                   <strong>التشخيص والنصيحة الطبية:</strong>
                   <p style={{ marginTop: '10px' }}>{aiResponse}</p>
                </div>
              )}
            </div>
            <div style={mediaContainerStyle}>
              <button title="رفع أشعة" style={mediaBtnStyle} onClick={() => fileInputRef.current.click()}>📷</button>
              <button title="تسجيل صوتي" style={mediaBtnStyle} onClick={() => alert("جاري الاتصال بالميكروفون...")}>🎤</button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" />
            </div>
          </div>
        </div>
      )}

      <div style={historySectionStyle}>
        <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>📜 الاستشارات المحفوظة</h3>
        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
          {chatHistory.map(res => (
            <div key={res.id} style={historyCardStyle}>
              <small>{res.date}</small>
              <p style={{ fontSize: '0.85rem' }}>{res.text.substring(0, 100)}...</p>
              <button onClick={() => deleteResponse(res.id)} style={deleteBtnStyle}>🗑️ حذف</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle = { background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))', backdropFilter: 'blur(20px)', borderRadius: '30px', padding: '25px', border: '1px solid rgba(255,255,255,0.3)', color: '#333', direction: 'rtl' };
const sectionCardStyle = { background: 'rgba(255,255,255,0.25)', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden' };
const sectionHeaderStyle = { padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '15px' };
const labelStyle = { fontSize: '0.75rem', marginBottom: '4px', display: 'block' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.5)', background: '#fff' };
const actionBtnStyle = { width: '100%', padding: '15px', borderRadius: '15px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' };
const chatOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 };
const chatWindowStyle = { width: '90%', maxWidth: '480px', background: '#fff', borderRadius: '25px', overflow: 'hidden' };
const chatHeaderStyle = { background: '#6a1b9a', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between' };
const chatBodyStyle = { padding: '20px', maxHeight: '400px', overflowY: 'auto' };
const messageBoxStyle = { background: '#f5f5f5', padding: '15px', borderRadius: '15px', lineHeight: '1.6' };
const mediaContainerStyle = { padding: '15px', display: 'flex', gap: '20px', justifyContent: 'center', borderTop: '1px solid #eee' };
const mediaBtnStyle = { width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: '#eee', fontSize: '1.2rem', cursor: 'pointer' };
const closeBtnStyle = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' };
const historySectionStyle = { marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '15px' };
const historyCardStyle = { background: 'rgba(255,255,255,0.4)', padding: '10px', borderRadius: '12px', marginBottom: '8px', position: 'relative' };
const deleteBtnStyle = { border: 'none', background: 'none', color: '#d32f2f', fontSize: '0.75rem', cursor: 'pointer' };
const tabBtnStyle = { flex: 1, padding: '10px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };

export default IntegratedHealthHub;
