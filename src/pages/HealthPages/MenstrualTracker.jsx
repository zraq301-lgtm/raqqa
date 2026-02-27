import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// استيراد وظائف الميديا من MediaService كما في الملف رقم 2
import { 
  fetchImage, 
  takePhoto, 
  uploadToVercel 
} from '../../services/MediaService';

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

  // مزامنة التخزين المحلي 
  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]);

  // جلب الإشعارات
  const fetchNotifications = async () => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/notifications?user_id=1',
        method: 'GET'
      };
      const response = await CapacitorHttp.get(options);
      if (response.status === 200 && response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // وظائف الكاميرا ورفع الصور (مقتبسة من الكود رقم 2)
  const handleMediaAction = async (type) => {
    try {
      const base64Data = type === 'camera' ? await takePhoto() : await fetchImage();
      if (!base64Data) return;

      // إرسال الصورة للمعالجة والرفع
      handleProcess("لقد رفعت صورة طبية للمراجعة", { type: 'image', data: base64Data });
    } catch (error) {
      console.error("Media error:", error);
      alert("حدث خطأ في الوصول للوسائط");
    }
  };

  // المعالجة الرئيسية (حفظ البيانات + رفع الصور + تحليل AI)
  const handleProcess = async (userInput = null, attachment = null) => {
    setLoading(true);
    const summary = JSON.stringify(data);
    const content = userInput || 'تحديث من واجهة المتابعة الذكية';
    
    try {
      let finalAttachmentUrl = null;

      // رفع الصورة إلى Vercel إذا وجدت (المنطق من الكود 2)
      if (attachment && attachment.data) {
        const userMsgId = Date.now();
        const fileName = `menstrual_img_${userMsgId}.png`;
        finalAttachmentUrl = await uploadToVercel(attachment.data, fileName, 'image/png');
      }

      // 1. حفظ البيانات في قاعدة البيانات
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: 'متابعة الدورة الشهرية والخصوبة',
          value: summary,
          note: content
        }
      });

      // 2. تحليل البيانات عبر AI
      const promptText = `أنت طبيب خبير. حلل البيانات التالية: ${summary}. 
      الرسالة: ${content}. 
      ${finalAttachmentUrl ? `رابط الصورة المرفقة: ${finalAttachmentUrl}` : ''}`;

      const aiResponse = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      });

      const responseText = aiResponse.data.reply || aiResponse.data.message || "لم أتمكن من التحليل حالياً.";
      
      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: responseText, 
        time: new Date().toLocaleTimeString('ar-EG'),
      };

      if (userInput || attachment) {
        setChatHistory(prev => [...prev, { role: 'user', content: content }, newMessage]);
      } else {
        setChatHistory(prev => [...prev, newMessage]);
      }
      
      await fetchNotifications();

    } catch (err) {
      console.error("Process error:", err);
      setChatHistory(prev => [...prev, { role: 'ai', content: "عذراً، حدث خطأ فني." }]);
    } finally {
      setLoading(false);
    }
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
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' },
    iconBtn: { background: '#fce4ec', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ"] },
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية"] },
    { id: 5, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية"] }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={{ color: '#E91E63', fontWeight: 'bold' }}>💬 المحادثة</button>
          <div style={{ textAlign: 'right' }}>
             <h3 style={{ color: '#ad1457', margin: 0 }}>متابعة الدورة الشهرية</h3>
          </div>
        </div>
        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457' }}>توقع الدورة القادمة</button>
        {prediction && <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#E91E63' }}>الموعد: {prediction}</div>}
      </div>

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#888' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #eee' }}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => handleProcess()} style={styles.btnPrimary} disabled={loading}>
        {loading ? "جاري التحليل..." : "حفظ وتحليل البيانات"}
      </button>

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span onClick={() => setShowChat(false)}>✕</span>
            <span>طبيبة رقة</span>
            <div />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#f0f0f0',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '10px', borderRadius: '12px', marginBottom: '10px', marginLeft: msg.role === 'user' ? 'auto' : '0', maxWidth: '80%'
              }}>
                {msg.content}
              </div>
            ))}
          </div>
          <div style={styles.chatInputArea}>
            <button onClick={() => handleMediaAction('camera')} style={styles.iconBtn}>📷</button>
            <button onClick={() => handleMediaAction('gallery')} style={styles.iconBtn}>🖼️</button>
            <input 
              placeholder="اكتبي سؤالك هنا..." 
              style={{ flex: 1, border: 'none', padding: '10px' }}
              onKeyDown={(e) => { 
                if(e.key === 'Enter' && e.target.value.trim()) {
                  handleProcess(e.target.value);
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
