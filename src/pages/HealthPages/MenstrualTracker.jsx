import React, { useState, useEffect } from 'react';
// التصحيح النهائي للمسار: نخرج من HealthPages ثم من pages لنجد constants
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
  const [notifications, setNotifications] = useState([]); // حالة لتخزين الإشعارات من نيون

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

  // --- جلب الإشعارات من Neon DB عند التحميل ---
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

  // --- حفظ المدخلات في نيون (Neon DB) وتوليد إشعار طبي ---
  const saveToNeonDB = async () => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          user_id: 1, 
          category: 'متابعة الدورة', 
          value: JSON.stringify(data),
          note: 'تحديث من واجهة المتابعة'
        }
      };
      const response = await CapacitorHttp.post(options);
      if (response.data.success) {
        console.log("تم الحفظ في نيون بنجاح:", response.data.advice);
        fetchNotifications(); // تحديث القائمة لرؤية الإشعار الجديد
      }
    } catch (err) {
      console.error("فشل الحفظ في قاعدة البيانات:", err);
    }
  };

  // --- ربط API الذكاء الاصطناعي (Raqqa AI) ---
  const askRaqqaAI = async (userInput) => {
    setLoading(true);
    try {
      const context = `أنت طبيب متخصص. تحليل طبي لبيانات الدورة: ${JSON.stringify(data)}. السؤال: ${userInput}`;
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: context }
      };
      const response = await CapacitorHttp.post(options);
      const result = response.data;
      const reply = result.reply || "لم أتمكن من التحليل حالياً.";

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: reply, 
        time: new Date().toLocaleTimeString('ar-EG') 
      };
      setChatHistory(prev => [...prev, { role: 'user', content: userInput }, newMessage]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndAnalyze = async () => {
    await saveToNeonDB(); // حفظ البيانات في نيون طبقا للكود المرفوع
    setShowChat(true);
    askRaqqaAI("بناءً على بياناتي المسجلة، قدمي لي نصيحة طبية مفصلة كطبيبة متخصصة في الخصوبة والأعراض.");
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

  const removeSavedResponse = (id) => {
    setSavedResponses(savedResponses.filter(res => res.id !== id));
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' },
    iconBtn: { background: '#fff', border: '1px solid #eee', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 3, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] },
    { id: 4, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] }
  ];

  return (
    <div style={styles.container}>
      {/* قسم التوقعات والإشعارات */}
      <div style={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <HealthIcon size={40} color="#E91E63" />
          <h2 style={{ color: '#ad1457' }}>متابعة رقية الذكية</h2>
        </div>

        {notifications.length > 0 && (
          <div style={{ background: '#FFF3E0', padding: '10px', borderRadius: '12px', marginBottom: '10px', fontSize: '12px', border: '1px solid #FFE0B2' }}>
            <strong style={{ color: '#E65100' }}>🔔 نصيحة طبية: </strong>
            {notifications[0].body}
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

      <button onClick={handleSaveAndAnalyze} style={styles.btnPrimary}>
        {loading ? "جاري الحفظ والتحليل..." : "حفظ البيانات وتحليلها بالذكاء الاصطناعي"}
      </button>

      {/* عرض الردود المحفوظة */}
      {savedResponses.length > 0 && (
        <div style={styles.card}>
          <h4 style={{ color: '#E91E63', marginBottom: '10px' }}>⭐ الردود المحفوظة</h4>
          {savedResponses.map((res) => (
            <div key={res.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', margin: 0, flex: 1 }}>{res.content}</p>
              <button onClick={() => removeSavedResponse(res.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>حذف</button>
            </div>
          ))}
        </div>
      )}

      {/* واجهة المحادثة */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة</span>
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
                {msg.role === 'ai' && (
                  <button 
                    onClick={() => setSavedResponses([...savedResponses, msg])} 
                    style={{ display: 'block', marginTop: '5px', fontSize: '10px', color: '#E91E63', border: 'none', background: 'none' }}
                  >
                    ⭐ حفظ في المفضلة
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={styles.chatInputArea}>
            <div style={styles.iconBtn} onClick={() => alert('📷')}>📷</div>
            <input 
              placeholder="اسألي طبيبة رقة..." 
              style={{ flex: 1, border: 'none', padding: '10px', borderRadius: '20px' }}
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
