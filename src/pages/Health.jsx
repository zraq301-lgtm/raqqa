import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health;
  const ChatIcon = iconMap.chat || iconMap.insight;

  // --- حالات البيانات (States) ---
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

  // --- المزامنة والحفظ التلقائي ---
  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    localStorage.setItem('saved_ai_responses', JSON.stringify(savedResponses));
  }, [data, chatHistory, savedResponses]);

  // --- الربط مع الـ API (Neon DB & Raqqa AI) ---

  // 1. حفظ البيانات في Neon DB
  const syncHealthData = async (healthType, details) => {
    try {
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: healthType, details, timestamp: new Date() }),
      });
      if (response.ok) console.log("تمت المزامنة مع Neon بنجاح");
    } catch (err) {
      console.error("خطأ في المزامنة:", err);
    }
  };

  // 2. تحليل البيانات عبر Raqqa AI
  const askRaqqaAI = async (userInput) => {
    setLoading(true);
    try {
      // إرسال سياق البيانات مع السؤال للحصول على تحليل طبي دقيق
      const context = `المستخدم سجل البيانات التالية: ${JSON.stringify(data)}. السؤال الحالي: ${userInput}`;
      
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: context }),
      });
      
      const result = await response.json();
      const reply = result.reply || result.data || "عذراً، لم أستطع تحليل البيانات حالياً.";

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: reply, 
        time: new Date().toLocaleTimeString('ar-EG') 
      };
      
      setChatHistory(prev => [...prev, { role: 'user', content: userInput }, newMessage]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "حدث خطأ في الاتصال بالذكاء الاصطناعي." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndAnalyze = async () => {
    setLoading(true);
    await syncHealthData('menstrual', data);
    setShowChat(true);
    // طلب تحليل تلقائي شامل بمجرد الحفظ
    await askRaqqaAI("حللي بياناتي الصحية المسجلة وقدمي لي نصائح طبية مطولة وشاملة.");
  };

  const calculateCycle = () => {
    const startDate = data['سجل التواريخ_تاريخ البدء'];
    const duration = parseInt(data['سجل التواريخ_مدة الدورة']) || 28;
    if (startDate) {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + duration);
      setPrediction(nextDate.toLocaleDateString('ar-EG'));
    }
  };

  // --- التنسيقات (Styles) مستوحاة من Lunaria ---
  const styles = {
    container: {
      background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)',
      minHeight: '100vh',
      padding: '20px',
      direction: 'rtl',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    },
    card: {
      background: '#fff',
      borderRadius: '25px',
      padding: '20px',
      boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)',
      marginBottom: '15px',
      border: '1px solid #fff'
    },
    btnPrimary: {
      width: '100%',
      padding: '16px',
      background: '#E91E63',
      color: 'white',
      border: 'none',
      borderRadius: '18px',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(233, 30, 99, 0.2)'
    },
    chatOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#fff',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    },
    chatHeader: {
      padding: '20px',
      background: '#E91E63',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    chatInputArea: {
      padding: '15px',
      background: '#F9F9F9',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderTop: '1px solid #eee'
    },
    iconBtn: {
      background: '#fff',
      border: '1px solid #eee',
      borderRadius: '50%',
      width: '45px',
      height: '45px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 3, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] },
    { id: 4, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] }
  ];

  return (
    <div style={styles.container}>
      {/* قسم الرأس وتوقع الدورة */}
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <HealthIcon size={40} color="#E91E63" />
          <h2 style={{ color: '#ad1457', marginTop: '10px' }}>متابعة ذكاء رقية</h2>
        </div>
        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457', boxShadow: 'none' }}>
          توقع الدورة القادمة
        </button>
        {prediction && <div style={{ textAlign: 'center', marginTop: '12px', fontWeight: 'bold', color: '#E91E63' }}>الموعد المتوقع: {prediction}</div>}
      </div>

      {/* مدخلات البيانات (أكورديون) */}
      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span>
            <span style={{ color: '#E91E63' }}>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '12px', color: '#888', marginBottom: '5px', display: 'block' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #FFE1E9', background: '#FFF9FA' }}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* زر الحفظ والتحليل */}
      <button onClick={handleSaveAndAnalyze} style={styles.btnPrimary}>
        {loading ? "جاري الحفظ والتحليل..." : "حفظ البيانات وتحليلها طبياً"}
      </button>

      {/* واجهة شات الذكاء الاصطناعي */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatHeader}>
            <span onClick={() => setShowChat(false)} style={{ fontSize: '24px', cursor: 'pointer' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>رقية - استشارية الصحة</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setChatHistory([])} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '5px 10px', fontSize: '11px' }}>مسح</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '15px',
                borderRadius: '20px',
                marginBottom: '12px',
                maxWidth: '85%',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginRight: msg.role === 'user' ? 'auto' : '0'
              }}>
                {msg.content}
                {msg.role === 'ai' && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '5px', textAlign: 'left' }}>
                    <button 
                      onClick={() => setSavedResponses([...savedResponses, msg])}
                      style={{ background: 'none', border: 'none', color: '#E91E63', fontSize: '11px', cursor: 'pointer' }}
                    >⭐ حفظ النصيحة</button>
                  </div>
                )}
              </div>
            ))}
            {loading && <div style={{ color: '#E91E63', fontStyle: 'italic' }}>رقية تقوم بمراجعة بياناتك...</div>}
          </div>

          {/* أدوات الشات (كاميرا، ميكروفون، رفع صور) */}
          <div style={styles.chatInputArea}>
            <div style={styles.iconBtn} title="رفع صورة" onClick={() => alert('جاري فتح الاستوديو...')}>🖼️</div>
            <div style={styles.iconBtn} title="كاميرا" onClick={() => alert('جاري تشغيل الكاميرا...')}>📷</div>
            <div style={styles.iconBtn} title="تحدث" onClick={() => alert('الميكروفون نشط...')}>🎤</div>
            <input 
              placeholder="اسألي رقية عن حالتكِ..."
              style={{ flex: 1, border: '1px solid #eee', padding: '12px 18px', borderRadius: '25px', outline: 'none' }}
              onKeyDown={(e) => { if(e.key === 'Enter') { askRaqqaAI(e.target.value); e.target.value = ''; } }}
            />
          </div>
        </div>
      )}
      
      {/* قائمة الردود المحفوظة (اختياري) */}
      {savedResponses.length > 0 && (
        <div style={{ ...styles.card, marginTop: '20px' }}>
          <h4 style={{ color: '#E91E63', marginBottom: '10px' }}>📌 نصائح محفوظة</h4>
          {savedResponses.map(res => (
            <div key={res.id} style={{ fontSize: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
              {res.content.substring(0, 50)}...
              <button onClick={() => setSavedResponses(savedResponses.filter(r => r.id !== res.id))} style={{ color: 'red', border: 'none', background: 'none', float: 'left' }}>حذف</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
