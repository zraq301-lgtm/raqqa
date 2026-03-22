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

  // --- منطق النصيحة اليومية باستخدام CapacitorHttp ---
  const fetchAiTip = async () => {
    try {
      setLoading(true);
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: "أعطني نصيحة طبية قصيرة ومفيدة للنساء اليوم" }
      };

      const response = await CapacitorHttp.post(options);
      const data = response.data;
      
      setTip({
        title: "نصيحة اليوم",
        content: data.reply || data.aiResponse || data.text || "حافظي على شرب الماء بانتظام لصحة بشرتك.",
        icon: "🌸"
      });
    } catch (error) {
      console.error("التحول للنصائح المخزنة:", error);
      const randomLocalTip = localTips[Math.floor(Math.random() * localTips.length)];
      setTip(randomLocalTip);
    } finally {
      setLoading(false);
    }
  };

  // --- منطق شات طبيبة رقة ---
  const handleChatProcess = async () => {
    if (!userInput.trim()) return;
    const newMessage = { role: 'user', text: userInput };
    setChatMessages([...chatMessages, newMessage]);
    setUserInput("");

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، سؤالي هو: ${userInput}` }
      };

      const response = await CapacitorHttp.post(options);
      const aiText = response.data.reply || response.data.message;
      
      const aiMessage = { role: 'ai', text: aiText };
      setChatMessages(prev => [...prev, aiMessage]);

      // حفظ تلقائي في قاعدة البيانات (اختياري)
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-health',
        headers: { 'Content-Type': 'application/json' },
        data: { question: userInput, answer: aiText }
      });
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "عذراً، واجهت مشكلة في الاتصال." }]);
    }
  };

  const saveToLibrary = (msg) => {
    if (!savedReplies.find(item => item.text === msg.text)) {
      setSavedReplies([...savedReplies, msg]);
    }
  };

  const deleteSaved = (index) => {
    const newSaved = savedReplies.filter((_, i) => i !== index);
    setSavedReplies(newSaved);
  };

  useEffect(() => {
    fetchAiTip();
    const dailyUpdate = setInterval(fetchAiTip, 86400000);
    return () => clearInterval(dailyUpdate);
  }, []);

  if (loading) return <div style={styles.loader}>جاري تحضير نصيحتكِ اليومية... ✨</div>;

  return (
    <div style={styles.container}>
      {/* كارت النصيحة بإطار الورد الكامل */}
      <div style={styles.floralBorder}>
        <div style={styles.card}>
          <div style={styles.glassHeader}>
            <span style={styles.icon}>{tip?.icon || "🌺"}</span>
          </div>
          <h2 style={styles.title}>{tip?.title}</h2>
          <p style={styles.content}>{tip?.content}</p>
          
          <button onClick={() => setIsChatOpen(true)} style={styles.chatButton}>
            💬 استشارة طبيبة رقة
          </button>
        </div>
      </div>

      {/* مودال الشات (طبيبة رقة) */}
      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatWindow}>
            <div style={styles.chatHeader}>
              <span>طبيبة رقة الذكية 👩‍⚕️</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.messageBox}>
              {chatMessages.map((m, i) => (
                <div key={i} style={m.role === 'user' ? styles.userMsg : styles.aiMsg}>
                  {m.text}
                  {m.role === 'ai' && (
                    <button onClick={() => saveToLibrary(m)} style={styles.miniSaveBtn}>📌 حفظ</button>
                  )}
                </div>
              ))}
            </div>

            {/* أدوات الميديا */}
            <div style={styles.mediaBar}>
              <button onClick={() => alert("فتح الكاميرا...")} title="كاميرا">📷</button>
              <button onClick={() => alert("رفع صورة...")} title="رفع صورة">🖼️</button>
              <button onClick={() => alert("تسجيل صوتي...")} title="ميكروفون">🎤</button>
            </div>

            <div style={styles.inputArea}>
              <input 
                value={userInput} 
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="اسألي طبيبة رقة..."
                style={styles.chatInput}
              />
              <button onClick={handleChatProcess} style={styles.sendBtn}>إرسال</button>
            </div>

            {/* قائمة الردود المحفوظة */}
            {savedReplies.length > 0 && (
              <div style={styles.savedSection}>
                <h4 style={{fontSize: '12px', color: '#c2185b'}}>الردود المحفوظة:</h4>
                {savedReplies.map((s, idx) => (
                  <div key={idx} style={styles.savedItem}>
                    <span style={{flex: 1}}>{s.text.substring(0, 30)}...</span>
                    <button onClick={() => deleteSaved(idx)} style={styles.delBtn}>🗑️</button>
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
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', direction: 'rtl' },
  floralBorder: {
    padding: '10px',
    borderRadius: '35px',
    background: 'url("https://www.transparenttextures.com/patterns/pollen.png"), linear-gradient(45deg, #ff85a2, #fce4ec, #ff85a2)',
    boxShadow: '0 10px 30px rgba(255, 133, 162, 0.4)',
  },
  card: {
    background: '#fff',
    borderRadius: '25px',
    padding: '25px',
    maxWidth: '380px',
    textAlign: 'center',
    border: '2px solid #fff'
  },
  icon: { fontSize: '50px' },
  title: { color: '#c2185b', fontSize: '22px', fontWeight: 'bold' },
  content: { color: '#2d3436', fontSize: '17px', lineHeight: '1.6', margin: '15px 0' },
  chatButton: {
    background: '#ad1457',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '15px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  // استايلات الشات
  chatOverlay: { position: 'fixed', inset: 0, bg: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.4)' },
  chatWindow: { width: '90%', maxWidth: '400px', background: '#fff', borderRadius: '20px', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { background: '#c2185b', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
  messageBox: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  userMsg: { alignSelf: 'flex-start', background: '#fce4ec', padding: '10px', borderRadius: '12px', maxWidth: '80%' },
  aiMsg: { alignSelf: 'flex-end', background: '#f0f0f0', padding: '10px', borderRadius: '12px', maxWidth: '80%', borderRight: '4px solid #c2185b' },
  mediaBar: { display: 'flex', gap: '15px', padding: '10px', justifyContent: 'center', borderTop: '1px solid #eee' },
  inputArea: { display: 'flex', padding: '10px', gap: '5px' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ddd' },
  sendBtn: { background: '#c2185b', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 15px' },
  savedSection: { padding: '10px', background: '#f9f9f9', borderTop: '2px solid #eee', maxHeight: '100px', overflowY: 'auto' },
  savedItem: { display: 'flex', fontSize: '11px', marginBottom: '5px', alignItems: 'center', background: '#fff', padding: '3px' },
  delBtn: { background: 'none', border: 'none', color: 'red', cursor: 'pointer' },
  miniSaveBtn: { display: 'block', fontSize: '10px', marginTop: '5px', color: '#ad1457', border: 'none', background: 'none', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '18px' },
  loader: { textAlign: 'center', color: '#d81b60', marginTop: '50px' }
};

export default HealthAdvice;
