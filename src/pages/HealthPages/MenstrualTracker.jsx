import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// 1. استيراد الدوال من مسار الميديا المذكور 
import { takePhoto, uploadToVercel } from '../../services/MediaService';

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
  const [isProcessing, setIsProcessing] = useState(false); // حالة التحميل الخاصة بالميديا 
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

  // --- جلب الإشعارات ---
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

  /**
   * دالة مدمجة لفتح الكاميرا ورفع الصورة مباشرة (التحديث الاحترافي)
   */
  const handleCameraAndUpload = async () => {
    try {
      // المرحلة الأولى: فتح الكاميرا والتقاط الصورة بنظام أندرويد [cite: 23, 24]
      const base64Data = await takePhoto(); 
      
      if (!base64Data) return;

      setIsProcessing(true); // تفعيل حالة التحميل 
      const userMsgId = Date.now();

      // إضافة رسالة مؤقتة للمستخدم في الواجهة [cite: 8, 9]
      const tempUserMsg = { 
        id: userMsgId, 
        role: 'user',
        content: "جاري رفع الصورة المعالجة...", 
        attachment: { type: 'image', data: base64Data },
        time: new Date().toLocaleTimeString('ar-EG')
      };
      setChatHistory(prev => [...prev, tempUserMsg]);

      // المرحلة الثانية: إعداد بيانات الملف للرفع [cite: 11, 12]
      const fileName = `img_${userMsgId}.png`;
      const mimeType = 'image/png';

      // المرحلة الثالثة: الرفع الفعلي إلى Vercel Blob عبر مسار الميديا [cite: 3, 12]
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType);

      // المرحلة الرابعة: إرسال الرابط الناتج إلى API الذكاء الاصطناعي 
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، مرفق رابط الصورة الطبية للمراجعة: ${finalAttachmentUrl}`
        }
      };

      const response = await CapacitorHttp.post(aiOptions); [cite: 16]
      
      if (response.status === 200) {
        const aiReply = response.data.reply || response.data.message || "تم استلام الصورة ومعالجتها."; [cite: 17]
        const aiMsg = { 
          id: Date.now(), 
          role: 'ai', 
          content: aiReply, 
          time: new Date().toLocaleTimeString('ar-EG'),
          isSaved: true 
        };
        setChatHistory(prev => [...prev, aiMsg]); [cite: 18]
      }

    } catch (error) {
      // معالجة الأخطاء وعرضها للمستخدم [cite: 19, 21]
      console.error("خطأ في الكاميرا أو الرفع:", error);
      const errorMsg = { 
        id: Date.now(), 
        role: 'ai', 
        content: `⚠️ فشل: ${error.message || "تأكدي من صلاحيات الكاميرا والإنترنت"}`,
        time: new Date().toLocaleTimeString('ar-EG')
      };
      setChatHistory(prev => [...prev, errorMsg]); [cite: 21]
    } finally {
      setIsProcessing(false); [cite: 22]
    }
  };

  // --- منطق المعالجة الرئيسي (حفظ في نيون + تحليل الدورة الشهرية) ---
  const handleProcess = async (userInput = null) => {
    setLoading(true);
    const summary = JSON.stringify(data);
    
    try {
      const saveOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: 'متابعة الدورة الشهرية والخصوبة',
          value: summary,
          note: userInput || 'تحديث من واجهة المتابعة الذكية'
        }
      };
      await CapacitorHttp.post(saveOptions);

      const promptText = `أنت طبيب متخصص خبير في طب النساء والتوليد وصحة المرأة.
      حلل حالتي بناءً على هذه البيانات: ${summary}. 
      علماً أن معرف المستخدم (ID) هو 1.
      المطلوب منك:
      1. توقع موعد الدورة الشهرية القادمة بدقة.
      2. تحديد أيام التبويض المتوقعة.
      3. تقديم نصائح طبية بناءً على الأعراض المسجلة.
      ${userInput ? `سؤالي الإضافي هو: ${userInput}` : "قدم لي تحليلاً شاملاً لحالتي."}`;

      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };

      const response = await CapacitorHttp.post(aiOptions);
      const responseText = response.data.reply || response.data.message || "عذراً رقية، لم أتمكن من التحليل حالياً.";
      
      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: responseText, 
        time: new Date().toLocaleTimeString('ar-EG'),
        isSaved: true 
      };

      if (userInput) {
        setChatHistory(prev => [...prev, { role: 'user', content: userInput, time: new Date().toLocaleTimeString('ar-EG') }, newMessage]);
      } else {
        setChatHistory(prev => [...prev, newMessage]);
      }
      
      await fetchNotifications();
    } catch (err) {
      console.error("فشل الاتصال:", err);
      setChatHistory(prev => [...prev, { role: 'ai', content: "حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت." }]);
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

  const deleteResponse = (id) => {
    setChatHistory(prev => prev.filter(msg => msg.id !== id));
  };

  // --- التنسيقات ---
  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' },
    headerChatBtn: { background: '#FFF', border: '1px solid #E91E63', color: '#E91E63', padding: '8px 15px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
    iconBtn: { background: '#fce4ec', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] },
    { id: 5, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] }
  ];

  return (
    <div style={styles.container}>
      {/* الهيدر والكارت الرئيسي */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={styles.headerChatBtn}>💬 فتح الاستشارة</button>
          <div style={{ textAlign: 'right' }}>
            <HealthIcon size={30} color="#E91E63" />
            <h3 style={{ color: '#ad1457', margin: 0 }}>طبيبة رقة الذكية</h3>
          </div>
        </div>
        {notifications.length > 0 && (
          <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '15px', marginBottom: '10px', fontSize: '13px', color: '#E65100', borderRight: '4px solid #FF9800' }}>
           🔔 <strong>نصيحة طبية:</strong> {notifications[0].body}
          </div>
        )}
        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457' }}>توقع الدورة القادمة</button>
        {prediction && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: '#E91E63' }}>الموعد المتوقع: {prediction}</div>}
      </div>

      {/* الأقسام القابلة للطي */}
      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #FFE1E9', fontSize: '13px' }}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => { setShowChat(true); handleProcess(); }} style={styles.btnPrimary} disabled={loading}>
        {loading ? "جاري الحفظ والتحليل..." : "حفظ وتحليل الدورة والخصوبة"}
      </button>

      {/* شاشة الشات */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '20px' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>استشارية صحة المرأة</span>
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12px' }}>مسح</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '85%',
                marginLeft: msg.role === 'user' ? 'auto' : '0',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'relative'
              }}>
                {msg.attachment && msg.attachment.type === 'image' && (
                  <img src={`data:image/png;base64,${msg.attachment.data}`} alt="تحميل" style={{ width: '100%', borderRadius: '10px', marginBottom: '8px' }} />
                )}
                {msg.content}
                {msg.role === 'ai' && (
                  <div style={{ marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px', textAlign: 'left' }}>
                    <button onClick={() => deleteResponse(msg.id)} style={{ background: 'none', border: 'none', fontSize: '10px', color: '#888' }}>🗑️ حذف</button>
                    <button style={{ background: 'none', border: 'none', fontSize: '10px', color: '#E91E63', marginLeft: '10px' }}>⭐ حفظ الرد</button>
                  </div>
                )}
              </div>
            ))}
            {(loading || isProcessing) && (
              <div style={{ textAlign: 'center', color: '#E91E63', fontSize: '12px', margin: '10px' }}>
                {isProcessing ? "جاري معالجة ورفع الصورة..." : "جاري تحليل بياناتك الطبية..."}
              </div>
            )}
          </div>
         
          <div style={styles.chatInputArea}>
            <button 
              onClick={handleCameraAndUpload} 
              style={styles.iconBtn}
              disabled={isProcessing}
            >
              📷
            </button>
            <input 
              placeholder="اسألي عن الدورة الشهرية والخصوبة..." 
              style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '20px', outline: 'none' }}
              disabled={loading || isProcessing}
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
