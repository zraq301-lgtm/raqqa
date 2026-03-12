import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health;

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('menstrual_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [openAccordion, setOpenAccordion] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chatInput, setChatInput] = useState(''); // حالة جديدة للنص المدخل
  
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [];
  });

  const FIXED_AVERAGE_CYCLE = 29;

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]);

  const fetchNotifications = async () => {
    try {
      const options = {
        url: 'https://raqqa-hjl8.vercel.app/api/notifications?user_id=1',
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

  // --- وظيفة دفع الإشعار إلى Firebase ---
  const sendPushNotification = async (title, body) => {
    const savedToken = localStorage.getItem('fcm_token');
    if (!savedToken) return;

    try {
      const fcmOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: {
          token: savedToken,
          title: title,
          body: body,
          data: { type: 'medical_report' }
        }
      };
      await CapacitorHttp.post(fcmOptions);
    } catch (err) {
      console.error("خطأ في إرسال إشعار FCM:", err);
    }
  };

  const handleMediaAction = async (type) => {
    try {
        setLoading(true);
        const base64Data = type === 'camera' ? await takePhoto() : await fetchImage();
        if (!base64Data) {
            setLoading(false);
            return;
        }
        const timestamp = Date.now();
        const fileName = `medical_img_${timestamp}.png`;
        const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, 'image/png');
        handleProcess(`لقد رفعت صورة طبية للمراجعة: ${finalAttachmentUrl}`);
    } catch (error) {
        console.error("فشل في معالجة الوسائط:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleProcess = async (userInput = null) => {
    setLoading(true);
    const summary = JSON.stringify(data);
    
    try {
      const promptText = `أنت طبيب متخصص خبير في طب النساء والتوليد وصحة المرأة فقط.
      القاعدة الصارمة: لا تجب على أي سؤال خارج تخصص الدورة الشهرية، الخصوبة، والحيض.
      
      المهمة المطلوبة منك:
      1. تحليل دقيق لهذه البيانات: ${summary}.
      2. كتابة تقرير طبي مفصل للمستخدمة يشرح حالتها الصحية بناءً على الأعراض والمزاج.
      3. تقديم نصائح طبية وقائية وعلاجية في نطاق الدورة والخصوبة.
      4. توقع الدورة القادمة بناءً على متوسط ثابت قدره ${FIXED_AVERAGE_CYCLE} يوماً.
      
      السؤال الحالي: ${userInput || "أرجو تقديم تقرير طبي شامل بناءً على بياناتي الحالية."}`;

      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };

      const aiResponse = await CapacitorHttp.post(aiOptions);
      const responseText = aiResponse.data.reply || aiResponse.data.message || "عذراً، لم أتمكن من إتمام التحليل الطبي حالياً.";

      const startDateInput = data['سجل التواريخ_تاريخ البدء'];
      let scheduledDate = new Date();
      if (startDateInput) {
        const nextExpected = new Date(startDateInput);
        nextExpected.setDate(nextExpected.getDate() + FIXED_AVERAGE_CYCLE);
        scheduledDate = nextExpected;
      }

      const savedToken = localStorage.getItem('fcm_token');
      
      // 1. حفظ في قاعدة البيانات (Neon)
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'medical_report',
          title: 'تقرير طبي جديد 🩺',
          body: responseText.substring(0, 100) + "...",
          startDate: startDateInput, 
          endDate: data['سجل التواريخ_تاريخ الانتهاء'],
          scheduled_for: scheduledDate.toISOString(),
          note: userInput || 'تقرير تلقائي'
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);

      // 2. إرسال الإشعار الفوري (FCM)
      await sendPushNotification('تقرير طبي جديد 🩺', 'طبيبة رقة قامت بتحليل بياناتك، اضغطي للعرض.');

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: responseText, 
        time: new Date().toLocaleTimeString('ar-EG'),
      };

      setChatHistory(prev => userInput ? [...prev, { role: 'user', content: userInput, id: Date.now()+1 }, newMessage] : [...prev, newMessage]);
      setChatInput(''); // مسح الحقل بعد الإرسال
      await fetchNotifications();

    } catch (err) {
      console.error("خطأ في الاتصال:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCycle = () => {
    const startDate = data['سجل التواريخ_تاريخ البدء'];
    if (startDate) {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + FIXED_AVERAGE_CYCLE);
      setPrediction(nextDate.toLocaleDateString('ar-EG'));
    }
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #eee' },
    iconBtn: { background: '#fce4ec', border: 'none', padding: '10px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    sendBtn: { background: '#E91E63', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة", "متوسط حسابي للتوقع"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع"] },
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء"] },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={{ background: '#FFF', border: '1px solid #E91E63', color: '#E91E63', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold' }}>💬 فتح الشات</button>
          <div style={{ textAlign: 'right' }}>
            <HealthIcon size={30} color="#E91E63" />
            <h3 style={{ color: '#ad1457', margin: 0 }}>طبيبة رقة الذكية</h3>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '15px', marginBottom: '10px', fontSize: '12px', color: '#E65100' }}>
            🔔 <strong>تذكير طبي:</strong> {notifications[0].body}
          </div>
        )}

        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457' }}>توقع الدورة (على أساس 29 يوم)</button>
        {prediction && <div style={{ textAlign: 'center', color: '#E91E63', fontWeight: 'bold' }}>الموعد القادم: {prediction}</div>}
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
                    readOnly={field === "متوسط حسابي للتوقع"}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #FFE1E9', background: field === "متوسط حسابي للتوقع" ? '#f9f9f9' : '#fff' }}
                    value={field === "متوسط حسابي للتوقع" ? "29" : (data[`${sec.title}_${field}`] || '')}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => { setShowChat(true); handleProcess(); }} style={styles.btnPrimary} disabled={loading}>
        {loading ? "جاري إنشاء تقرير طبي..." : "تحليل الذكاء الاصطناعي وإصدار تقرير"}
      </button>

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '20px' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>الاستشارة الطبية التخصصية</span>
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff' }}>مسح</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '85%',
                marginLeft: msg.role === 'user' ? 'auto' : '0'
              }}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'center', color: '#E91E63', margin: '15px 0' }}>
                   ️ جاري فحص بياناتك وإصدار تقرير طبي...
              </div>
            )}
          </div>
         
          <div style={styles.chatInputArea}>
            <button onClick={() => handleMediaAction('camera')} style={styles.iconBtn}>📷</button>
            <button onClick={() => handleMediaAction('gallery')} style={styles.iconBtn}>🖼️</button>
            <input 
              placeholder="اسألي طبيبة رقة عن الخصوبة والدورة..." 
              style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '20px', outline: 'none' }}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { 
                if(e.key === 'Enter' && chatInput.trim()) { 
                  handleProcess(chatInput);
                } 
              }}
            />
            {/* زر السهم لإرسال السؤال كما في الصورة */}
            <button 
              onClick={() => chatInput.trim() && handleProcess(chatInput)} 
              style={styles.sendBtn}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
