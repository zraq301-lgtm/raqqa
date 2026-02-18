import React, { useState, useRef, useEffect } from 'react';
// 1. استيراد CapacitorHttp للاتصال الأصلي [تعديل مطلوب]
import { CapacitorHttp } from '@capacitor/core';
import { iconMap } from '../../constants/iconMap';

const IntegratedHealthHub = () => {
  const PregnancyIcon = iconMap.intimacy; [cite: 2]
  const LactationIcon = iconMap.feelings; [cite: 3]
  
  const [openIdx, setOpenIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('pregnancy'); [cite: 3]
  const [loading, setLoading] = useState(false); [cite: 4]
  const [showChat, setShowChat] = useState(false); 
  const [aiResponse, setAiResponse] = useState(''); [cite: 4]
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('ai_chat_history')) || []); [cite: 5]
  
  const [data, setData] = useState(() => {
    const savedPregnancy = JSON.parse(localStorage.getItem('lady_pregnancy')) || {}; [cite: 5]
    const savedLactation = JSON.parse(localStorage.getItem('lady_lactation')) || {}; [cite: 5]
    return { ...savedPregnancy, ...savedLactation }; [cite: 5]
  });

  const fileInputRef = useRef(null); [cite: 6]

  const pregnancySections = [
    { title: "نمو الجنين", emoji: "⚖️", fields: ["الوزن", "الطول", "النبض", "الحركة", "حجم الرأس", "طول الفخذ", "وضعية الجنين", "كمية السائل", "ركلات اليوم", "ملاحظات"] }, [cite: 6]
    { title: "صحة الأم", emoji: "🩺", fields: ["الضغط", "السكر", "الوزن", "الغثيان", "تورم القدم", "الصداع", "الشهية", "النوم", "الإرهاق", "ملاحظات"] }, [cite: 6]
    { title: "الفحوصات", emoji: "🖥️", fields: ["السونار", "دم", "بول", "تاريخ الفحص", "اسم الطبيب", "المكان", "التكلفة", "النتيجة", "موعد القادم", "ملاحظات"] }, [cite: 6]
    { title: "سجل المكملات", emoji: "💊", fields: ["فوليك", "حديد", "كالسيوم", "أوميجا3", "فيتامين د", "وقت الجرعة", "الكمية", "تاريخ البدء", "تاريخ الانتهاء", "ملاحظات"] }, [cite: 6, 7]
    { title: "الاستعداد للولادة", emoji: "👜", fields: ["حقيبة المشفى", "ملابس البيبي", "أغراض الأم", "أوراق رسمية", "خطة الولادة", "اسم المستشفى", "رقم الطوارئ", "تجهيز المنزل", "الميزانية", "ملاحظات"] }, [cite: 6]
    { title: "تطور الأسابيع", emoji: "📅", fields: ["الأسبوع الحالي", "الشهر", "موعد الولادة", "أيام متبقية", "تطور المرحلة", "نصيحة الأسبوع", "تغيرات جسدية", "الحالة النفسية", "تاريخ اليوم", "ملاحظات"] }, [cite: 6]
    { title: "التواصل مع الجنين", emoji: "🎈", fields: ["تفاعل مع الصوت", "تفاعل مع الضوء", "أغاني/أذكار", "كتابة رسالة", "اسم مقترح", "تجهيز الغرفة", "أول صورة سونار", "شعور الأب", "لحظات مميزة", "ملاحظات"] } [cite: 6, 8]
  ];

  const lactationSections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] }, [cite: 8]
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] }, [cite: 8]
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] }, [cite: 8]
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] }, [cite: 9]
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] }, [cite: 9]
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] }, [cite: 9]
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] } [cite: 9]
  ];

  const currentSections = activeTab === 'pregnancy' ? pregnancySections : lactationSections; [cite: 10]

  const getInputType = (f) => {
    if (f.includes("تاريخ") || f === "تاريخ اليوم" || f.includes("موعد")) return "date"; [cite: 11]
    if (f.includes("وقت") || f.includes("ساعة") || f.includes("بداية") || f.includes("نهاية")) return "time"; [cite: 12]
    return "text"; [cite: 11]
  };

  // دالة الحفظ والتحليل باستخدام CapacitorHttp
  const handleSaveAndAnalyze = async () => {
    setLoading(true);
    setShowChat(true);
    
    try {
      // 1. حفظ البيانات في Neon DB عبر CapacitorHttp
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

      // 2. تحليل البيانات عبر AI (Raqqa-AI)
      const aiPrompt = `أنا طبيبة نساء وتوليد متخصصة في رقة. هذه بيانات مريضتي في مرحلة ${activeTab === 'pregnancy' ? 'الحمل' : 'الرضاعة'}: ${JSON.stringify(data)}. حللي الحالة بأسلوب طبي مهني ومفصل وقدمي نصائح دقيقة.`;
      
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: aiPrompt }
      };

      const response = await CapacitorHttp.post(aiOptions);
      const responseText = response.data.reply || response.data.message; [cite: 18]
      
      const newResponse = { id: Date.now(), text: responseText, date: new Date().toLocaleString(), type: activeTab }; [cite: 18]
      setAiResponse(responseText); [cite: 18]
      
      const updatedHistory = [newResponse, ...chatHistory]; [cite: 19]
      setChatHistory(updatedHistory); [cite: 19]
      localStorage.setItem('ai_chat_history', JSON.stringify(updatedHistory)); [cite: 19]

    } catch (err) {
      console.error("فشل الاتصال الأصلي:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت يا رفيقتي.");
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = (id) => {
    const filtered = chatHistory.filter(r => r.id !== id); [cite: 21]
    setChatHistory(filtered); [cite: 21]
    localStorage.setItem('ai_chat_history', JSON.stringify(filtered)); [cite: 21]
  };

  return (
    <div style={containerStyle}>
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

      {/* قوائم المدخلات */}
      <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingLeft: '5px' }}>
        {currentSections.map((sec, i) => (
          <div key={i} style={sectionCardStyle}>
            <div style={sectionHeaderStyle} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{sec.emoji} {sec.title}</span>
              <span>{openIdx === i ? '▲' : '▼'}</span> [cite: 26, 27]
            </div>
            {openIdx === i && (
              <div style={gridStyle}>
                {sec.fields.map(f => (
                  <div key={f}>
                    <label style={labelStyle}>{f}</label> [cite: 28]
                    <input 
                      type={getInputType(f)}
                      style={inputStyle} 
                      value={data[f] || [cite_start]''} [cite: 29, 30]
                      onChange={e => {
                        const newData = {...data, [f]: e.target.value}; [cite: 30]
                        setData(newData); [cite: 30]
                        localStorage.setItem(activeTab === 'pregnancy' ? 'lady_pregnancy' : 'lady_lactation', JSON.stringify(newData)); [cite: 31]
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* الزر الرئيسي */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSaveAndAnalyze} style={{ ...actionBtnStyle, background: activeTab === 'pregnancy' ? '#6a1b9a' : '#2e7d32' }}>
           حفظ وتحليل الطبيب الذكي ✨
        </button>
      </div>

      {/* نافذة الشات المنبثقة */}
      {showChat && (
        <div style={chatOverlayStyle}>
          <div style={chatWindowStyle}>
            <div style={chatHeaderStyle}>
              <span>👨‍⚕️ الطبيبة الذكية - رقة</span>
              <button onClick={() => setShowChat(false)} style={closeBtnStyle}>✕</button>
            </div>
            
            <div style={chatBodyStyle}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>جاري الحفظ والتحليل كطبيبة مختصة... ⏳</div>
              ) : (
                <div style={{...messageBoxStyle, borderRight: `5px solid ${activeTab === 'pregnancy' ? '#6a1b9a' : '#2e7d32'}`}}>
                   <strong>نصيحة الطبيبة المختصة:</strong> [cite: 36]
                   <p style={{ marginTop: '10px', fontSize: '0.95rem' }}>{aiResponse}</p> [cite: 36]
                </div>
              )}
            </div>

            <div style={mediaContainerStyle}>
              <button title="فتح الكاميرا" style={mediaBtnStyle} onClick={() => fileInputRef.current.click()}>📷</button>
              <button title="تحدث للطبيبة" style={mediaBtnStyle} onClick={() => alert("الميكروفون قيد التفعيل...")}>🎤</button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" />
            </div>
          </div>
        </div>
      )}

      {/* سجل الاستشارات */}
      <div style={historySectionStyle}>
        <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>📜 سجل الاستشارات</h3> [cite: 37]
        <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
          {chatHistory.map(res => (
            <div key={res.id} style={historyCardStyle}>
              <small style={{ fontSize: '0.65rem', color: '#666' }}>{res.date} ({res.type === 'pregnancy' ? 'حمل' : 'رضاعة'})</small> [cite: 38]
              <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>{res.text.substring(0, 80)}...</p> [cite: 38]
              <button onClick={() => deleteResponse(res.id)} style={deleteBtnStyle}>🗑️</button> [cite: 39]
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- التنسيقات (Styles) ---
const containerStyle = { background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))', backdropFilter: 'blur(20px)', borderRadius: '30px', padding: '25px', border: '1px solid rgba(255,255,255,0.3)', color: '#333', direction: 'rtl' }; [cite: 22]
const sectionCardStyle = { background: 'rgba(255,255,255,0.25)', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden' }; [cite: 24]
const sectionHeaderStyle = { padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }; [cite: 25]
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '15px' }; [cite: 27]
const labelStyle = { fontSize: '0.75rem', display: 'block', marginBottom: '4px' }; [cite: 28]
const inputStyle = { width: '100%', padding: '10px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.5)', background: '#fff', outline: 'none' }; [cite: 29]
const actionBtnStyle = { width: '100%', padding: '14px', borderRadius: '15px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }; [cite: 34]
const tabBtnStyle = { flex: 1, padding: '10px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }; [cite: 41]
const chatOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' };
const chatWindowStyle = { width: '100%', maxWidth: '450px', background: '#fff', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' };
const chatHeaderStyle = { background: '#6a1b9a', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const chatBodyStyle = { padding: '20px', maxHeight: '350px', overflowY: 'auto' };
const messageBoxStyle = { background: '#f9f9f9', padding: '15px', borderRadius: '15px', lineHeight: '1.6' };
const mediaContainerStyle = { padding: '15px', display: 'flex', gap: '20px', justifyContent: 'center', borderTop: '1px solid #eee' };
const mediaBtnStyle = { width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#f0f0f0', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }; [cite: 42]
const closeBtnStyle = { background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' };
const historySectionStyle = { marginTop: '20px', borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '15px' }; [cite: 37]
const historyCardStyle = { background: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '15px', marginBottom: '10px', position: 'relative' }; [cite: 37]
const deleteBtnStyle = { position: 'absolute', top: '5px', left: '10px', border: 'none', background: 'transparent', color: '#d32f2f', cursor: 'pointer' }; [cite: 39]

export default IntegratedHealthHub; [cite: 43]
