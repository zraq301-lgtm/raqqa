import React, { useState, useEffect } from 'react';
[cite_start]// التصحيح النهائي للمسار: نخرج من HealthPages ثم من pages لنجد constants [cite: 1]
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';

const MenstrualTracker = () => {
  [cite_start]const HealthIcon = iconMap.health; [cite: 2]

  [cite_start]// --- حالات البيانات --- [cite: 3]
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('menstrual_data');
    return saved ? JSON.parse(saved) : {};
  });

  [cite_start]const [openAccordion, setOpenAccordion] = useState(null); [cite: 4]
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  [cite_start]const [chatHistory, setChatHistory] = useState(() => { [cite: 5]
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [];
  });

  [cite_start]const [savedResponses, setSavedResponses] = useState(() => { [cite: 6]
    const saved = localStorage.getItem('saved_ai_responses');
    return saved ? JSON.parse(saved) : [];
  });

  [cite_start]useEffect(() => { [cite: 7]
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    localStorage.setItem('saved_ai_responses', JSON.stringify(savedResponses));
  }, [data, chatHistory, savedResponses]);

  [cite_start]// --- ربط API المزامنة (Neon DB) عبر CapacitorHttp --- [cite: 8]
  const syncHealthData = async (healthType, details) => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-health',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          user_id: 1, 
          category: healthType, 
          value: JSON.stringify(details),
          timestamp: new Date() 
        }
      };
      await CapacitorHttp.post(options);
      [cite_start]console.log("تمت المزامنة بنجاح"); [cite: 9]
    } catch (err) {
      console.error("فشلت المزامنة");
    }
  };

  [cite_start]// --- ربط API الذكاء الاصطناعي (Raqqa AI) عبر CapacitorHttp --- [cite: 10]
  const askRaqqaAI = async (userInput) => {
    setLoading(true);
    try {
      const context = `تحليل طبي لبيانات: ${JSON.stringify(data)}. [cite_start]السؤال: ${userInput}`; [cite: 11]
      
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: context }
      };

      const response = await CapacitorHttp.post(options);
      [cite_start]const result = response.data; [cite: 13]
      const reply = result.reply || result.data || "لم أتمكن من التحليل حالياً.";

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: reply, 
        time: new Date().toLocaleTimeString('ar-EG') 
      [cite_start]}; [cite: 14]
      [cite_start]setChatHistory(prev => [...prev, { role: 'user', content: userInput }, newMessage]); [cite: 15]
    } catch (err) {
      [cite_start]setChatHistory(prev => [...prev, { role: 'ai', content: "عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي." }]); [cite: 16]
    } finally {
      [cite_start]setLoading(false); [cite: 17]
    }
  };

  [cite_start]const handleSaveAndAnalyze = async () => { [cite: 18]
    await syncHealthData('menstrual', data);
    setShowChat(true);
    [cite_start]askRaqqaAI("بناءً على بياناتي المسجلة، قدمي لي نصيحة طبية مفصلة كطبيب متخصص."); [cite: 19]
  };

  [cite_start]const calculateCycle = () => { [cite: 20]
    // إصلاح الخطأ البرمجي هنا باستخدام المفتاح الصحيح
    [cite_start]const startDate = data['سجل التواريخ_تاريخ البدء']; [cite: 20]
    const duration = parseInt(data['سجل التواريخ_مدة الدورة']) || [cite_start]28; [cite: 21]
    if (startDate) {
      const nextDate = new Date(startDate);
      [cite_start]nextDate.setDate(nextDate.getDate() + duration); [cite: 22]
      setPrediction(nextDate.toLocaleDateString('ar-EG'));
    }
  };

  const removeSavedResponse = (id) => {
    setSavedResponses(savedResponses.filter(res => res.id !== id));
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    [cite_start]chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' }, [cite: 23]
    iconBtn: { background: '#fff', border: '1px solid #eee', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
  };

  [cite_start]const sections = [ [cite: 24]
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 3, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] },
    { id: 4, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] }
  ];

  return (
    [cite_start]<div style={styles.container}> [cite: 25]
      <div style={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <HealthIcon size={40} color="#E91E63" />
          <h2 style={{ color: '#ad1457' }}>متابعة رقية الذكية</h2>
        </div>
        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457', marginTop: '10px' }}>توقع الدورة القادمة</button>
        [cite_start]{prediction && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>الموعد المتوقع: {prediction}</div>} [cite: 26]
      </div>

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          [cite_start]{openAccordion === sec.id && ( [cite: 27]
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#888' }}>{field}</label>
                  <input 
                    [cite_start]type={field.includes('تاريخ') ? 'date' : 'text'} [cite: 28, 29]
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #FFE1E9' }}
                    value={data[`${sec.title}_${field}`] || [cite_start]''} [cite: 30]
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      [cite_start]<button onClick={handleSaveAndAnalyze} style={styles.btnPrimary}> [cite: 31]
        {loading ? [cite_start]"جاري التحليل..." : "حفظ البيانات وتحليلها بالذكاء الاصطناعي"} [cite: 32]
      </button>

      <button onClick={() => setShowChat(true)} style={{ ...styles.btnPrimary, background: '#ad1457' }}>
        💬 استشارة طبيبة رقة
      </button>

      {/* قائمة الردود المحفوظة */}
      {savedResponses.length > 0 && (
        <div style={styles.card}>
          <h4 style={{ color: '#E91E63' }}>⭐ الردود المحفوظة</h4>
          {savedResponses.map((res) => (
            <div key={res.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <p style={{ fontSize: '13px' }}>{res.content}</p>
              <button onClick={() => removeSavedResponse(res.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>حذف</button>
            </div>
          ))}
        </div>
      )}

      [cite_start]{showChat && ( [cite: 32]
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>استشارة رقية</span>
            [cite_start]<button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff' }}>مسح</button> [cite: 33]
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                [cite_start]alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', [cite: 33]
                background: msg.role === 'user' ? [cite_start]'#E91E63' : '#fff', [cite: 34]
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '80%',
                marginRight: msg.role === 'user' ? [cite_start]'auto' : '0' [cite: 35]
              }}>
                {msg.content}
                {msg.role === 'ai' && <button onClick={() => setSavedResponses([...savedResponses, msg])} style={{ display: 'block', marginTop: '5px', fontSize: '10px', color: '#E91E63', border: 'none', background: 'none' }}>⭐ حفظ</button>}
              </div>
            ))}
          </div>
          <div style={styles.chatInputArea}>
            [cite_start]<div style={styles.iconBtn} onClick={() => alert('📷 فتح الكاميرا')}>📷</div> [cite: 36]
            <div style={styles.iconBtn} onClick={() => alert('🎤 سجل بصوتك')}>🎤</div>
            <input 
              placeholder="اسألي رقية..." 
              [cite_start]style={{ flex: 1, border: 'none', padding: '10px', borderRadius: '20px' }} [cite: 37]
              onKeyDown={(e) => { if(e.key === 'Enter') { askRaqqaAI(e.target.value); e.target.value = ''; [cite_start]} }} [cite: 38]
            />
          </div>
        </div>
      )}
    </div>
  );
[cite_start]}; [cite: 39]

export default MenstrualTracker;
