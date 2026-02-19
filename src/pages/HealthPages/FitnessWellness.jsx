import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // تحميل البيانات والدردشات المحفوظة من localStorage [cite: 5]
  const [data, setData] = useState(() => {
    try {
      const savedData = localStorage.getItem('lady_fitness');
      const savedChats = localStorage.getItem('raqqa_ai_chats');
      if (savedChats) setChatHistory(JSON.parse(savedChats));
      return savedData ? JSON.parse(savedData) : {};
    } catch (e) {
      return {};
    }
  });

  // تم تصحيح بناء المصفوفة هنا لتجنب خطأ Build 
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

  // دالة حفظ البيانات في Neon DB [cite: 8, 9, 10]
  const saveToNeonDB = async (category, value) => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: "user_123",
          category: category,
          value: value,
          note: "تحديث تلقائي من لوحة المتابعة"
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

  // دالة معالجة الذكاء الاصطناعي (طبيبة رقة) [cite: 14, 15, 16, 17]
  const handleProcessAI = async () => {
    if (!prompt) return;
    setIsLoading(true);
    const summary = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", ");
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، وهذه بياناتي الصحية الحالية: ${summary}. بصفتك طبيبة تغذية ورشاقة متخصصة، قدمي لي نصيحة مطولة وتحليلاً دقيقاً لطلبي التالي: ${prompt}`
        }
      };
      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;
      const newChat = { id: Date.now(), query: prompt, reply: responseText };
      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('raqqa_ai_chats', JSON.stringify(updatedHistory));
      setAiResponse(responseText);
      setPrompt("");
    } catch (err) {
      setAiResponse("عذراً رفيقتي، حدث خطأ في الاتصال. تأكدي من الإنترنت.");
    } finally {
      setIsLoading(false);
    }
  };

  // تفعيل أدوات الوسائط (كاميرا، ميكروفون، ملفات) [cite: 33]
  const handleMediaAction = (actionType) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (actionType === 'camera') input.setAttribute('capture', 'environment');
    if (actionType === 'mic') input.accept = 'audio/*';
    if (actionType === 'file') input.accept = 'image/*,application/pdf';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) console.log(`تم اختيار ملف: ${file.name}`);
    };
    input.click();
  };

  const deleteChat = (id) => {
    const filtered = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_ai_chats', JSON.stringify(filtered));
  };

  return (
    <div style={styles.container}>
      <button style={styles.aiMasterButton} onClick={() => setIsChatOpen(true)}>
        👩‍⚕️ طبيبة رقة للتغذية (تحليل ذكي)
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
            {openIdx === i && (
              <div style={styles.gridContainer}>
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
            )}
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
              {isLoading && <div style={styles.loading}>جاري تحليل بياناتك... ✨</div>}
              {aiResponse && !isLoading && (
                <div style={styles.latestReply}>
                  <strong>رد الطبيبة:</strong>
                  <p>{aiResponse}</p>
                </div>
              )}
              <div style={styles.historySection}>
                <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '5px'}}>سجل الاستشارات المحفوظة:</h4>
                {chatHistory.map(chat => (
                  <div key={chat.id} style={styles.historyCard}>
                    <p style={{fontSize: '0.85rem'}}><strong>س:</strong> {chat.query}</p>
                    <button style={styles.deleteChatBtn} onClick={() => deleteChat(chat.id)}>حذف الرد 🗑️</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.chatFooter}>
              <textarea 
                style={styles.chatInput} 
                placeholder="اكتبي سؤالك هنا للطبيبة..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div style={styles.toolBar}>
                <button style={styles.toolBtn} onClick={() => handleMediaAction('camera')}>📷</button>
                <button style={styles.toolBtn} onClick={() => handleMediaAction('mic')}>🎤</button>
                <button style={styles.toolBtn} onClick={() => handleMediaAction('file')}>📁</button>
                <button style={styles.sendBtn} onClick={handleProcessAI}>إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background: 'linear-gradient(160deg, #fdfbfb 0%, #ebedee 100%)', borderRadius: '30px', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', direction: 'rtl', maxWidth: '500px', margin: 'auto' },
  aiMasterButton: { width: '100%', background: 'linear-gradient(45deg, #4a148c, #7b1fa2)', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', fontWeight: 'bold', marginBottom: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(123, 31, 162, 0.3)' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  iconWrapper: { background: 'linear-gradient(45deg, #6a1b9a, #ab47bc)', padding: '10px', borderRadius: '15px', display: 'flex' },
  title: { margin: 0, fontSize: '1.3rem', color: '#4a148c', fontWeight: '800' },
  sectionCard: { background: '#fff', borderRadius: '20px', marginBottom: '10px', overflow: 'hidden', border: '1px solid #f0f0f0' },
  sectionHeader: { padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  sectionTitleText: { fontSize: '0.95rem', fontWeight: '600' },
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '15px', background: '#fafafa' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.7rem', color: '#7b1fa2', fontWeight: '600' },
  input: { padding: '10px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '0.85rem', outline: 'none' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px' },
  chatbox: { background: 'white', width: '100%', maxWidth: '450px', borderRadius: '25px', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { background: '#4a148c', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
  chatContent: { flex: 1, padding: '20px', overflowY: 'auto', background: '#f9f9f9' },
  chatFooter: { padding: '15px', background: 'white', borderTop: '1px solid #eee' },
  chatInput: { width: '100%', height: '60px', borderRadius: '12px', border: '1px solid #ddd', padding: '10px', outline: 'none', resize: 'none' },
  toolBar: { display: 'flex', gap: '8px', marginTop: '10px' },
  toolBtn: { padding: '8px', borderRadius: '8px', border: '1px solid #eee', background: '#f5f5f5', flex: 1, cursor: 'pointer' },
  sendBtn: { flex: 3, background: '#4a148c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  latestReply: { background: '#e1f5fe', padding: '15px', borderRadius: '15px', marginBottom: '20px', borderRight: '5px solid #03a9f4' },
  historyCard: { background: 'white', padding: '10px', borderRadius: '12px', marginBottom: '8px', border: '1px solid #eee', position: 'relative' },
  deleteChatBtn: { color: 'red', border: 'none', background: 'none', fontSize: '0.7rem', cursor: 'pointer', marginTop: '5px' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }
};

export default PregnancyMonitor;
