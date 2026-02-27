import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// استيراد خدمة الوسائط من المسار المحدد
import { takePhoto, fetchImage } from '../../services/MediaService';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy; [cite: 2]
  const [openIdx, setOpenIdx] = useState(null); [cite: 3]
  const [isChatOpen, setIsChatOpen] = useState(false); [cite: 3]
  const [prompt, setPrompt] = useState(""); [cite: 3]
  const [aiResponse, setAiResponse] = useState(""); [cite: 3]
  const [isLoading, setIsLoading] = useState(false); [cite: 4]
  const [chatHistory, setChatHistory] = useState([]); [cite: 4]

  // تحميل البيانات والدردشات المحفوظة من localStorage [cite: 5]
  const [data, setData] = useState(() => {
    try {
      const savedData = localStorage.getItem('lady_fitness'); [cite: 5]
      const savedChats = localStorage.getItem('raqqa_ai_chats'); [cite: 5]
      if (savedChats) setChatHistory(JSON.parse(savedChats)); [cite: 5]
      return savedData ? JSON.parse(savedData) : {}; [cite: 5]
    } catch (e) {
      return {};
    }
  });

  const sections = [
    { id: "bio", title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "محيط الورك", "BMI", "نسبة العضلات"] }, [cite: 6]
    { id: "fit", title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات", "مستوى الشدة", "وقت التمرين"] }, [cite: 6]
    { id: "food", title: "التغذية الصحية", emoji: "🥗", fields: ["السعرات", "البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "جودة الأكل"] }, [cite: 6]
    { id: "water", title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "مواعيد الشرب", "أعشاب", "ديتوكس", "الترطيب", "تجنب السكر"] }, [cite: 6]
    { id: "sleep", title: "جودة النوم", emoji: "😴", fields: ["ساعات النوم", "الاستيقاظ", "الجودة", "الاسترخاء", "الكافيين", "القيلولة"] }, [cite: 7]
    { id: "mind", title: "الصحة النفسية", emoji: "🧠", fields: ["التوتر", "التنفس", "المزاج", "الدافعية", "التأمل", "عادات إيجابية"] }, [cite: 7]
    { id: "beauty", title: "المكملات والجمال", emoji: "✨", fields: ["فيتامينات", "جلد", "شعر", "كولاجين", "حرق", "أوميجا 3"] }, [cite: 7]
    { id: "cycle", title: "الهرمونات والدورة", emoji: "🩸", fields: ["يوم الدورة", "الرغبة", "الاحتباس", "تغير الوزن", "الرياضة", "ألم الجسم"] } [cite: 7]
  ];

  // دالة حفظ البيانات في جدول إشعارات نيون [cite: 8]
  const saveToNeonDB = async (category, value) => {
    try {
      const options = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications', [cite: 8]
        headers: { 'Content-Type': 'application/json' }, [cite: 8]
        data: {
          user_id: "user_123", [cite: 8]
          category: category, [cite: 8]
          value: value, [cite: 8]
          note: "تحديث تلقائي من لوحة متابعة الرشاقة" [cite: 9]
        }
      };
      await CapacitorHttp.post(options); [cite: 10]
    } catch (err) {
      console.error("خطأ في حفظ البيانات سحابياً:", err); [cite: 10]
    }
  };

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value }; [cite: 11]
      localStorage.setItem('lady_fitness', JSON.stringify(newData)); [cite: 11]
      saveToNeonDB(field, value); [cite: 11]
      return newData;
    });
  }, []);

  // دالة معالجة الذكاء الاصطناعي [cite: 12]
  const handleProcessAI = async (imageUrl = null) => {
    if (!prompt && !imageUrl) return; [cite: 12]
    setIsLoading(true); [cite: 13]
    const summary = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", "); [cite: 13]
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai', [cite: 14]
        headers: { 'Content-Type': 'application/json' }, [cite: 14]
        data: {
          prompt: `أنا أنثى مسلمة، وهذه بياناتي الصحية: ${summary}. 
          ${imageUrl ? `رابط الصورة المرفقة: ${imageUrl}` : ''} 
          بصفتك طبيبة تغذية ورشاقة وتخسيس ورياضة متخصصة، حللي طلبي بدقة وقدمي نصيحة احترافية: ${prompt}` [cite: 14, 15]
        }
      };
      const response = await CapacitorHttp.post(options); [cite: 16]
      const responseText = response.data.reply || response.data.message; [cite: 16]
      
      const newChat = { id: Date.now(), query: prompt || "تحليل صورة", reply: responseText, attachment: imageUrl }; [cite: 16, 17]
      const updatedHistory = [newChat, ...chatHistory]; [cite: 17]
      setChatHistory(updatedHistory); [cite: 17]
      localStorage.setItem('raqqa_ai_chats', JSON.stringify(updatedHistory)); [cite: 17]
      setAiResponse(responseText); [cite: 17]
      setPrompt(""); [cite: 17]
    } catch (err) {
      setAiResponse("عذراً رفيقتي، حدث خطأ في الاتصال. تأكدي من الإنترنت."); [cite: 18]
    } finally {
      setIsLoading(false); [cite: 19]
    }
  };

  // معالجة الوسائط ورفعها إلى فيرسل بلوب 
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
          handleProcessAI(imageUrl); [cite: 24]
        }
      }
    } catch (error) {
      console.error("فشل في معالجة أو رفع الصورة:", error); [cite: 26]
      alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة."); [cite: 27]
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = (id) => {
    const filtered = chatHistory.filter(chat => chat.id !== id); [cite: 28]
    setChatHistory(filtered); [cite: 28]
    localStorage.setItem('raqqa_ai_chats', JSON.stringify(filtered)); [cite: 28]
  };

  return (
    <div style={styles.container}>
      {/* كارت الذكاء الاصطناعي الأكبر (Master Button) */}
      <button style={styles.aiMasterButton} onClick={() => setIsChatOpen(true)}>
        <div style={{fontSize: '1.6rem', marginBottom: '8px'}}>👩‍⚕️</div>
        <div style={{fontSize: '1.2rem', fontWeight: '800'}}>طبيبة رقة للرشاقة والتغذية</div>
        <div style={{fontSize: '0.85rem', fontWeight: 'normal', marginTop: '4px', opacity: 0.9}}>اضغطي هنا للتحليل الذكي والاستشارة الفورية</div>
      </button>

      <div style={styles.header}>
        <div style={styles.iconWrapper}><Icon size={28} color="#fff" /></div> [cite: 29]
        <h2 style={styles.title}>متابعة الرشاقة والصحة</h2> [cite: 29]
      </div>

      <div style={styles.accordion}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={styles.sectionCard}> [cite: 30]
            <div 
              style={{...styles.sectionHeader, borderBottom: openIdx === i ? '1px solid #eee' : 'none'}} 
              [cite_start]onClick={() => setOpenIdx(openIdx === i ? null : i)} [cite: 30]
            >
              <div style={styles.sectionTitleGroup}>
                <span style={styles.emoji}>{sec.emoji}</span> [cite: 31]
                <span style={styles.sectionTitleText}>{sec.title}</span> [cite: 31]
              </div>
              <span style={{...styles.arrow, transform: openIdx === i ? [cite_start]'rotate(180deg)' : 'rotate(0deg)'}}>▾</span> [cite: 31]
            </div>
            {openIdx === i && (
              <div style={styles.gridContainer}> [cite: 32]
                {sec.fields.map((f) => (
                  <div key={`${sec.id}-${f}`} style={styles.inputGroup}> [cite: 32]
                    <label style={styles.label}>{f}</label> [cite: 32]
                    <input 
                      style={styles.input} 
                      value={data[`${sec.id}-${f}`] || [cite_start]''} [cite: 33, 34]
                      [cite_start]onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)} [cite: 34]
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
        <div style={styles.chatOverlay}> [cite: 35]
          <div style={styles.chatbox}> [cite: 35]
            <div style={styles.chatHeader}> [cite: 36]
              <span>استشارة طبيبة رقة 👩‍⚕️</span> [cite: 36]
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>✕</button> [cite: 36]
            </div>
            <div style={styles.chatContent}> [cite: 36]
              {isLoading && <div style={styles.loading}>جاري تحليل بياناتك ورفع الملفات... ✨</div>} [cite: 36]
              
              {aiResponse && !isLoading && (
                <div style={styles.latestReply}> [cite: 37]
                  <strong>رد الطبيبة:</strong> [cite: 37]
                  <p>{aiResponse}</p> [cite: 37]
                </div>
              )}

              {/* قائمة سجل الاستشارات داخل الشات */}
              <div style={styles.historySection}> [cite: 38]
                <h4 style={styles.historyTitle}>سجل الاستشارات المحفوظة:</h4> [cite: 38]
                {chatHistory.length === 0 ? (
                  <p style={{fontSize: '0.8rem', color: '#999', textAlign: 'center'}}>لا يوجد استشارات سابقة بعد.</p>
                ) : (
                  chatHistory.map(chat => (
                    <div key={chat.id} style={styles.historyCard}> [cite: 38]
                      <div style={styles.historyHeader}>
                        <span style={styles.historyQuery}><strong>س:</strong> {chat.query}</span>
                        <button style={styles.deleteChatBtn} onClick={() => deleteChat(chat.id)}>حذف 🗑️</button> [cite: 39]
                      </div>
                      <div style={styles.historyReply}>
                        <strong>ج:</strong> {chat.reply}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.chatFooter}> [cite: 40]
              <textarea 
                style={styles.chatInput} 
                [cite_start]placeholder="اكتبي سؤالك عن التغذية والرشاقة..." [cite: 40]
                [cite_start]value={prompt} [cite: 40]
                [cite_start]onChange={(e) => setPrompt(e.target.value)} [cite: 41]
              />
              <div style={styles.toolBar}> [cite: 41]
                <button style={styles.toolBtn} onClick={() => handleMediaAction('camera')}>📷 كاميرا</button> [cite: 41]
                <button style={styles.toolBtn} onClick={() => handleMediaAction('gallery')}>📁 صورة</button> [cite: 41]
                <button style={styles.sendBtn} onClick={() => handleProcessAI()}>إرسال</button> [cite: 41]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background: 'linear-gradient(160deg, #fdfbfb 0%, #ebedee 100%)', borderRadius: '30px', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', direction: 'rtl', maxWidth: '500px', margin: 'auto' }, [cite: 43]
  aiMasterButton: { width: '100%', background: 'linear-gradient(45deg, #4a148c, #7b1fa2)', color: 'white', border: 'none', padding: '20px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(123, 31, 162, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }, [cite: 43]
  iconWrapper: { background: 'linear-gradient(45deg, #6a1b9a, #ab47bc)', padding: '10px', borderRadius: '15px', display: 'flex' }, [cite: 43]
  title: { margin: 0, fontSize: '1.3rem', color: '#4a148c', fontWeight: '800' }, [cite: 43]
  sectionCard: { background: '#fff', borderRadius: '20px', marginBottom: '10px', overflow: 'hidden', border: '1px solid #f0f0f0' }, [cite: 44]
  sectionHeader: { padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, [cite: 44]
  sectionTitleGroup: { display: 'flex', alignItems: 'center', gap: '10px' }, [cite: 44]
  sectionTitleText: { fontSize: '0.95rem', fontWeight: '600' }, [cite: 44]
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '15px', background: '#fafafa' }, [cite: 44]
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' }, [cite: 44]
  label: { fontSize: '0.7rem', color: '#7b1fa2', fontWeight: '600' }, [cite: 44]
  input: { padding: '10px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '0.85rem', outline: 'none' }, [cite: 44]
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px' }, [cite: 45]
  chatbox: { background: 'white', width: '100%', maxWidth: '450px', borderRadius: '25px', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }, [cite: 45]
  chatHeader: { background: '#4a148c', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }, [cite: 45]
  chatContent: { flex: 1, padding: '15px', overflowY: 'auto', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '15px' }, [cite: 45]
  chatFooter: { padding: '15px', background: 'white', borderTop: '1px solid #eee' }, [cite: 45]
  chatInput: { width: '100%', height: '70px', borderRadius: '12px', border: '1px solid #ddd', padding: '10px', outline: 'none', resize: 'none', fontSize: '0.9rem' }, [cite: 46]
  toolBar: { display: 'flex', gap: '8px', marginTop: '10px' }, [cite: 46]
  toolBtn: { padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#f5f5f5', flex: 1, cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }, [cite: 46]
  sendBtn: { flex: 2, background: '#4a148c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }, [cite: 46]
  latestReply: { background: '#e3f2fd', padding: '15px', borderRadius: '15px', borderRight: '5px solid #2196f3', fontSize: '0.9rem' }, [cite: 46]
  historySection: { marginTop: '10px' }, [cite: 38]
  historyTitle: { fontSize: '0.9rem', color: '#4a148c', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }, [cite: 38]
  historyCard: { background: 'white', padding: '12px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #eceff1', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }, [cite: 46]
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '10px' },
  historyQuery: { fontSize: '0.85rem', color: '#333', flex: 1 },
  historyReply: { fontSize: '0.85rem', color: '#666', background: '#fcfcfc', padding: '8px', borderRadius: '8px' },
  deleteChatBtn: { color: '#ff5252', border: 'none', background: '#fff1f1', fontSize: '0.7rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }, [cite: 47]
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }, [cite: 47]
  loading: { textAlign: 'center', padding: '10px', color: '#7b1fa2', fontStyle: 'italic', fontSize: '0.85rem' } [cite: 47]
};

export default PregnancyMonitor;
