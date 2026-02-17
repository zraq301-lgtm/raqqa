import React, { useState, useRef, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin, MessageCircle, Bookmark, List,
  CheckCircle2, CircleOff, Star
} from 'lucide-react';

const RaqqaApp = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [inputs, setInputs] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [savedReplies, setSavedReplies] = useState([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // منطق حركة زر الأزهر
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  const menuData = [
    { id: 1, title: "فقه الطهارة", icon: <Sparkles />, items: ["سنن الفطرة", "صفة الغسل", "الوضوء الجمالي", "طهارة الثوب", "طيب الرائحة", "أحكام المسح"] },
    { id: 2, title: "فقه الصلاة", icon: <Heart />, items: ["أوقات الصلاة", "السنن الرواتب", "سجدة الشكر", "لباس الصلاة", "صلاة الوتر"] },
    { id: 3, title: "فقه الصيام", icon: <Moon />, items: ["صيام التطوع", "قضاء ما فات", "سحور البركة", "كف اللسان", "نية الصيام"] },
    { id: 4, title: "فقه القرآن", icon: <BookOpen />, items: ["تلاوة يومية", "تدبر آية", "حفظ جديد", "الاستماع بإنصات", "مراجعة الورد"] },
    { id: 5, title: "الذكر الذكي", icon: <Activity />, items: ["أذكار الصباح", "أذكار المساء", "الاستغفار", "الصلاة على النبي", "التسبيح"] },
    { id: 6, title: "العفة والحجاب", icon: <ShieldCheck />, items: ["حجاب القلب", "غض البصر", "الحياء في القول", "سمو الفكر", "الستر الأنيق"] },
    { id: 7, title: "المعاملات والبيوت", icon: <Users />, items: ["بر الوالدين", "مودة الزوج", "رحمة الأبناء", "صلة الرحم", "حسن الجوار"] },
    { id: 8, title: "تجنب المحرمات", icon: <ShieldAlert />, items: ["محاربة الغيبة", "ترك النميمة", "تجنب الإباحية", "الصدق", "ترك الجدال"] },
    { id: 9, title: "الهدوء النفسي", icon: <Wind />, items: ["تفريغ الانفعالات", "الرضا بالقدر", "حسن الظن بالله", "الصبر الجميل"] },
    { id: 10, title: "أعمال صالحة", icon: <Gift />, items: ["صدقة خفية", "إماطة الأذى", "إفشاء السلام", "نفع الناس", "جبر الخواطر"] },
    { id: 11, title: "الوقت والإنجاز", icon: <Clock />, items: ["البكور", "تنظيم المهام", "ترك ما لا يعني", "استغلال الفراغ"] },
    { id: 12, title: "الوعي الفقهي", icon: <Brain />, items: ["مقاصد الشريعة", "قراءة السيرة", "فقه الواقع", "طلب العلم"] },
    { id: 13, title: "الرعاية الذاتية", icon: <Flower2 />, items: ["النوم على طهارة", "رياضة بنية القوة", "الأكل الطيب", "التزين المشروع"] },
    { id: 14, title: "العطاء والزكاة", icon: <Coins />, items: ["زكاة المال", "زكاة العلم", "زكاة الجمال", "الهدية"] },
    { id: 15, title: "لقاء الله", icon: <Hourglass />, items: ["تجديد التوبة", "كتابة الوصية", "ذكر هادم اللذات", "حسن الخاتمة"] },
  ];

  const handleProcess = async (directMsg = null) => {
    setLoading(true);
    const summary = Object.entries(inputs).map(([k, v]) => `${k}: ${v === 'yes' ? 'تم بحمد الله' : 'لم يتم'}`).join(", ");
    const promptText = directMsg || `أنا أنثى مسلمة، إليكِ تقريري في ${activeCategory?.title}: (${summary}). حللي نمو روحي بأسلوب ديني ونفسي دافئ دون فتاوى.`;

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };
      const response = await CapacitorHttp.post(options);
      const reply = response.data.reply || response.data.message;
      setAiResponse(reply);
      setHistory(prev => [{ role: 'ai', text: reply, id: Date.now() }, ...prev]);
    } catch (err) {
      setAiResponse("عذراً رفيقتي، حدث خطأ في الاتصال 🌸");
    } finally {
      setLoading(false);
    }
  };

  const toggleInput = (item, value) => {
    setInputs(prev => ({ ...prev, [item]: value }));
  };

  const onMouseDown = () => setIsDragging(true);
  const onMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: window.innerWidth - e.clientX - 50,
        y: window.innerHeight - e.clientY - 25
      });
    }
  };
  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>فقه المرأة الوعي والجمال</p>
        <button style={styles.fقهرقةBtn} onClick={() => setShowChat(true)}>
          <MessageCircle size={18} />
          <span>دردشة فقه رقة</span>
        </button>
      </header>

      {!activeCategory && (
        <div style={styles.grid}>
          {[0, 1, 2].map(colIndex => (
            <div key={colIndex} style={styles.column}>
              {menuData.slice(colIndex * 5, (colIndex + 1) * 5).map(cat => (
                <div key={cat.id} style={styles.menuItem} onClick={() => {setActiveCategory(cat); setInputs({}); setAiResponse("");}}>
                  <span style={styles.iconWrapper}>{cat.icon}</span>
                  <span style={styles.menuText}>{cat.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {activeCategory && (
        <>
          <div style={styles.overlay} onClick={() => setActiveCategory(null)} />
          <div style={styles.activeCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>{activeCategory.title}</h2>
              <X style={{cursor: 'pointer'}} onClick={() => setActiveCategory(null)} />
            </div>
            <div style={styles.inputsGrid}>
              {activeCategory.items.map((item, idx) => (
                <div key={idx} style={styles.inputGroupRow}>
                  <div style={styles.labelWithIcon}>
                    <Star size={14} color="#f06292" />
                    <span style={styles.label}>{item}</span>
                  </div>
                  <div style={styles.btnToggleGroup}>
                    <button 
                      onClick={() => toggleInput(item, 'yes')}
                      style={{...styles.toggleBtn, backgroundColor: inputs[item] === 'yes' ? '#e8f5e9' : '#fff', color: inputs[item] === 'yes' ? '#2e7d32' : '#888', borderColor: inputs[item] === 'yes' ? '#2e7d32' : '#ddd'}}
                    >
                      <CheckCircle2 size={16} /> نعم
                    </button>
                    <button 
                      onClick={() => toggleInput(item, 'no')}
                      style={{...styles.toggleBtn, backgroundColor: inputs[item] === 'no' ? '#ffebee' : '#fff', color: inputs[item] === 'no' ? '#c62828' : '#888', borderColor: inputs[item] === 'no' ? '#c62828' : '#ddd'}}
                    >
                      <CircleOff size={16} /> لا
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button style={styles.submitBtn} onClick={() => handleProcess()} disabled={loading}>
              {loading ? "جاري التحليل الروحاني..." : "إرسال للتحليل ✨"}
            </button>
            {aiResponse && <div style={styles.aiBox}>{aiResponse}</div>}
          </div>
        </>
      )}

      {showChat && (
        <div style={styles.chatModal}>
          <div style={styles.chatContent}>
            <div style={styles.chatHeader}>
              <X onClick={() => setShowChat(false)} style={{cursor: 'pointer'}} />
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{fontWeight: 'bold'}}>دردشة رقة</span>
                <List size={20} onClick={() => setShowSavedList(!showSavedList)} style={{cursor: 'pointer'}} />
              </div>
              <Trash2 size={20} onClick={() => setHistory([])} style={{cursor: 'pointer'}} />
            </div>

            {showSavedList ? (
              <div style={styles.savedListArea}>
                <h4 style={{textAlign: 'center', color: '#f06292'}}>الردود المحفوظة 🌸</h4>
                {savedReplies.length === 0 && <p style={{textAlign:'center', fontSize:'0.8rem', color:'#999'}}>لا توجد ردود محفوظة بعد</p>}
                {savedReplies.map((r, i) => (
                  <div key={i} style={styles.savedItem}>{r}</div>
                ))}
                <button onClick={() => setShowSavedList(false)} style={styles.backBtn}>العودة للدردشة</button>
              </div>
            ) : (
              <div style={styles.chatHistory}>
                {history.map((msg, idx) => (
                  <div key={idx} style={msg.role === 'ai' ? styles.aiMsg : styles.userMsg}>
                    {msg.text}
                    {msg.role === 'ai' && (
                      <Bookmark size={14} onClick={() => {setSavedReplies([...savedReplies, msg.text]); alert("تم الحفظ!");}} style={styles.saveIcon} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={styles.chatFooter}>
              <div style={styles.mediaRow}>
                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{display: 'none'}} />
                <button style={styles.iconBtn} onClick={() => cameraInputRef.current.click()}><Camera size={20} /></button>
                <button style={styles.iconBtn} onClick={() => alert("تم فتح الميكروفون")}><Mic size={20} /></button>
                <input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}} />
                <button style={styles.iconBtn} onClick={() => fileInputRef.current.click()}><Image size={20} /></button>
              </div>
              <div style={styles.inputRow}>
                <input style={styles.chatInput} placeholder="اسألي رقة..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
                <button style={styles.sendBtn} onClick={() => { if(!chatMessage) return; setHistory([{role: 'user', text: chatMessage}, ...history]); handleProcess(chatMessage); setChatMessage(""); }}>إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <a 
        href="https://www.azhar.eg/fatwacenter" 
        target="_blank" 
        rel="noreferrer" 
        onMouseDown={onMouseDown}
        style={{...styles.fabAzhar, right: position.x, bottom: position.y}}
      >
        <MapPin size={24} />
        <span>اسألي الأزهر</span>
      </a>
    </div>
  );
};

const styles = {
  appContainer: { minHeight: '100vh', background: '#fdfcfb', padding: '20px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { color: '#f06292', fontSize: '2.5rem', marginBottom: '5px' },
  subtitle: { color: '#888', fontStyle: 'italic' },
  fقهرقةBtn: { background: '#f06292', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '8px', margin: '15px auto', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  column: { background: 'rgba(240, 98, 146, 0.05)', padding: '15px', borderRadius: '20px' },
  menuItem: { background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '15px', display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  iconWrapper: { color: '#f06292', marginLeft: '12px' },
  menuText: { fontWeight: 'bold', color: '#444' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10, backdropFilter: 'blur(4px)' },
  activeCard: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '800px', maxHeight: '90vh', background: 'white', borderRadius: '25px', padding: '30px', zIndex: 11, overflowY: 'auto' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px' },
  cardTitle: { color: '#f06292', margin: 0 },
  inputsGrid: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  inputGroupRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f9f9f9' },
  labelWithIcon: { display: 'flex', alignItems: 'center', gap: '8px' },
  label: { fontSize: '0.95rem', color: '#444' },
  btnToggleGroup: { display: 'flex', gap: '8px' },
  toggleBtn: { padding: '6px 15px', borderRadius: '20px', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', transition: 'all 0.2s' },
  submitBtn: { width: '100%', padding: '15px', background: '#f06292', color: 'white', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' },
  aiBox: { marginTop: '20px', padding: '20px', background: '#fdf2f8', borderRadius: '15px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  chatModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatContent: { width: '90%', maxWidth: '500px', height: '80vh', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '15px', background: '#f06292', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatHistory: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '10px' },
  aiMsg: { alignSelf: 'flex-start', background: '#fce4ec', padding: '10px 15px', borderRadius: '15px 15px 15px 0', maxWidth: '85%', position: 'relative' },
  userMsg: { alignSelf: 'flex-end', background: '#eee', padding: '10px 15px', borderRadius: '15px 15px 0 15px', maxWidth: '85%' },
  saveIcon: { position: 'absolute', bottom: '-20px', left: '5px', color: '#f06292', cursor: 'pointer' },
  savedListArea: { flex: 1, padding: '15px', overflowY: 'auto', background: '#fffafb' },
  savedItem: { background: 'white', padding: '10px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #fce4ec', fontSize: '0.9rem' },
  backBtn: { width: '100%', padding: '10px', border: 'none', background: '#f06292', color: 'white', borderRadius: '10px', cursor: 'pointer', marginTop: '10px' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
  mediaRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  inputRow: { display: 'flex', gap: '10px' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { background: '#f06292', color: 'white', border: 'none', padding: '0 15px', borderRadius: '20px', cursor: 'pointer' },
  iconBtn: { border: 'none', background: '#f8f9fa', color: '#f06292', padding: '8px', borderRadius: '50%', cursor: 'pointer' },
  fabAzhar: { position: 'fixed', background: '#00897b', color: 'white', padding: '12px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'grab' }
};

export default RaqqaApp;
