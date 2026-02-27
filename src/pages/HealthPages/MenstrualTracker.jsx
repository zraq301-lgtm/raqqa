import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// استيراد وظائف الميديا من الخدمة المشتركة كما في الكود الثاني
import { 
  fetchImage, 
  takePhoto, 
  uploadToVercel 
} from '../../services/MediaService'; [cite: 61]

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health; [cite: 2]

  // --- حالات البيانات ---
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('menstrual_data'); [cite: 3]
    return saved ? JSON.parse(saved) : {}; [cite: 3]
  });

  const [openAccordion, setOpenAccordion] = useState(null); [cite: 4]
  const [prediction, setPrediction] = useState(''); [cite: 4]
  const [loading, setLoading] = useState(false); [cite: 4, 17]
  const [showChat, setShowChat] = useState(false); [cite: 4]
  const [notifications, setNotifications] = useState([]); [cite: 5, 8]
  
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history'); [cite: 5]
    return savedChat ? JSON.parse(savedChat) : []; [cite: 5]
  });

  // مزامنة التخزين المحلي 
  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data)); [cite: 6]
    localStorage.setItem('chat_history', JSON.stringify(chatHistory)); [cite: 6]
  }, [data, chatHistory]); [cite: 6]

  // --- جلب الإشعارات ---
  const fetchNotifications = async () => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/notifications?user_id=1', [cite: 7]
        method: 'GET'
      };
      const response = await CapacitorHttp.get(options); [cite: 8]
      if (response.data.success) {
        setNotifications(response.data.notifications); [cite: 8]
      }
    } catch (err) {
      console.error("فشل جلب الإشعارات:", err); [cite: 9]
    }
  };

  useEffect(() => {
    fetchNotifications(); [cite: 10]
  }, []);

  /**
   * وظيفة معالجة الوسائط المقتبسة من الكود الثاني
   */
  const handleMediaAction = async (type) => {
    try {
      // استخدام الوظائف المستوردة مباشرة (takePhoto / fetchImage)
      const base64Data = type === 'camera' ? await takePhoto() : await fetchImage(); [cite: 81, 82]
      
      if (!base64Data) return; [cite: 12]

      // تمرير البيانات للدالة الأساسية لمعالجتها ورفعها
      handleProcess("لقد رفعت صورة طبية للمراجعة", { type: 'image', data: base64Data }); [cite: 14, 82]
    } catch (error) {
      console.error("فشل في الوصول للوسائط:", error); [cite: 15, 83]
      alert("حدث خطأ أثناء الوصول للكاميرا أو المعرض."); [cite: 16]
    }
  };

  // --- منطق المعالجة الرئيسي (مدمج به منطق الرفع من الكود الثاني) ---
  const handleProcess = async (userInput = null, attachment = null) => {
    setLoading(true); [cite: 17, 63]
    const summary = JSON.stringify(data); [cite: 18]
    const content = userInput || 'تحديث من واجهة المتابعة الذكية'; [cite: 19, 65, 66]
    
    try {
      let finalAttachmentUrl = null;

      // مرحلة رفع الملف (تم دمج منطق الكود الثاني هنا)
      if (attachment) { [cite: 69]
        try {
          const userMsgId = Date.now(); [cite: 66, 70]
          const fileName = `img_${userMsgId}.png`; [cite: 70]
          const mimeType = 'image/png'; [cite: 70]
          finalAttachmentUrl = await uploadToVercel(attachment.data, fileName, mimeType); [cite: 13, 70]
        } catch (uploadErr) { [cite: 71]
          throw new Error(`فشل رفع الملف: ${uploadErr.message}`); [cite: 71]
        }
      }

      // 1. مرحلة الحفظ في Neon DB
      const saveOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications', [cite: 18]
        headers: { 'Content-Type': 'application/json' }, [cite: 18]
        data: {
          user_id: 1, [cite: 18]
          category: 'متابعة الدورة الشهرية والخصوبة', [cite: 18]
          value: summary, [cite: 18]
          note: content [cite: 19]
        }
      };
      await CapacitorHttp.post(saveOptions); [cite: 20]

      // 2. مرحلة التحليل عبر AI
      const promptText = `أنت طبيب متخصص خبير في طب النساء والتوليد وصحة المرأة.
      حلل حالتي بناءً على هذه البيانات: ${summary}. [cite: 20, 21]
      علماً أن معرف المستخدم (ID) هو 1.
      المطلوب منك:
      1. توقع موعد الدورة الشهرية القادمة بدقة. [cite: 21]
      2. تحديد أيام التبويض المتوقعة. [cite: 22]
      3. تقديم نصائح طبية بناءً على البيانات المسجلة. [cite: 22]
      ${content ? `سؤالي هو: ${content}` : "قدم لي تحليلاً شاملاً."} [cite: 23]
      ${finalAttachmentUrl ? `مرفق رابط الصورة الطبية: ${finalAttachmentUrl}` : ''}`; [cite: 72, 73]

      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai', [cite: 24, 72]
        headers: { 'Content-Type': 'application/json' }, [cite: 24]
        data: { prompt: promptText } [cite: 24]
      };

      const response = await CapacitorHttp.post(aiOptions); [cite: 25, 74]
      const responseText = response.data.reply || response.data.message || "عذراً رقية، لم أتمكن من التحليل حالياً."; [cite: 25, 75]
      
      const newMessage = { 
        id: Date.now(), [cite: 26, 76]
        role: 'ai', 
        content: responseText, 
        time: new Date().toLocaleTimeString('ar-EG'),
        isSaved: true 
      };

      // تحديث التاريخ
      if (userInput || attachment) { [cite: 27]
        setChatHistory(prev => [...prev, { role: 'user', content: content }, newMessage]); [cite: 27, 28]
      } else {
        setChatHistory(prev => [...prev, newMessage]); [cite: 28]
      }
      
      await fetchNotifications(); [cite: 29]

    } catch (err) {
      console.error("فشل الاتصال:", err); [cite: 30, 77]
      const errorMsg = { role: 'ai', content: `⚠️ حدث خطأ: ${err.message || "تأكدي من الاتصال بالإنترنت."}` }; [cite: 31, 79]
      setChatHistory(prev => [...prev, errorMsg]); [cite: 31, 79]
    } finally {
      setLoading(false); [cite: 32, 80]
    }
  };

  const calculateCycle = () => {
    const startDate = data['سجل التواريخ_تاريخ البدء']; [cite: 33]
    const duration = parseInt(data['سجل التواريخ_مدة الدورة']) || 28; [cite: 34]
    if (startDate) {
      const nextDate = new Date(startDate); [cite: 34]
      nextDate.setDate(nextDate.getDate() + duration); [cite: 35]
      setPrediction(nextDate.toLocaleDateString('ar-EG')); [cite: 35]
    }
  };

  const deleteResponse = (id) => {
    setChatHistory(prev => prev.filter(msg => msg.id !== id)); [cite: 35]
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' }, [cite: 36]
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' }, [cite: 36]
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }, [cite: 36]
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' }, [cite: 36]
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' }, [cite: 36, 37]
    headerChatBtn: { background: '#FFF', border: '1px solid #E91E63', color: '#E91E63', padding: '8px 15px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }, [cite: 37]
    iconBtn: { background: '#fce4ec', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' } [cite: 37]
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] }, [cite: 38]
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] }, [cite: 38]
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] }, [cite: 38]
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] }, [cite: 38]
    { id: 5, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] } [cite: 38]
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={styles.headerChatBtn}>💬 فتح الشات</button> [cite: 39]
          <div style={{ textAlign: 'right' }}>
            <HealthIcon size={30} color="#E91E63" /> [cite: 39]
            <h3 style={{ color: '#ad1457', margin: 0 }}>طبيبة رقة الذكية</h3>
          </div>
        </div>
        {notifications.length > 0 && ( [cite: 40]
          <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '15px', marginBottom: '10px', fontSize: '13px', color: '#E65100', borderRight: '4px solid #FF9800' }}>
           🔔 <strong>نصيحة طبية:</strong> {notifications[0].body} [cite: 40]
          </div>
        )}
        <button onClick={calculateCycle} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457' }}>توقع الدورة القادمة</button> [cite: 40, 41]
        {prediction && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: '#E91E63' }}>الموعد المتوقع: {prediction}</div>} [cite: 41]
      </div>

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> [cite: 41, 42]
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span> [cite: 42]
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span> [cite: 42, 43]
          </div>
          {openAccordion === sec.id && ( [cite: 43]
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => ( [cite: 43]
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>{field}</label> [cite: 44]
                  <input 
                    type={field.includes('تاريخ') ? [cite_start]'date' : 'text'} [cite: 44]
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #FFE1E9', fontSize: '13px' }}
                    value={data[`${sec.title}_${field}`] || [cite_start]''} [cite: 45]
                    [cite_start]onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})} [cite: 45]
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => { setShowChat(true); handleProcess(); }} style={styles.btnPrimary} disabled={loading}> [cite: 46, 47]
        {loading ? "جاري الحفظ والتحليل..." : "حفظ وتحليل الدورة والخصوبة"} [cite: 47, 48]
      </button>

      {showChat && ( [cite: 48]
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> [cite: 48]
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '20px' }}>✕</span> [cite: 48]
            <span style={{ fontWeight: 'bold' }}>استشارية صحة المرأة</span> [cite: 48]
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12px' }}>مسح</button> [cite: 49]
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => ( [cite: 49]
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? [cite_start]'flex-end' : 'flex-start', [cite: 50]
                background: msg.role === 'user' ? [cite_start]'#E91E63' : '#fff', [cite: 50]
                color: msg.role === 'user' ? [cite_start]'#fff' : '#333', [cite: 51]
                [cite_start]padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '85%', [cite: 51]
                marginLeft: msg.role === 'user' ? [cite_start]'auto' : '0', [cite: 52]
                [cite_start]boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'relative' [cite: 52]
              }}>
                {msg.content} [cite: 52]
                {msg.role === 'ai' && ( [cite: 53]
                  <div style={{ marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px', textAlign: 'left' }}> [cite: 53]
                    <button onClick={() => deleteResponse(msg.id)} style={{ background: 'none', border: 'none', fontSize: '10px', color: '#888' }}>🗑️ حذف</button> [cite: 53]
                    <button style={{ background: 'none', border: 'none', fontSize: '10px', color: '#E91E63', marginLeft: '10px' }}>⭐ حفظ الرد</button> [cite: 53]
                  </div>
                )}
              </div>
            ))}
            {loading && <div style={{ textAlign: 'center', color: '#E91E63', fontSize: '12px' }}>جاري تحليل بياناتك الطبية...</div>} [cite: 54]
          </div>
         
          <div style={styles.chatInputArea}>
            <button onClick={() => handleMediaAction('camera')} style={styles.iconBtn}>📷</button> [cite: 55]
            <button onClick={() => handleMediaAction('gallery')} style={styles.iconBtn}>🖼️</button> [cite: 55]
            <input 
              placeholder="اسألي عن الدورة الشهرية والخصوبة..." 
              [cite_start]style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '20px', outline: 'none' }} [cite: 55]
              onKeyDown={(e) => { 
                if(e.key === 'Enter' && e.target.value.trim()) { [cite: 56]
                  handleProcess(e.target.value); [cite: 56]
                  e.target.value = ''; [cite: 57]
                } 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker; [cite: 58]
