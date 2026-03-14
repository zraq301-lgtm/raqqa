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
  const [prediction, setPrediction] = useState(null); // تم تعديله ليكون كائن يحتوي على تفاصيل
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chatInput, setChatInput] = useState(''); 
  
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [];
  });

  const FIXED_AVERAGE_CYCLE = 29;

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]);

  // --- دالة الحساب العبقرية (الذكاء البرمجي) ---
  const getAdvancedCalculations = (startDate) => {
    if (!startDate) return null;
    const start = new Date(startDate);
    
    // 1. توقع الدورة القادمة
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + FIXED_AVERAGE_CYCLE);

    // 2. حساب يوم التبويض (غالباً قبل الدورة القادمة بـ 14 يوم)
    const ovulationDay = new Date(nextDate);
    ovulationDay.setDate(nextDate.getDate() - 14);

    // 3. نافذة الخصوبة (5 أيام قبل التبويض + يوم التبويض)
    const fertilityStart = new Date(ovulationDay);
    fertilityStart.setDate(ovulationDay.getDate() - 5);

    // 4. التحويل للتقويم القمري (الهجري) باستخدام Intl
    const lunarFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day:'numeric', month:'long', year:'numeric'});
    const lunarDate = lunarFormatter.format(nextDate);

    return {
      nextDate: nextDate.toLocaleDateString('ar-EG'),
      lunarDate: lunarDate,
      ovulation: ovulationDay.toLocaleDateString('ar-EG'),
      fertilityWindow: `${fertilityStart.toLocaleDateString('ar-EG')} إلى ${ovulationDay.toLocaleDateString('ar-EG')}`
    };
  };

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
    // جلب الحسابات الدقيقة أولاً لإدراجها في التقرير
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    const summary = JSON.stringify(data);
    
    try {
      // البرومبت الآن يركز على "التحليل الطبي" فقط لأن التواريخ محسوبة برمجياً
      const promptText = `أنت طبيبة "رقة" الخبيرة في طب النساء.
      بناءً على البيانات: ${summary}
      والنتائج الحسابية التالية: (الدورة القادمة: ${calc?.nextDate}, نافذة الخصوبة: ${calc?.fertilityWindow}).
      
      المهمة:
      1. حللي الأعراض والمزاج (مثل ${data['الأعراض الجسدية_تشنجات']}) وقدمي نصائح طبية لتخفيفها.
      2. إذا كان هناك سؤال مستخدم: ${userInput || "أريد تحليلاً طبياً لحالتي الحالية"}.
      3. اجعلي الأسلوب ودوداً ومهنياً جداً. لا تكرري الحسابات الرياضية بل حللي الحالة الصحية الناتجة عنها.`;

      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };

      const aiResponse = await CapacitorHttp.post(aiOptions);
      const responseText = aiResponse.data.reply || aiResponse.data.message || "عذراً، لم أتمكن من التحليل حالياً.";

      if (!userInput) {
        const savedToken = localStorage.getItem('fcm_token');
        const saveToNeonOptions = {
          url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
          headers: { 'Content-Type': 'application/json' },
          data: {
            fcmToken: savedToken || undefined,
            user_id: 1,
            category: 'medical_report',
            title: 'تحليل طبي جديد 🩺',
            body: responseText.substring(0, 100) + "...",
            startDate: data['سجل التواريخ_تاريخ البدء'], 
            scheduled_for: calc?.nextDate,
            note: 'تحليل أعراض ذكي'
          }
        };
        await CapacitorHttp.post(saveToNeonOptions);
        await sendPushNotification('طبيبة رقة 🩺', 'تقريرك الطبي جاهز بناءً على أعراضك الأخيرة.');
      }

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: responseText, 
        time: new Date().toLocaleTimeString('ar-EG'),
      };

      setChatHistory(prev => userInput ? [...prev, { role: 'user', content: userInput, id: Date.now()+1 }, newMessage] : [...prev, newMessage]);
      setChatInput(''); 

    } catch (err) {
      console.error("خطأ في الاتصال:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCycle = () => {
    const result = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    setPrediction(result);
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '10px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '5px', borderTop: '1px solid #eee' },
    iconBtn: { background: '#fce4ec', border: 'none', padding: '8px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', flexShrink: 0 },
    inputField: { flex: 1, border: 'none', padding: '12px', borderRadius: '20px', outline: 'none', minWidth: '0' },
    sendBtn: { background: '#E91E63', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    badge: { background: '#FFF0F3', color: '#E91E63', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginTop: '5px' }
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
          <button onClick={() => setShowChat(true)} style={{ background: '#FFF', border: '1px solid #E91E63', color: '#E91E63', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold' }}>💬 استشارة فورية</button>
          <div style={{ textAlign: 'right' }}>
            <HealthIcon size={30} color="#E91E63" />
            <h3 style={{ color: '#ad1457', margin: 0 }}>طبيبة رقة الذكية</h3>
          </div>
        </div>

        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457' }}>توقع التقويم (شمسي/قمري)</button>
        
        {prediction && (
          <div style={{ marginTop: '10px', padding: '10px', borderTop: '1px dashed #FFC1D6' }}>
            <div style={{ color: '#E91E63', fontSize: '14px' }}>📅 القادمة: <strong>{prediction.nextDate}</strong></div>
            <div style={{ color: '#888', fontSize: '12px' }}>🌙 قمري: {prediction.lunarDate}</div>
            <div style={styles.badge}>✨ نافذة الخصوبة: {prediction.fertilityWindow}</div>
          </div>
        )}
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
        {loading ? "جاري تحليل الأعراض..." : "تحليل الطبيبة للأعراض والنصائح"}
      </button>

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '20px' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة: تحليل الأعراض</span>
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff' }}>مسح</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '85%',
                marginLeft: msg.role === 'user' ? 'auto' : '0',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                {msg.content}
              </div>
            ))}
            {loading && <div style={{ textAlign: 'center', color: '#E91E63' }}>جاري تحليل البيانات طبياً...</div>}
          </div>
         
          <div style={styles.chatInputArea}>
            <button onClick={() => handleMediaAction('camera')} style={styles.iconBtn}>📷</button>
            <input 
              placeholder="اسألي عن أعراضك..." 
              style={styles.inputField}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && chatInput.trim()) handleProcess(chatInput); }}
            />
            <button onClick={() => chatInput.trim() && handleProcess(chatInput)} style={styles.sendBtn}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
