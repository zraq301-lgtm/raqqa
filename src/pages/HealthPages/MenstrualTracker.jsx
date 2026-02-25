import React, { useState, useEffect } from 'react';
// استيراد الأيقونات والمحرك الأصلي للكور
import { iconMap } from '../../constants/iconMap'; [cite: 1]
import { CapacitorHttp } from '@capacitor/core'; [cite: 2]

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health;

  // --- حالات البيانات ---
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('menstrual_data');
    return saved ? JSON.parse(saved) : {}; [cite: 3]
  });

  const [openAccordion, setOpenAccordion] = useState(null); [cite: 4]
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notifications, setNotifications] = useState([]); [cite: 5]
  
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : []; [cite: 5]
  });

  // مزامنة التخزين المحلي 
  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]); [cite: 6]

  // --- جلب الإشعارات من Neon DB ---
  const fetchNotifications = async () => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/notifications?user_id=1',
        method: 'GET'
      }; [cite: 7]
      const response = await CapacitorHttp.get(options); [cite: 8]
      if (response.data.success) {
        setNotifications(response.data.notifications); [cite: 8]
      }
    } catch (err) {
      console.error("فشل جلب الإشعارات:", err); [cite: 9]
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []); [cite: 10]

  // --- منطق المعالجة الرئيسي (حفظ في نيون + تحليل ذكاء اصطناعي) ---
  const handleProcess = async (userInput = null) => {
    setLoading(true); [cite: 11]
    const summary = JSON.stringify(data); [cite: 12]
    
    try {
      // 1. مرحلة الحفظ في قاعدة بيانات نيون (الرابط المطلوب)
      const saveOptions = {
        url: 'https://raqqa-hjl8.app.link/api/save-notifications', // تم تعديل الرابط حسب طلبك
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: 'متابعة الدورة الشهرية',
          value: summary,
          note: 'تم التحديث من واجهة المتابعة' [cite: 12, 13]
        }
      };
      await CapacitorHttp.post(saveOptions); [cite: 14]

      // 2. مرحلة التحليل عبر API الذكاء الاصطناعي
      const promptText = userInput 
        ? `أنا أنثى مسلمة، أحتاج استشارة طبية بناءً على هذه البيانات: ${summary}. سؤالي هو: ${userInput}` [cite: 15, 16]
        : `أنا أنثى مسلمة، يرجى تحليل حالتي الصحية بناءً على البيانات التالية كطبيب متخصص في الدورة والخصوبة: ${summary}`; [cite: 16]

      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText } [cite: 17]
      };

      const response = await CapacitorHttp.post(aiOptions); [cite: 18]
      
      const responseText = response.data.reply || response.data.message || "عذراً رقية، لم أتمكن من التحليل."; [cite: 18, 19]

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: responseText, 
        time: new Date().toLocaleTimeString('ar-EG') 
      };

      if (userInput) {
        setChatHistory(prev => [...prev, { role: 'user', content: userInput }, newMessage]); [cite: 20]
      } else {
        setChatHistory(prev => [...prev, newMessage]); [cite: 21]
      }
      
      await fetchNotifications(); [cite: 22]

    } catch (err) {
      console.error("فشل الاتصال الأصلي:", err); [cite: 23]
      const errorMsg = { role: 'ai', content: "حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت." };
      setChatHistory(prev => [...prev, errorMsg]); [cite: 24]
    } finally {
      setLoading(false); [cite: 25]
    }
  };

  const calculateCycle = () => {
    const startDate = data['سجل التواريخ_تاريخ البدء']; [cite: 26]
    const duration = parseInt(data['سجل التواريخ_مدة الدورة']) || 28; [cite: 27]
    if (startDate) {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + duration); [cite: 28]
      setPrediction(nextDate.toLocaleDateString('ar-EG'));
    }
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' } [cite: 29]
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 3, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] },
    { id: 4, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] }
  ]; [cite: 30]

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <HealthIcon size={40} color="#E91E63" />
          <h2 style={{ color: '#ad1457' }}>طبيبة رقة الذكية</h2>
        </div>
        {notifications.length > 0 && (
          <div style={{ background: '#FFF3E0', padding: '10px', borderRadius: '10px', marginBottom: '10px', fontSize: '12px', color: '#E65100' }}>
            🔔 نصيحة طبية: {notifications[0].body} [cite: 31, 32]
          </div>
        )}
        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457', marginTop: '10px' }}>توقع الدورة القادمة</button>
        {prediction && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>الموعد المتوقع: {prediction}</div>}
      </div>

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span> [cite: 33]
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span> [cite: 34]
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#888' }}>{field}</label> [cite: 35]
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #FFE1E9' }}
                    value={data[`${sec.title}_${field}`] || [cite_start]''} [cite: 36]
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )} [cite: 37]
       </div>
      ))}

      <button onClick={() => { setShowChat(true); handleProcess(); }} style={styles.btnPrimary}>
        {loading ? "جاري الحفظ والتحليل..." : "حفظ وتحليل الحالة طبياً"} [cite: 38, 39]
      </button>

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة المتخصصة</span>
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff' }}>مسح</button> [cite: 39, 40]
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                [cite_start]background: msg.role === 'user' ? '#E91E63' : '#fff', [cite: 40, 41]
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '80%',
                marginRight: msg.role === 'user' ? [cite_start]'auto' : '0' [cite: 42]
              }}>
                {msg.content}
              </div>
            ))}
            {loading && <div style={{ textAlign: 'center', color: '#E91E63' }}>جاري التواصل مع الطبيبة...</div>} [cite: 42]
          </div>
          <div style={styles.chatInputArea}>
            <input 
              placeholder="اسألي طبيبة رقة عن دورتك وخصوبتك..." 
              style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '20px' }}
              onKeyDown={(e) => { 
                if(e.key === 'Enter' && e.target.value.trim()) { 
                  handleProcess(e.target.value); [cite: 43, 44]
                  e.target.value = ''; [cite: 45]
                } 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; [cite: 46]

export default MenstrualTracker;
