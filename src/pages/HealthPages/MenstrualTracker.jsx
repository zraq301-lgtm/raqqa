import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
// استيراد CapacitorHttp للاتصال الأصلي بالمحرك
import { CapacitorHttp } from '@capacitor/core';

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health;

  // --- حالات البيانات ---
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('menstrual_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [openAccordion, setOpenAccordion] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [];
  });

  const [savedResponses, setSavedResponses] = useState(() => {
    const saved = localStorage.getItem('saved_ai_responses');
    return saved ? JSON.parse(saved) : [];
  });

  // مزامنة التخزين المحلي
  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    localStorage.setItem('saved_ai_responses', JSON.stringify(savedResponses));
  }, [data, chatHistory, savedResponses]);

  // --- 1. حفظ البيانات في Neon DB عبر CapacitorHttp ---
  const syncHealthData = async (healthType, details) => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-health',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          user_id: 1, // معرف افتراضي، يمكن تغييره حسب النظام
          category: healthType, 
          value: JSON.stringify(details),
          timestamp: new Date() 
        }
      };
      await CapacitorHttp.post(options);
      console.log("تمت المزامنة بنجاح في نيون"); [cite: 8, 9]
    } catch (err) {
      console.error("فشلت المزامنة:", err);
    }
  };

  // --- 2. استشارة ذكاء رقة الاصطناعي عبر CapacitorHttp ---
  const askRaqqaAI = async (userInput) => {
    setLoading(true);
    try {
      const context = `أنا أنثى مسلمة، تحليل طبي لبياناتي: ${JSON.stringify(data)}. السؤال: ${userInput}`; [cite: 11]
      
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: context }
      };

      const response = await CapacitorHttp.post(options);
      const reply = response.data.reply || response.data.data || "لم أتمكن من التحليل حالياً."; [cite: 13]

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: reply, 
        time: new Date().toLocaleTimeString('ar-EG') 
      };

      setChatHistory(prev => [...prev, { role: 'user', content: userInput }, newMessage]); [cite: 15]
    } catch (err) {
      console.error("فشل الاتصال الأصلي:", err);
      setChatHistory(prev => [...prev, { role: 'ai', content: "عذراً رقيقة، حدث خطأ في الاتصال بالشبكة." }]); [cite: 16]
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndAnalyze = async () => {
    await syncHealthData('menstrual', data); [cite: 18]
    setShowChat(true);
    askRaqqaAI("بناءً على بياناتي المسجلة، قدمي لي نصيحة طبية مفصلة كطبيب متخصص."); [cite: 19]
  };

  const calculateCycle = () => {
    const startDate = data['سجل التواريخ_تاريخ البدء']; [cite: 20]
    const duration = parseInt(data['سجل التواريخ_مدة الدورة']) || 28; [cite: 21]
    if (startDate) {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + duration); [cite: 22]
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
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #eee' }, [cite: 23]
    iconBtn: { background: '#fff', border: '1px solid #eee', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] }, [cite: 24]
    { id: 2, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 3, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] },
    { id: 4, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] }
  ];

  return (
    <div style={styles.container}>
      {/* الهيدر */}
      <div style={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <HealthIcon size={40} color="#E91E63" />
          <h2 style={{ color: '#ad1457' }}>متابعة رقية الذكية</h2>
        </div>
        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457', marginTop: '10px' }}>توقع الدورة القادمة</button> [cite: 25]
        {prediction && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>الموعد المتوقع: {prediction}</div>} [cite: 26]
      </div>

      {/* الأقسام المنسدلة */}
      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && ( [cite: 27]
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

      {/* أزرار الإجراءات */}
      <button onClick={handleSaveAndAnalyze} style={styles.btnPrimary}>
        {loading ? "جاري التحليل..." : "حفظ البيانات وتحليلها بالذكاء الاصطناعي"} [cite: 31, 32]
      </button>

      <button onClick={() => setShowChat(true)} style={{ ...styles.btnPrimary, background: '#ad1457' }}>
        💬 استشارة طبيبة رقة
      </button>

      {/* قائمة الردود المحفوظة */}
      {savedResponses.length > 0 && (
        <div style={styles.card}>
          <h4 style={{ color: '#E91E63', marginBottom: '10px' }}>⭐ الردود المحفوظة</h4>
          {savedResponses.map((res) => (
            <div key={res.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', fontSize: '13px' }}>
              <p>{res.content}</p>
              <button onClick={() => removeSavedResponse(res.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px' }}>حذف من المحفوظات</button>
            </div>
          ))}
        </div>
      )}

      {/* شات طبيبة رقة */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '20px' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة الذكية</span>
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>مسح الشات</button> [cite: 33]
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                [cite_start]background: msg.role === 'user' ? '#E91E63' : '#fff', [cite: 34]
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '85%',
                marginLeft: msg.role === 'user' ? [cite_start]'auto' : '0' [cite: 35]
              }}>
                {msg.content}
                {msg.role === 'ai' && (
                  <button 
                    onClick={() => setSavedResponses([...savedResponses, msg])} 
                    style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: '#E91E63', border: 'none', background: 'none', fontWeight: 'bold' }}
                  >
                    ⭐ حفظ في المفضلة
                  </button>
                )}
              </div>
            ))}
            {loading && <div style={{ color: '#888', fontSize: '12px' }}>رقة تكتب الآن...</div>}
          </div>

          <div style={styles.chatInputArea}>
            <div style={styles.iconBtn} onClick={() => alert('فتح الكاميرا/المعرض')}>📷</div>
            <div style={styles.iconBtn} onClick={() => alert('تشغيل الميكروفون')}>🎤</div>
            <input 
              placeholder="اسألي طبيبة رقة..." 
              [cite_start]style={{ flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '20px', outline: 'none' }} [cite: 36, 37]
              onKeyDown={(e) => { 
                if(e.key === 'Enter' && e.target.value.trim()) { 
                  askRaqqaAI(e.target.value);
                  e.target.value = ''; [cite: 38]
                } 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; [cite: 39]

export default MenstrualTracker;
