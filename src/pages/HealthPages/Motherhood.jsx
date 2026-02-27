import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// ضبط المسار ليكون متوافقاً مع هيكلية المشروع لتجنب خطأ Build
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [savedReplies, setSavedReplies] = useState([]);

  const chatEndRef = useRef(null);

  const lists = [
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] },
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] },
    { title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] },
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] },
    { title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] },
    { title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] }
  ];

  // دالة الاستشارة التربوية (الذكاء الاصطناعي)
  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);

    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    // تعريف شخصية الذكاء الاصطناعي كمتخصص أطفال
    const systemRole = "أنت الآن استشاري تربوي متخصص في علم نفس الطفل. استخدم مكتبات تربية الأطفال الطبية والتربوية للرد. وجه الأم بأسلوب علمي وحنون نحو الصواب.";
    
    const promptMessage = customPrompt 
      ? `${systemRole} الاستشارة المطلوبة: ${customPrompt}`
      : `${systemRole} لقد قام الطفل بإنجاز هذه النقاط في مجال (${currentList.title}): ${selectedOnes.join("، ")}. قدمي لي تحليلاً تربوياً وتوجيهاً للأم.`;

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });
      
      const responseText = response.data.reply || response.data.message || "عذراً، المستشار غير متاح حالياً.";
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة الميديا (كاميرا/صور) ورفعها لـ Vercel
  const handleMediaUpload = async (mode) => {
    try {
      setIsLoading(true);
      const base64 = mode === 'camera' ? await takePhoto() : await fetchImage();
      const fileName = `child_edu_${Date.now()}.png`;
      const uploadedUrl = await uploadToVercel(base64, fileName, 'image/png');
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `تم رفع صورة للتحليل: ${uploadedUrl}`,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      }]);

      getAIAnalysis(`لقد أرفقت صورة (رابط: ${uploadedUrl})، أرجو تقديم نصيحة تربوية بناءً عليها.`);
    } catch (error) {
      alert("خطأ في الميديا: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const saveToFavorites = (msg) => {
    if (!savedReplies.find(s => s.id === msg.id)) {
      setSavedReplies(prev => [...prev, msg]);
      alert("تم حفظ الاستشارة في المفضلة");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{color: '#2e8b57'}}>موسوعة رقة التربوية</h1>
        <button style={styles.chatToggle} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> استشارة فورية
        </button>
      </header>

      <div style={styles.navScroll}>
        {lists.map((list, i) => (
          <button 
            key={i} 
            style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}}
            onClick={() => setSelectedIdx(i)}>
            <i className={`fas ${list.icon}`}></i>
            <span style={{fontSize: '12px'}}>{list.title}</span>
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <h3>{lists[selectedIdx].title}</h3>
        <div style={styles.itemsGrid}>
          {lists[selectedIdx].items.map((item, i) => (
            <label key={i} style={styles.checkItem}>
              <input 
                type="checkbox" 
                checked={!!checkedItems[`${selectedIdx}-${item}`]}
                onChange={() => setCheckedItems({...checkedItems, [`${selectedIdx}-${item}`]: !checkedItems[`${selectedIdx}-${item}`]})}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          تحليل الأداء التربوي
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatWindow}>
            <div style={styles.chatHeader}>
              <span>المستشار التربوي (أخصائي أطفال)</span>
              <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'white', fontSize:'20px'}}>&times;</button>
            </div>

            <div style={styles.chatBody}>
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiRow : styles.userRow}>
                  <div style={styles.bubble}>
                    <p style={{margin: 0}}>{msg.text}</p>
                    <div style={styles.bubbleActions}>
                      <small>{msg.timestamp}</small>
                      <div>
                        <button onClick={() => saveToFavorites(msg)} style={styles.iconBtn}><i className="fas fa-bookmark"></i></button>
                        <button onClick={() => deleteMessage(msg.id)} style={{...styles.iconBtn, color: '#ff4d4d'}}><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
              <div style={styles.mediaRow}>
                <button onClick={() => handleMediaUpload('camera')} style={styles.mediaBtn}><i className="fas fa-camera"></i></button>
                <button onClick={() => handleMediaUpload('gallery')} style={styles.mediaBtn}><i className="fas fa-image"></i></button>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <input 
                  style={styles.input} 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتبي سؤالك هنا للأخصائي..." 
                />
                <button 
                  style={styles.sendBtn}
                  onClick={() => {
                    if (inputText.trim()) {
                      setMessages(prev => [...prev, {id: Date.now(), text: inputText, sender: 'user', timestamp: new Date().toLocaleTimeString()}]);
                      getAIAnalysis(inputText);
                      setInputText("");
                    }
                  }}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { direction: 'rtl', padding: '15px', backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'sans-serif' },
  header: { textAlign: 'center', marginBottom: '20px' },
  chatToggle: { padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#2e8b57', color: 'white', cursor: 'pointer' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', marginBottom: '20px', paddingBottom: '5px' },
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '15px', border: '1px solid #eee', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' },
  activeNav: { background: '#2e8b57', color: 'white' },
  card: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  itemsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' },
  checkItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  analyzeBtn: { width: '100%', padding: '12px', borderRadius: '25px', border: 'none', background: '#2e8b57', color: 'white', fontWeight: 'bold' },
  chatOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000 },
  chatWindow: { width: '100%', maxWidth: '500px', height: '85vh', background: 'white', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { background: '#2e8b57', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', borderRadius: '20px 20px 0 0' },
  chatBody: { flex: 1, overflowY: 'auto', padding: '15px' },
  aiRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  bubble: { maxWidth: '85%', padding: '12px', borderRadius: '15px', background: '#f1f1f1', position: 'relative' },
  bubbleActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid #ddd', paddingTop: '5px' },
  iconBtn: { background: 'none', border: 'none', color: '#2e8b57', cursor: 'pointer', fontSize: '14px' },
  inputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaRow: { display: 'flex', gap: '15px', marginBottom: '10px', justifyContent: 'center' },
  mediaBtn: { background: 'none', border: 'none', color: '#2e8b57', fontSize: '20px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' },
  sendBtn: { background: '#2e8b57', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%' }
};

export default App;
