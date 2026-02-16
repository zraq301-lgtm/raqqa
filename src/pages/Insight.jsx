import React, { useState, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// استيراد الأيقونات المتاحة والمتوافقة [cite: 1]
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin, MessageCircle 
} from 'lucide-react';

const RaqqaApp = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [inputs, setInputs] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // مراجع لرفع الملفات
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // منطق حركة زر الأزهر
  const [fabPos, setFabPos] = useState({ x: 30, y: 30 });
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
  ]; [cite: 4, 5, 6, 7]

  const handleProcess = async (msgOverride = null) => {
    setLoading(true);
    const summary = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(", ");
    const userPrompt = msgOverride || `أنا رقيقة قمت بالآتي في ${activeCategory?.title}: (${summary}). حللي نمو روحي كطبيبة رقة بأسلوب ديني ونفسي دافئ دون فتاوى مطلقة.`; [cite: 8, 11]

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: userPrompt }
      };

      const response = await CapacitorHttp.post(options);
      const data = response.data;
      
      setAiResponse(data.reply);
      setHistory(prev => [{role: 'ai', text: data.reply}, ...prev]); [cite: 12]
    } catch (error) {
      setAiResponse("عذراً يا رفيقتي، هناك مشكلة في الاتصال حالياً 🌸"); [cite: 13]
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setInputs({});
    setAiResponse("");
    setHistory([]);
  }; [cite: 15]

  // وظائف السحب لزر الأزهر
  const handleDrag = (e) => {
    if (isDragging) {
      setFabPos({
        x: window.innerWidth - e.clientX - 50,
        y: window.innerHeight - e.clientY - 25
      });
    }
  };

  return (
    <div style={styles.appContainer} onMouseMove={handleDrag} onMouseUp={() => setIsDragging(false)}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>فقه المرأة الوعي والجمال</p>
        
        {/* زر الشات الثابت بأعلى الصفحة */}
        <button style={styles.topChatBtn} onClick={() => setShowChat(true)}>
          <MessageCircle size={18} />
          <span>فقه رقة</span>
        </button>
      </header>

      {!activeCategory && (
        <div style={styles.grid}>
          {[0, 1, 2].map(colIndex => (
            <div key={colIndex} style={styles.column}>
              {menuData.slice(colIndex * 5, (colIndex + 1) * 5).map(cat => (
                <div key={cat.id} style={styles.menuItem} onClick={() => setActiveCategory(cat)}>
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
                <div key={idx} style={styles.inputGroup}>
                  <label style={styles.label}>{item}</label>
                  <input 
                    style={styles.inputField} 
                    value={inputs[item] || ""}
                    onChange={(e) => setInputs({...inputs, [item]: e.target.value})}
                  />
                </div>
              ))}
            </div>
            <button style={styles.submitBtn} onClick={() => handleProcess()} disabled={loading}>
              {loading ? "جاري التحليل..." : "حفظ وتحليل بالذكاء الصناعي ✨"}
            </button>
            {aiResponse && (
              <div style={styles.aiBox}>
                <p style={{whiteSpace: 'pre-wrap'}}>{aiResponse}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* صفحة الشات الذكي */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContainer}>
            <div style={styles.chatHeader}>
              <X onClick={() => setShowChat(false)} style={{cursor: 'pointer'}} />
              <span style={{fontWeight: 'bold'}}>دردشة فقه رقة</span>
              <Trash2 size={20} onClick={clearAll} style={{cursor: 'pointer'}} />
            </div>
            
            <div style={styles.chatHistory}>
              {history.map((msg, idx) => (
                <div key={idx} style={msg.role === 'ai' ? styles.aiMsg : styles.userMsg}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div style={styles.chatFooter}>
              <div style={styles.mediaRow}>
                {/* أزرار الوسائط المفعلة */}
                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{display: 'none'}} />
                <button style={styles.iconBtn} onClick={() => cameraInputRef.current.click()}><Camera size={20} /></button>
                
                <button style={styles.iconBtn} onClick={() => alert("جاري تهيئة الميكروفون...")}><Mic size={20} /></button>
                
                <input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}} />
                <button style={styles.iconBtn} onClick={() => fileInputRef.current.click()}><Image size={20} /></button>
              </div>
              <div style={styles.inputWrapper}>
                <input 
                  style={styles.chatInput} 
                  placeholder="اكتبي سؤالك هنا..." 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button style={styles.sendBtn} onClick={() => {
                  setHistory([{role: 'user', text: chatMessage}, ...history]);
                  handleProcess(chatMessage);
                  setChatMessage("");
                }}>إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* زر اسألي الأزهر المتحرك */}
      <a 
        href="https://www.azhar.eg/fatwacenter" 
        target="_blank" 
        rel="noreferrer" 
        onMouseDown={() => setIsDragging(true)}
        style={{...styles.fabAzhar, bottom: fabPos.y, left: fabPos.x, cursor: isDragging ? 'grabbing' : 'grab'}}
      >
        <MapPin size={24} />
        <span>اسألي الأزهر</span>
      </a>
    </div>
  );
};

const styles = {
  appContainer: { minHeight: '100vh', background: '#fdfcfb', padding: '20px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif', position: 'relative' },
  header: { textAlign: 'center', marginBottom: '40px', position: 'relative' },
  title: { color: '#f06292', fontSize: '2.5rem', marginBottom: '5px' },
  subtitle: { color: '#888', fontStyle: 'italic' },
  topChatBtn: { background: '#f06292', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', margin: '10px auto', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  column: { background: 'rgba(240, 98, 146, 0.05)', padding: '15px', borderRadius: '20px' },
  menuItem: { background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '15px', display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  iconWrapper: { color: '#f06292', marginLeft: '12px' },
  menuText: { fontWeight: 'bold', color: '#444' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10, backdropFilter: 'blur(4px)' },
  activeCard: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '800px', maxHeight: '90vh', background: 'white', borderRadius: '25px', padding: '30px', zIndex: 11, overflowY: 'auto' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px' },
  cardTitle: { color: '#f06292', margin: 0 },
  inputsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.85rem', color: '#666', marginBottom: '5px' },
  inputField: { padding: '10px', borderRadius: '8px', border: '1px solid #fce4ec', background: '#fff' },
  submitBtn: { width: '100%', padding: '15px', background: '#f06292', color: 'white', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' },
  aiBox: { marginTop: '20px', padding: '20px', background: '#fdf2f8', borderRadius: '15px', color: '#444', lineHeight: '1.6' },
  
  // تنسيقات الشات
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatContainer: { width: '90%', maxWidth: '500px', height: '80vh', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '15px', background: '#f06292', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatHistory: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '10px', background: '#fdfcfb' },
  aiMsg: { alignSelf: 'flex-start', background: '#fce4ec', padding: '10px 15px', borderRadius: '15px 15px 15px 0', maxWidth: '85%', fontSize: '0.9rem' },
  userMsg: { alignSelf: 'flex-end', background: '#eee', padding: '10px 15px', borderRadius: '15px 15px 0 15px', maxWidth: '85%', fontSize: '0.9rem' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
  mediaRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  inputWrapper: { display: 'flex', gap: '10px' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' },
  sendBtn: { background: '#f06292', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer' },
  iconBtn: { border: 'none', background: '#f8f9fa', color: '#f06292', padding: '8px', borderRadius: '50%', cursor: 'pointer' },

  fabAzhar: { position: 'fixed', background: '#00897b', color: 'white', padding: '12px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.2)', userSelect: 'none' }
};

export default RaqqaApp;
