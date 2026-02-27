import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { Send, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
// استيراد الخدمات من ملف MediaService كما في الكود الثاني
import { 
  fetchImage, takePhoto, uploadToVercel 
} from '../../services/MediaService'; [cite: 61]

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health; [cite: 2]
  const scrollRef = useRef(null);

  // --- حالات البيانات ---
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('menstrual_data');
    return saved ? JSON.parse(saved) : {};
  }); [cite: 3]

  const [openAccordion, setOpenAccordion] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notifications, setNotifications] = useState([]); [cite: 4, 5]
  
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [];
  }); [cite: 5]

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    if (showChat) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, showChat]);

  // مزامنة التخزين المحلي 
  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]); [cite: 6]

  // --- جلب الإشعارات ---
  const fetchNotifications = async () => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/notifications?user_id=1',
        method: 'GET'
      };
      const response = await CapacitorHttp.get(options); [cite: 7, 8]
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error("فشل جلب الإشعارات:", err);
    }
  }; [cite: 8, 9]

  useEffect(() => {
    fetchNotifications();
  }, []); [cite: 10]

  /**
   * دالة معالجة الصور المحسنة (مقتبسة من منطق الكود الثاني)
   */
  const handleImageAction = async (type) => {
    try {
      // استخدام دوال MediaService المستوردة
      const base64Data = type === 'camera' ? await takePhoto() : await fetchImage(); [cite: 81, 82]
      if (!base64Data) return;

      // إرسال الصورة للمعالجة فوراً كما في الكود الثاني
      await handleProcess("لقد أرسلتُ صورة طبية للمراجعة", { type: 'image', data: base64Data }); [cite: 82]
    } catch (error) {
      console.error("فشل في الوصول للوسائط:", error);
      const errorMsg = { 
        id: Date.now(), 
        role: 'ai', 
        content: "عذراً، فشل الوصول للكاميرا أو رفع الصورة. تأكدي من الأذونات.",
        time: new Date().toLocaleTimeString('ar-EG')
      };
      setChatHistory(prev => [...prev, errorMsg]);
    }
  }; [cite: 83, 84]

  // --- منطق المعالجة الرئيسي (الحفظ والتحليل) ---
  const handleProcess = async (userInput = null, attachment = null) => {
    setLoading(true);
    const summary = JSON.stringify(data);
    const content = userInput || (attachment ? "تحليل صورة مرفقة" : "تحديث من واجهة المتابعة"); [cite: 17, 18, 65]
    
    try {
      let finalAttachmentUrl = null;

      // مرحلة رفع الملف إلى Vercel Blob (منطق الكود الثاني)
      if (attachment) {
        const fileName = `img_${Date.now()}.png`;
        finalAttachmentUrl = await uploadToVercel(attachment.data, fileName, 'image/png'); [cite: 70]
      }

      // 1. مرحلة الحفظ في Neon DB
      const saveOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: 'متابعة الدورة الشهرية والخصوبة',
          value: summary,
          note: content + (finalAttachmentUrl ? ` (صورة: ${finalAttachmentUrl})` : '')
        }
      };
      await CapacitorHttp.post(saveOptions); [cite: 18, 19, 20]

      // 2. مرحلة التحليل عبر AI
      const promptText = `أنت طبيب متخصص خبير في طب النساء والتوليد وصحة المرأة.
        حلل حالتي بناءً على هذه البيانات: ${summary}. 
        ${finalAttachmentUrl ? `مرفق رابط صورة طبية للمراجعة: ${finalAttachmentUrl}` : ''}
        المطلوب منك:
        1. توقع موعد الدورة القادمة بدقة.
        2. تحديد أيام التبويض المتوقعة.
        3. تقديم نصائح طبية بناءً على الأعراض المسجلة.
        سؤالي هو: ${content}`; [cite: 20, 21, 22, 23, 72]

      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };

      const response = await CapacitorHttp.post(aiOptions); [cite: 24, 25]
      const responseText = response.data.reply || response.data.message || "عذراً رقية، لم أتمكن من التحليل حالياً.";

      const newMessage = { 
        id: Date.now(),
        role: 'ai', 
        content: responseText, 
        time: new Date().toLocaleTimeString('ar-EG'),
        isSaved: true 
      };

      // تحديث واجهة الشات
      if (userInput || attachment) {
        setChatHistory(prev => [...prev, { role: 'user', content: content }, newMessage]);
      } else {
        setChatHistory(prev => [...prev, newMessage]);
      }
      
      await fetchNotifications(); [cite: 26, 27, 28, 29]
    } catch (err) {
      console.error("فشل الاتصال:", err);
      const errorMsg = { role: 'ai', content: `حدث خطأ: ${err.message || "تأكدي من الاتصال بالإنترنت."}` };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }; [cite: 30, 31, 32, 78]

  const calculateCycle = () => {
    const startDate = data['سجل التواريخ_تاريخ البدء'];
    const duration = parseInt(data['سجل التواريخ_مدة الدورة']) || 28;
    if (startDate) {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + duration);
      setPrediction(nextDate.toLocaleDateString('ar-EG'));
    }
  }; [cite: 33, 34, 35]

  const deleteResponse = (id) => {
    setChatHistory(prev => prev.filter(msg => msg.id !== id));
  }; [cite: 35]

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '15px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' },
    headerChatBtn: { background: '#FFF', border: '1px solid #E91E63', color: '#E91E63', padding: '8px 15px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
    iconBtn: { background: '#fce4ec', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', color: '#E91E63', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  }; [cite: 36, 37]

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع", "ألم ظهر"] },
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء", "بكاء"] },
    { id: 5, title: "ملاحظات إضافية", emoji: "📝", fields: ["كمية التدفق", "أدوية", "فيتامينات"] }
  ]; [cite: 38]

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={styles.headerChatBtn}>💬 فتح الشات</button>
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
                {msg.content}
                {msg.role === 'ai' && (
                  <div style={{ marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px', textAlign: 'left' }}>
                    <button onClick={() => deleteResponse(msg.id)} style={{ background: 'none', border: 'none', fontSize: '10px', color: '#888' }}>🗑️ حذف</button>
                    <button style={{ background: 'none', border: 'none', fontSize: '10px', color: '#E91E63', marginLeft: '10px' }}>⭐ حفظ الرد</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
            {loading && <div style={{ textAlign: 'center', color: '#E91E63', fontSize: '12px' }}><Loader2 className="animate-spin inline-block mr-2" size={14} /> جاري تحليل بياناتك الطبية...</div>}
          </div>
         
          <div style={styles.chatInputArea}>
            {/* استخدام أيقونات Lucide الاحترافية ومنطق الكود الثاني */}
            <button onClick={() => handleImageAction('camera')} style={styles.iconBtn}>
              <Camera size={20} />
            </button>
            <button onClick={() => handleImageAction('gallery')} style={styles.iconBtn}>
              <ImageIcon size={20} />
            </button>
            <input 
              placeholder="اسألي عن الدورة الشهرية والخصوبة..." 
              style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '20px', outline: 'none' }}
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
