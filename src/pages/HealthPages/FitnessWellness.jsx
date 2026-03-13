import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// استيراد خدمة الوسائط من المسار المحدد
import { takePhoto, fetchImage } from '../../services/MediaService';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // تحميل البيانات والدردشات المحفوظة من localStorage
  const [data, setData] = useState(() => {
    try {
      const savedData = localStorage.getItem('lady_fitness');
      const savedChats = localStorage.getItem('raqqa_ai_chats');
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        setChatHistory(parsedChats);
      }
      return savedData ? JSON.parse(savedData) : {};
    } catch (e) {
      return {};
    }
  });

  // --- دالة الحفظ والإشعار المطلوبة ---
  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    const scheduledDate = new Date();
    scheduledDate.setMonth(scheduledDate.getMonth() + 9);

    try {
      // 1. حفظ البيانات في نيون
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'medical_report',
          title: `تقرير جديد: ${categoryTitle} 🩺`,
          body: currentAnalysis.substring(0, 100) + "...",
          scheduled_for: scheduledDate.toISOString(),
          note: `تحليل آلي لـ ${categoryTitle}`
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);

      // 2. إرسال إشعار FCM
      if (savedToken) {
        const fcmOptions = {
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'تنبيه طبي جديد 🔔',
            body: `تم تحديث ملفك الطبي بخصوص ${categoryTitle}.`,
            data: { type: 'medical_report' }
          }
        };
        await CapacitorHttp.post(fcmOptions);
      }
      console.log("تم الحفظ والإرسال بنجاح ✅");
    } catch (err) {
      console.error("خطأ في عملية المزامنة:", err);
    }
  };

  const sections = [
    { id: "bio", title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "محيط الورك", "BMI", "نسبة العضلات"] },
    { id: "fit", title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات", "مستوى الشدة", "وقت التمرين"] },
    { id: "food", title: "التغذية الصحية", emoji: "🥗", fields: ["السعرات", "البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "جودة الأكل"] },
    { id: "water", title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "مواعيد الشرب", "أعشاب", "ديتوكس", "الترطيب", "تجنب السكر"] },
    { id: "sleep", title: "جودة النوم", emoji: "😴", fields: ["ساعات النوم", "الاستيقاظ", "الجودة", "الاسترخاء", "الكافيين", "القيلولة"] },
    { id: "mind", title: "الصحة النفسية", emoji: "🧠", fields: ["التوتر", "التنفس", "المزاج", "الدافعية", "التأمل", "عادات إيجابية"] },
    { id: "beauty", title: "المكملات والجمال", emoji: "✨", fields: ["فيتامينات", "جلد", "شعر", "كولاجين", "حرق", "أوميجا 3"] },
    { id: "cycle", title: "الهرمونات والدورة", emoji: "🩸", fields: ["يوم الدورة", "الرغبة", "الاحتباس", "تغير الوزن", "الرياضة", "ألم الجسم"] }
  ];

  const saveToNeonDB = async (category, value) => {
    try {
      const options = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: "user_123",
          category: category,
          value: value,
          note: "تحديث تلقائي من لوحة متابعة الرشاقة"
        }
      };
      await CapacitorHttp.post(options);
    } catch (err) {
      console.error("خطأ في حفظ البيانات سحابياً:", err);
    }
  };

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      saveToNeonDB(field, value);
      return newData;
    });
  }, []);

  const handleProcessAI = async (imageUrl = null) => {
    if (!prompt && !imageUrl) return;
    setIsLoading(true);
    const summary = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", ");
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، وهذه بياناتي الصحية: ${summary}. 
          ${imageUrl ? `رابط الصورة المرفقة: ${imageUrl}` : ''} 
          بصفتك طبيبة تغذية ورشاقة وتخسيس ورياضة متخصصة، حللي طلبي بدقة وقدمي نصيحة احترافية: ${prompt}`
        }
      };
      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;
      
      const newChat = { id: Date.now(), query: prompt || "تحليل صورة", reply: responseText, attachment: imageUrl };
      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('raqqa_ai_chats', JSON.stringify(updatedHistory));
      setAiResponse(responseText);
      setPrompt("");

      // استدعاء دالة الحفظ والإشعار بعد استلام الرد من الذكاء الاصطناعي
      await saveAndNotify("الاستشارة الصحية", responseText);

    } catch (err) {
      setAiResponse("عذراً رفيقتي، حدث خطأ في الاتصال.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaAction = async (type) => {
    try {
      setIsLoading(true);
      let base64Data;
      if (type === 'camera') {
         base64Data = await takePhoto(); 
      } else {
         base64Data = await fetchImage();
      }

      if (base64Data) {
        const uploadOptions = {
          url: 'https://raqqa-v6cd.vercel.app/api/upload',
          headers: { 'Content-Type': 'application/json' },
          data: {
            image: base64Data,
            filename: `lady_fit_${Date.now()}.png`
          }
        };

        const uploadResponse = await CapacitorHttp.post(uploadOptions);
        const imageUrl = uploadResponse.data.url;

        if (imageUrl) {
          handleProcessAI(imageUrl);
        }
      }
    } catch (error) {
      console.error("فشل في معالجة أو رفع الصورة:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = (id) => {
    const filtered = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_ai_chats', JSON.stringify(filtered));
  };

  return (
    <div style={styles.container}>
      {/* كارت الذكاء الاصطناعي المكبر */}
      <button style={styles.aiMasterButton} onClick={() => setIsChatOpen(true)}>
        <div style={{fontSize: '2rem', marginBottom: '10px'}}>👩‍⚕️</div>
        <div style={{fontSize: '1.3rem', fontWeight: 'bold'}}>طبيبة رقة للرشاقة والتغذية</div>
        <div style={{fontSize: '0.9rem', fontWeight: 'normal', marginTop: '5px', opacity: 0.9}}>اضغطي هنا للتحليل الذكي والاستشارة الفورية</div>
      </button>

      <div style={styles.header}>
        <div style={styles.iconWrapper}><Icon size={28} color="#fff" /></div>
        <h2 style={styles.title}>متابعة الرشاقة والصحة</h2>
      </div>

      <div style={styles.accordion}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={styles.sectionCard}>
            <div 
              style={{...styles.sectionHeader, borderBottom: openIdx === i ? '1px solid #eee' : 'none'}} 
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <div style={styles.sectionTitleGroup}>
                <span style={styles.emoji}>{sec.emoji}</span>
                <span style={styles.sectionTitleText}>{sec.title}</span>
              </div>
              <span style={{...styles.arrow, transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)'}}>▾</span>
            </div>
            
            <div style={{
              ...styles.gridContainer, 
              maxHeight: openIdx === i ? '1000px' : '0',
              padding: openIdx === i ? '15px' : '0 15px',
              opacity: openIdx === i ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.4s ease-in-out'
            }}>
              {sec.fields.map((f) => (
                <div key={`${sec.id}-${f}`} style={styles.inputGroup}>
                  <label style={styles.label}>{f}</label>
                  <input 
                    style={styles.input} 
                    value={data[`${sec.id}-${f}`] || ''}
                    onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)}
                    placeholder="..."
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatbox}>
            <div style={styles.chatHeader}>
              <span>استشارة طبيبة رقة 👩‍⚕️</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.chatContent}>
              {isLoading && <div style={styles.loading}>جاري التحليل... ✨</div>}
              {aiResponse && !isLoading && (
                <div style={styles.latestReply}>
                  <strong>رد الطبيبة:</strong>
                  <p>{aiResponse}</p>
                </div>
              )}
              <div style={styles.historySection}>
                <h4 style={styles.historyTitle}>سجل الاستشارات:</h4>
                {chatHistory.map(chat => (
                  <div key={chat.id} style={styles.historyCard}>
                    <div style={styles.historyHeader}>
                      <span style={styles.historyQuery}><strong>س:</strong> {chat.query}</span>
                      <button style={styles.deleteChatBtn} onClick={() => deleteChat(chat.id)}>حذف 🗑️</button>
                    </div>
                    <div style={styles.historyReply}>
                      <strong>ج:</strong> {chat.reply}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.chatFooter}>
              <textarea 
                style={styles.chatInput} 
                placeholder="اكتبي سؤالك هنا..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div style={styles.toolBar}>
                <button style={styles.toolBtn} onClick={() => handleMediaAction('camera')}>📷</button>
                <button style={styles.toolBtn} onClick={() => handleMediaAction('gallery')}>📁</button>
                <button style={styles.sendBtn} onClick={() => handleProcessAI()}>إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { 
    background: 'linear-gradient(160deg, #fdfbfb 0%, #ebedee 100%)', 
    borderRadius: '30px', 
    padding: '20px', 
    direction: 'rtl', 
    maxWidth: '500px', 
    margin: 'auto',
    maxHeight: '100vh',
    overflowY: 'auto', // للسماح بالتمرير عند كثرة البيانات
    scrollbarWidth: 'none'
  },
  aiMasterButton: { width: '100%', background: 'linear-gradient(45deg, #4a148c, #7b1fa2)', color: 'white', border: 'none', padding: '25px', borderRadius: '25px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  iconWrapper: { background: 'linear-gradient(45deg, #6a1b9a, #ab47bc)', padding: '10px', borderRadius: '15px', display: 'flex' },
  title: { margin: 0, fontSize: '1.3rem', color: '#4a148c', fontWeight: '800' },
  sectionCard: { background: '#fff', borderRadius: '20px', marginBottom: '10px', overflow: 'hidden', border: '1px solid #f0f0f0' },
  sectionHeader: { padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  sectionTitleText: { fontSize: '0.95rem', fontWeight: '600' },
  arrow: { transition: 'transform 0.3s ease' },
  gridContainer: { 
    display: 'grid', 
    gridTemplateColumns: '1fr', // جعل المدخلات تحت بعضها لسلاسة العرض
    gap: '12px', 
    background: '#fafafa' 
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.8rem', color: '#7b1fa2', fontWeight: 'bold' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none', background: '#fff' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  chatbox: { background: 'white', width: '90%', maxWidth: '450px', borderRadius: '25px', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { background: '#4a148c', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' },
  chatContent: { flex: 1, padding: '15px', overflowY: 'auto' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
  chatInput: { width: '100%', height: '60px', borderRadius: '12px', border: '1px solid #ddd', padding: '10px', fontSize: '0.9rem' },
  toolBar: { display: 'flex', gap: '8px', marginTop: '10px' },
  toolBtn: { padding: '10px', borderRadius: '8px', background: '#f5f5f5', border: '1px solid #eee', flex: 1 },
  sendBtn: { flex: 2, background: '#4a148c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  latestReply: { background: '#f3e5f5', padding: '15px', borderRadius: '15px', marginBottom: '15px', borderRight: '4px solid #7b1fa2' },
  historyCard: { background: '#f8f9fa', padding: '10px', borderRadius: '12px', marginBottom: '10px' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  historyReply: { fontSize: '0.8rem', color: '#666' },
  deleteChatBtn: { color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' },
  loading: { textAlign: 'center', padding: '10px', color: '#7b1fa2' }
};

export default PregnancyMonitor;
