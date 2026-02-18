import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedResponses, setSavedResponses] = useState([]);

  // تحميل البيانات والردود المحفوظة
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('lady_fitness');
      const chatLogs = localStorage.getItem('raqqa_chats');
      if (chatLogs) setSavedResponses(JSON.parse(chatLogs));
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const sections = [
    { id: "bio", title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "كتلة الجسم BMI"] },
    { id: "fit", title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "مستوى الشدة"] },
    { id: "food", title: "التغذية الصحية", emoji: "🥗", fields: ["السعرات", "البروتين", "الألياف", "الدهون الصحية"] },
    { id: "water", title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "الديتوكس", "الترطيب", "تجنب السكر"] }
  ];

  // 1. حفظ البيانات في Neon DB عبر الـ API المرفوع
  const syncToNeon = async (field, value) => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1, // معرف افتراضي
          category: field,
          value: value,
          note: "تحديث من واجهة الرشاقة"
        }
      };
      await CapacitorHttp.post(options);
    } catch (err) {
      console.error("Neon Sync Error:", err);
    }
  };

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      syncToNeon(field, value); // مزامنة فورية
      return newData;
    });
  }, []);

  // 2. منطق الذكاء الاصطناعي (طبيبة رقة)
  const handleAskAI = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setShowChat(true);

    const summary = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", ");
    
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، بياناتي الحالية هي: ${summary}. بصفتك طبيبة تغذية ورشاقة متخصصة، أريد نصيحة مطولة ودقيقة بخصوص: ${prompt}`
        }
      };

      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;
      
      setAiResponse(responseText);
      
      // حفظ الرد في القائمة
      const newResponse = { id: Date.now(), text: responseText, query: prompt };
      const updatedLogs = [newResponse, ...savedResponses];
      setSavedResponses(updatedLogs);
      localStorage.setItem('raqqa_chats', JSON.stringify(updatedLogs));
      
    } catch (err) {
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResponse = (id) => {
    const filtered = savedResponses.filter(item => item.id !== id);
    setSavedResponses(filtered);
    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
  };

  return (
    <div style={styles.container}>
      {/* زر طبيبة رقة العلوي */}
      <button style={styles.aiButton} onClick={() => setShowChat(!showChat)}>
        <span>👩‍⚕️ طبيبة رقة للتغذية</span>
      </button>

      <div style={styles.header}>
        <div style={styles.iconWrapper}><Icon size={24} color="#fff" /></div>
        <h2 style={styles.title}>متابعة الرشاقة</h2>
      </div>

      {/* أقسام البيانات */}
      {!showChat && (
        <div style={styles.accordion}>
          {sections.map((sec, i) => (
            <div key={sec.id} style={styles.sectionCard}>
              <div style={styles.sectionHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <span style={styles.sectionTitleText}>{sec.emoji} {sec.title}</span>
                <span>{openIdx === i ? '▲' : '▼'}</span>
              </div>
              {openIdx === i && (
                <div style={styles.gridContainer}>
                  {sec.fields.map((f) => (
                    <div key={f} style={styles.inputGroup}>
                      <label style={styles.label}>{f}</label>
                      <input 
                        style={styles.input} 
                        value={data[`${sec.id}-${f}`] || ''} 
                        onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* واجهة شات طبيبة رقة */}
      {showChat && (
        <div style={styles.chatContainer}>
          <div style={styles.chatHeader}>
            <span>استشارة الطبيبة المتخصصة</span>
            <button onClick={() => setShowChat(false)} style={styles.closeBtn}>×</button>
          </div>
          
          <div style={styles.chatBody}>
            {isLoading ? <p>جاري تحليل بياناتك رفيقتي...</p> : <div style={styles.aiReply}>{aiResponse}</div>}
            
            <hr />
            <h4>سجل الاستشارات:</h4>
            {savedResponses.map(item => (
              <div key={item.id} style={styles.savedItem}>
                <p><strong>سؤالك:</strong> {item.query}</p>
                <button onClick={() => deleteResponse(item.id)} style={styles.deleteBtn}>حذف الرد 🗑️</button>
              </div>
            ))}
          </div>

          <div style={styles.chatInputArea}>
            <textarea 
              style={styles.textArea} 
              placeholder="اكتبي سؤالك هنا..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div style={styles.actionRow}>
              <button style={styles.actionBtn}>📷</button>
              <button style={styles.actionBtn}>🎤</button>
              <button style={styles.actionBtn}>📁</button>
              <button style={styles.sendBtn} onClick={handleAskAI}>إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background: '#f8f9fa', borderRadius: '25px', padding: '20px', direction: 'rtl', maxWidth: '450px', margin: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  aiButton: { width: '100%', background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)', color: '#fff', border: 'none', padding: '12px', borderRadius: '15px', marginBottom: '15px', fontWeight: 'bold', cursor: 'pointer' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  iconWrapper: { background: '#6a1b9a', padding: '8px', borderRadius: '12px' },
  title: { fontSize: '1.2rem', color: '#4a148c', margin: 0 },
  sectionCard: { background: '#fff', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden', border: '1px solid #eee' },
  sectionHeader: { padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', background: '#f3e5f5' },
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px' },
  label: { fontSize: '0.7rem', color: '#6a1b9a', fontWeight: 'bold' },
  input: { padding: '8px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' },
  chatContainer: { background: '#fff', borderRadius: '20px', border: '1px solid #ddd', overflow: 'hidden' },
  chatHeader: { background: '#4a148c', color: '#fff', padding: '10px 15px', display: 'flex', justifyContent: 'space-between' },
  chatBody: { padding: '15px', maxHeight: '300px', overflowY: 'auto' },
  aiReply: { background: '#f3e5f5', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', lineHeight: '1.6' },
  chatInputArea: { padding: '10px', borderTop: '1px solid #eee' },
  textArea: { width: '100%', borderRadius: '10px', border: '1px solid #ddd', padding: '10px', minHeight: '60px', boxSizing: 'border-box' },
  actionRow: { display: 'flex', gap: '5px', marginTop: '10px' },
  actionBtn: { flex: 1, background: '#eee', border: 'none', padding: '8px', borderRadius: '8px' },
  sendBtn: { flex: 2, background: '#6a1b9a', color: '#fff', border: 'none', borderRadius: '8px' },
  savedItem: { background: '#f9f9f9', padding: '8px', marginBottom: '5px', borderRadius: '8px', border: '1px solid #eee' },
  deleteBtn: { background: 'none', border: 'none', color: 'red', fontSize: '0.7rem', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem' }
};

export default PregnancyMonitor;
