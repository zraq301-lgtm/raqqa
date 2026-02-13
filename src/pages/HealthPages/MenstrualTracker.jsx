import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';
// افترضنا وجود ApiService في المسار الصحيح للتعامل مع backend
// import ApiService from '../../services/ApiService'; 

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
  const [aiResponse, setAiResponse] = useState("");
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [];
  });

  // --- المزامنة والحفظ ---
  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]);

  // دالة حفظ البيانات في Neon DB
  const syncHealthData = async (healthType, data) => {
    try {
      const payload = { type: healthType, details: data, timestamp: new Date() };
      // await ApiService.saveHealthData(payload); // تفعيل عند جاهزية API
      console.log("تمت المزامنة بنجاح مع Neon DB");
    } catch (err) {
      console.log("فشلت المزامنة، البيانات محفوظة محلياً فقط");
    }
  };

  // --- منطق الذكاء الاصطناعي (Raqqa AI) ---
  const askRaqqaAI = async (userInput) => {
    setLoading(true);
    try {
      // محاكاة إرسال البيانات المسجلة مع سؤال المستخدم للتحليل
      const context = `بياناتي الحالية: ${JSON.stringify(data)}. سؤالي هو: ${userInput}`;
      // const res = await ApiService.askRaqqaAI(context); 
      // const reply = res.data.reply || res.data;
      
      const reply = "بناءً على الأعراض التي سجلتها (تشنجات وهدوء)، أنصحكِ بشرب اليانسون الدافئ وتجنب الكافيين. دورتك القادمة متوقعة قريباً، لذا استعدي جيداً."; 
      
      const newMessage = { role: 'ai', content: reply, time: new Date().toLocaleTimeString() };
      setChatHistory(prev => [...prev, { role: 'user', content: userInput }, newMessage]);
      setAiResponse(reply);
    } catch (err) {
      setAiResponse("عذراً، لم أستطع فهم ذلك، حاولي مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndAnalyze = async () => {
    await syncHealthData('menstrual', data);
    setShowChat(true);
    const analysisPrompt = "حللي بياناتي الصحية المسجلة وقدمي لي نصيحة مفصلة.";
    askRaqqaAI(analysisPrompt);
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

  // --- التنسيقات (Styles) ---
  const styles = {
    container: {
      background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)',
      minHeight: '100vh',
      padding: '20px',
      direction: 'rtl',
      fontFamily: 'sans-serif',
      paddingBottom: '100px'
    },
    card: {
      background: '#fff',
      borderRadius: '25px',
      padding: '20px',
      boxShadow: '0 8px 20px rgba(233, 30, 99, 0.1)',
      marginBottom: '15px'
    },
    btnPrimary: {
      width: '100%',
      padding: '15px',
      background: '#E91E63',
      color: 'white',
      border: 'none',
      borderRadius: '15px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px'
    },
    chatOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#fff',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideUp 0.3s ease-out'
    },
    chatInputContainer: {
      padding: '15px',
      borderTop: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: '#f9f9f9'
    },
    iconBtn: {
      background: '#F0F0F0',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
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
      {/* الرأس */}
      <div style={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <HealthIcon size={40} color="#E91E63" />
          <h2 style={{ color: '#E91E63', margin: '10px 0' }}>متابعة ذكية مع رقية</h2>
        </div>
        
        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457' }}>
          توقع الدورة القادمة
        </button>
        {prediction && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>الموعد المتوقع: {prediction}</div>}
      </div>

      {/* الأكورديون */}
      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div 
            onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
          >
            <span style={{ fontWeight: 'bold' }}>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '12px', color: '#666' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd', marginTop: '5px' }}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* زر الحفظ والتحليل بالذكاء الصناعي */}
      <button 
        onClick={handleSaveAndAnalyze}
        style={styles.btnPrimary}
      >
        {loading ? "جاري التحليل..." : "حفظ وتحليل البيانات ذكياً"}
      </button>

      {/* واجهة الشات (Raqqa AI Chat) */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>دردشة رقية الذكية</span>
            <button 
              onClick={() => {setChatHistory([]); localStorage.removeItem('chat_history');}}
              style={{ background: 'none', border: '1px solid #fff', color: '#fff', fontSize: '10px', borderRadius: '5px' }}
            >حذف السجل</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#fce4ec' : '#fff0f3',
                padding: '12px',
                borderRadius: '15px',
                marginBottom: '10px',
                border: '1px solid #ffe1e9',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {msg.content}
              </div>
            ))}
            {loading && <p style={{ color: '#E91E63' }}>رقية تفكر...</p>}
          </div>

          <div style={styles.chatInputContainer}>
            <div style={styles.iconBtn} onClick={() => alert('فتح الكاميرا...')}>📷</div>
            <div style={styles.iconBtn} onClick={() => alert('تسجيل صوتي...')}>🎤</div>
            <input 
              placeholder="اسألي رقية أي شيء..."
              onKeyDown={(e) => e.key === 'Enter' && askRaqqaAI(e.target.value)}
              style={{ flex: 1, border: 'none', padding: '10px', borderRadius: '20px', background: '#fff' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
