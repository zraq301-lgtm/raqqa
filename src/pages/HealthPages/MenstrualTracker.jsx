import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
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
  const [notifications, setNotifications] = useState([]);
  
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [];
  });

  const [savedResponses, setSavedResponses] = useState(() => {
    const saved = localStorage.getItem('saved_ai_responses');
    return saved ? JSON.parse(saved) : [];
  });

  // --- مزامنة التخزين المحلي ---
  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    localStorage.setItem('saved_ai_responses', JSON.stringify(savedResponses));
  }, [data, chatHistory, savedResponses]);

  // --- جلب الإشعارات من Neon DB (تحديث القائمة) ---
  const fetchNotifications = async () => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/notifications?user_id=1',
        method: 'GET'
      };
      const response = await CapacitorHttp.get(options);
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error("فشل جلب الإشعارات:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- 1. حفظ البيانات وتوليد إشعار طبي (Neon DB + Groq) ---
  const saveAndNotify = async () => {
    setLoading(true);
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: 'الدورة الشهرية',
          value: JSON.stringify(data),
          note: 'تحليل تلقائي من مدخلات المستخدمة'
        }
      };

      const response = await CapacitorHttp.post(options);
      
      if (response.data.success) {
        console.log("تم الحفظ وتوليد النصيحة:", response.data.advice);
        await fetchNotifications(); // تحديث الإشعارات فوراً لرؤية النصيحة الجديدة
      }
    } catch (err) {
      console.error("خطأ في حفظ البيانات:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. محادثة ذكاء رقة الاصطناعي (Raqqa AI) ---
  const askRaqqaAI = async (userInput) => {
    setLoading(true);
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `بصفتك طبيب مختص، حلل هذه البيانات: ${JSON.stringify(data)} وأجب على: ${userInput}`
        }
      };

      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message || "عذراً رقيقتي، لم أتمكن من التحليل حالياً.";

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: responseText, 
        time: new Date().toLocaleTimeString('ar-EG') 
      };

      setChatHistory(prev => [...prev, { role: 'user', content: userInput }, newMessage]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "حدث خطأ في الاتصال، تأكدي من الإنترنت." }]);
    } finally {
      setLoading(false);
    }
  };

  // عند الضغط على الزر الرئيسي: حفظ ثم فتح المحادثة
  const handleMainAction = async () => {
    await saveAndNotify(); // الحفظ في DB وإصدار إشعار طبي
    setShowChat(true);
    askRaqqaAI("بناءً على بياناتي المسجلة، قدمي لي تحليل طبي شامل كطبيبة متخصصة.");
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

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 3, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] },
    { id: 4, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <HealthIcon size={40} color="#E91E63" />
          <h2 style={{ color: '#ad1457' }}>طبيبة رقة الذكية</h2>
        </div>
        
        {/* عرض التنبيه الطبي من الإشعارات */}
        {notifications.length > 0 && (
          <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #FFE0B2' }}>
            <strong style={{ display: 'block', color: '#E65100', fontSize: '13px' }}>✨ نصيحة طبية جديدة:</strong>
            <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#5D4037' }}>{notifications[0].body}</p>
          </div>
        )}

        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457', marginTop: '10px' }}>توقع الدورة القادمة</button>
        {prediction && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>الموعد المتوقع: {prediction}</div>}
      </div>

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#888' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #FFE1E9' }}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={handleMainAction} style={styles.btnPrimary}>
        {loading ? "جاري الحفظ والتحليل..." : "حفظ وتحليل الحالة طبياً"}
      </button>

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة المتخصصة</span>
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff' }}>مسح</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '80%',
                marginRight: msg.role === 'user' ? 'auto' : '0'
              }}>
                {msg.content}
              </div>
            ))}
          </div>
          <div style={styles.chatInputArea}>
            <input 
              placeholder="اسألي طبيبتك عن الأعراض..." 
              style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '20px' }}
              onKeyDown={(e) => { 
                if(e.key === 'Enter' && e.target.value.trim()) { 
                  askRaqqaAI(e.target.value); 
                  e.target.value = ''; 
                } 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
