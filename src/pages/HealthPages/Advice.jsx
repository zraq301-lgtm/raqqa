import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import localTips from '../../data/tips.json'; 

const HealthAdvice = () => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [savedReplies, setSavedReplies] = useState([]);

  // --- 1. منطق جلب النصيحة (AI أولاً ثم Local) دون نيون ---
  const fetchDailyTip = async () => {
    try {
      setLoading(true);
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: "أعطني نصيحة طبية قصيرة ومفيدة للنساء اليوم" }
      };

      const response = await CapacitorHttp.post(options);
      const aiText = response.data.reply || response.data.message;

      if (aiText) {
        setTip({ title: "نصيحة اليوم", content: aiText, icon: "🌸" });
      } else {
        throw new Error("Empty AI response");
      }
    } catch (error) {
      console.log("فشل AI، جاري الجلب من الملف المحلي:", error);
      const randomLocalTip = localTips[Math.floor(Math.random() * localTips.length)];
      setTip(randomLocalTip);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. منطق شات "طبيبة رقة" دون نيون ---
  const handleAiChat = async () => {
    if (!userInput.trim()) return;
    const userMsg = { role: 'user', text: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = userInput;
    setUserInput("");

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، سؤالي هو: ${currentInput}` }
      };

      const response = await CapacitorHttp.post(options);
      const reply = response.data.reply || response.data.message;
      
      const aiMsg = { role: 'ai', text: reply };
      setChatMessages(prev => [...prev, aiMsg]);
      
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "عذراً، لم أستطع الاتصال بالخادم." }]);
    }
  };

  // وظائف إدارة الردود المحفوظة (محلياً في واجهة المستخدم)
  const addToLibrary = (msg) => {
    setSavedReplies(prev => [...prev, { ...msg, id: Date.now() }]);
  };

  const deleteFromLibrary = (id) => {
    setSavedReplies(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    fetchDailyTip();
    const interval = setInterval(fetchDailyTip, 86400000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={styles.loader}>جاري تحضير عالمكِ الصحي... ✨</div>;

  return (
    <div style={styles.container}>
      {/* كارت النصيحة الكبير بإطار الورد */}
      <div style={styles.floralFullFrame}>
        <div style={styles.mainCard}>
          <div style={styles.headerIcon}>
            <span style={styles.mainEmoji}>{tip?.icon || "🌺"}</span>
          </div>
          <h2 style={styles.mainTitle}>{tip?.title}</h2>
          <p style={styles.mainContent}>{tip?.content}</p>
          
          <button onClick={() => setIsChatOpen(true)} style={styles.openChatBtn}>
             استشارة طبيبة رقة 👩‍⚕️
          </button>
        </div>
      </div>

      {/* واجهة الشات المحسنة */}
      {isChatOpen && (
        <div style={styles.overlay}>
          <div style={styles.chatContainer}>
            <div style={styles.chatHeader}>
              <span>طبيبة رقة الذكية</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.chatBody}>
              {chatMessages.map((m, idx) => (
                <div key={idx} style={m.role === 'user' ? styles.userRow : styles.aiRow}>
                  <div style={m.role === 'user' ? styles.userBubble : styles.aiBubble}>
                    {m.text}
                    {m.role === 'ai' && (
                      <button onClick={() => addToLibrary(m)} style={styles.saveIconBtn}>📌 حفظ في المكتبة</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* أدوات الميديا والتحكم */}
            <div style={styles.mediaRow}>
              <button onClick={() => alert("فتح الكاميرا...")}>📷</button>
              <button onClick={() => alert("رفع من الاستوديو...")}>🖼️</button>
              <button onClick={() => alert("بدء التسجيل...")}>🎤</button>
            </div>

            <div style={styles.inputRow}>
              <input 
                style={styles.inputField} 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="اكتبي سؤالك هنا..."
              />
              <button onClick={handleAiChat} style={styles.sendIconBtn}>◀</button>
            </div>

            {/* قائمة الردود المحفوظة (المكتبة) */}
            {savedReplies.length > 0 && (
              <div style={styles.librarySection}>
                <p style={styles.libTitle}>الردود المحفوظة:</p>
                {savedReplies.map(item => (
                  <div key={item.id} style={styles.libItem}>
                    <span>{item.text.substring(0, 35)}...</span>
                    <button onClick={() => deleteFromLibrary(item.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '30px 15px', direction: 'rtl' },
  floralFullFrame: {
    padding: '20px',
    borderRadius: '45px',
    background: 'linear-gradient(135deg, #ff85a2 0%, #ffb7c5 50%, #ff85a2 100%)',
    boxShadow: '0 20px 40px rgba(255, 133, 162, 0.4)',
    width: '100%',
    maxWidth: '500px', 
  },
  mainCard: {
    background: '#fff',
    borderRadius: '35px',
    padding: '40px 25px',
    textAlign: 'center',
    border: '3px solid #fce4ec',
  },
  mainEmoji: { fontSize: '70px', display: 'block', marginBottom: '10px' },
  mainTitle: { color: '#ad1457', fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' },
  mainContent: { color: '#333', fontSize: '20px', lineHeight: '1.8', fontWeight: '500' },
  openChatBtn: {
    marginTop: '30px',
    background: '#c2185b',
    color: '#fff',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(194, 24, 91, 0.3)'
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' },
  chatContainer: { width: '100%', maxWidth: '450px', background: '#fff', height: '85vh', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', display: 'flex', flexDirection: 'column' },
  chatHeader: { background: '#ad1457', color: '#fff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' },
  chatBody: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
  userRow: { alignSelf: 'flex-start', maxWidth: '85%' },
  userBubble: { background: '#fce4ec', padding: '12px 18px', borderRadius: '18px 18px 0 18px', color: '#333' },
  aiRow: { alignSelf: 'flex-end', maxWidth: '85%' },
  aiBubble: { background: '#f0f0f0', padding: '12px 18px', borderRadius: '18px 18px 18px 0', borderRight: '5px solid #ad1457' },
  mediaRow: { display: 'flex', justifyContent: 'center', gap: '25px', padding: '10px', background: '#f9f9f9', fontSize: '22px' },
  inputRow: { padding: '15px', display: 'flex', gap: '10px', borderTop: '1px solid #eee' },
  inputField: { flex: 1, padding: '12px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '15px' },
  sendIconBtn: { background: '#ad1457', color: '#fff', border: 'none', borderRadius: '12px', width: '45px', fontSize: '20px' },
  librarySection: { padding: '15px', background: '#fff5f8', maxHeight: '150px', overflowY: 'auto' },
  libTitle: { fontSize: '13px', fontWeight: 'bold', color: '#ad1457', marginBottom: '5px' },
  libItem: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px', borderBottom: '1px solid #ffebee', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px' },
  saveIconBtn: { display: 'block', marginTop: '8px', background: 'none', border: 'none', color: '#c2185b', fontSize: '11px', cursor: 'pointer' },
  loader: { textAlign: 'center', color: '#ad1457', marginTop: '100px', fontWeight: 'bold', fontSize: '20px' }
};

export default HealthAdvice;
