import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// استيراد الخدمات المطلوبة للوسائط والرفع
import { fetchImage, takePhoto, uploadToVercel } from '../../services/MediaService';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const [data, setData] = useState(() => {
    try {
      const savedData = localStorage.getItem('lady_fitness');
      const savedChats = localStorage.getItem('raqqa_ai_chats');
      if (savedChats) setChatHistory(JSON.parse(savedChats));
      return savedData ? JSON.parse(savedData) : {};
    } catch (e) { return {}; }
  });

  const sections = [
    { id: "bio", title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "محيط الورك", "BMI", "نسبة العضلات"] },
    { id: "fit", title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات", "مستوى الشدة", "وقت التمرين"] },
    { id: "food", title: "التغذية الصحية", emoji: "🥗", fields: ["السعرات", "البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "جودة الأكل"] },
    { id: "water", title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "مواعيد الشرب", "أعشاب", "ديتوكس", "الترطيب", "تجنب السكر"] }
  ];

  // دالة حفظ البيانات في جدول إشعارات نيون (الرابط المحدث) [cite: 377, 378]
  const saveToNeonDB = async (category, value, note = "تحديث تلقائي") => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: "user_123", category, value, note }
      });
    } catch (err) { console.error("خطأ في المزامنة:", err); }
  };

  /**
   * دالة الوسائط الموحدة لفتح الكاميرا/المعرض والرفع مباشرة [cite: 389, 390]
   */
  const handleMediaAction = async (type) => {
    try {
      setIsLoading(true);
      const base64Data = type === 'camera' ? await takePhoto() : await fetchImage();
      if (!base64Data) return;

      const timestamp = Date.now();
      const fileName = `fit_img_${timestamp}.png`;
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, 'image/png');
      
      console.log("تم رفع صورة الرشاقة:", finalAttachmentUrl);
      setPrompt(prev => prev + ` [صورة مرفقة: ${finalAttachmentUrl}] `);
    } catch (error) {
      alert("تعذر رفع الصورة، يرجى المحاولة لاحقاً.");
    } finally { setIsLoading(false); }
  };

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      saveToNeonDB(field, value, "تحديث بيانات الرشاقة");
      return newData;
    });
  }, []);

  const handleProcessAI = async () => {
    if (!prompt) return;
    setIsLoading(true);
    const summary = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", ");
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، وهذه بياناتي الصحية: ${summary}. بصفتك طبيبة تغذية ورشاقة متخصصة في التخسيس والرياضة، حللي طلبي: ${prompt}`
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
      // حفظ الرد في الإشعارات
      saveToNeonDB("استشارة رشاقة", prompt, responseText);
    } catch (err) { setAiResponse("حدث خطأ في الاتصال."); } finally { setIsLoading(false); }
  };

  const deleteChat = (id) => {
    const filtered = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_ai_chats', JSON.stringify(filtered));
  };

  const styles = {
    container: { background: '#fdfbfb', borderRadius: '30px', padding: '20px', direction: 'rtl', maxWidth: '500px', margin: 'auto' },
    aiMasterButton: { width: '100%', background: 'linear-gradient(45deg, #4a148c, #7b1fa2)', color: 'white', border: 'none', padding: '15px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px', cursor: 'pointer' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'flex-end' },
    chatbox: { background: 'white', width: '100%', height: '90%', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '20px', overflowY: 'auto' },
    historyCard: { background: '#f5f5f5', padding: '15px', borderRadius: '15px', marginBottom: '10px', position: 'relative' },
    deleteChatBtn: { color: '#ff1744', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', marginTop: '5px' }
  };

  return (
    <div style={styles.container}>
      {/* زر الشات العلوي المطلب */}
      <button style={styles.aiMasterButton} onClick={() => setIsChatOpen(true)}>
        👩‍⚕️ استشارة طبيبة الرشاقة والتغذية
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <Icon size={28} color="#4a148c" />
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#4a148c' }}>متابعة الرشاقة والصحة</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={{ background: '#fff', borderRadius: '15px', marginBottom: '10px', border: '1px solid #eee' }}>
            <div style={{ padding: '15px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              {sec.emoji} {sec.title}
            </div>
            {openIdx === i && (
              <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {sec.fields.map((f) => (
                  <input key={f} placeholder={f} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} 
                    value={data[`${sec.id}-${f}`] || ''} onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatbox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <strong>طبيبة الرشاقة الذكية 🥗</strong>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            
            <div style={{ height: '60%', overflowY: 'auto', marginBottom: '20px' }}>
              {aiResponse && <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '15px', marginBottom: '15px' }}>{aiResponse}</div>}
              
              <h4 style={{ fontSize: '0.9rem', color: '#666' }}>سجل الردود المحفوظة:</h4>
              {chatHistory.map(chat => (
                <div key={chat.id} style={styles.historyCard}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{chat.query}</p>
                  <button style={styles.deleteChatBtn} onClick={() => deleteChat(chat.id)}>حذف الرد 🗑️</button>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <textarea style={{ width: '100%', height: '80px', borderRadius: '12px', border: '1px solid #ddd', padding: '10px' }}
                placeholder="اسألي عن التغذية، السعرات، أو التمارين..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => handleMediaAction('camera')} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#f5f5f5', border: 'none' }}>📷 كاميرا</button>
                <button onClick={() => handleMediaAction('gallery')} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#f5f5f5', border: 'none' }}>🖼️ صورة</button>
                <button onClick={handleProcessAI} style={{ flex: 2, padding: '10px', borderRadius: '10px', background: '#4a148c', color: 'white', border: 'none' }}>إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PregnancyMonitor;
