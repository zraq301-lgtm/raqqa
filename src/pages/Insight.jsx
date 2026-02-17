import React, { useState, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin, MessageCircle, Bookmark, List,
  Check, Minus, Smile, Sun, Droplets, Utensils, Baby, Users2, Shield, 
  Zap, Coffee, GraduationCap, Bath, Gem, Star
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

  // هيكل البيانات مع أيقونات مخصصة لكل عنصر داخلي
  const menuData = [
    { id: 1, title: "فقه الطهارة", icon: <Sparkles />, items: [
      { name: "سنن الفطرة", icon: <Smile size={16}/> }, { name: "صفة الغسل", icon: <Bath size={16}/> }, { name: "الوضوء الجمالي", icon: <Droplets size={16}/> }, 
      { name: "طهارة الثوب", icon: <Shield size={16}/> }, { name: "طيب الرائحة", icon: <Zap size={16}/> }, { name: "أحكام المسح", icon: <Minus size={16}/> }
    ]},
    { id: 2, title: "فقه الصلاة", icon: <Heart />, items: [
      { name: "أوقات الصلاة", icon: <Clock size={16}/> }, { name: "السنن الرواتب", icon: <Star size={16}/> }, { name: "سجدة الشكر", icon: <Heart size={16}/> },
      { name: "لباس الصلاة", icon: <Shield size={16}/> }, { name: "صلاة الوتر", icon: <Moon size={16}/> }
    ]},
    { id: 3, title: "فقه الصيام", icon: <Moon />, items: [
      { name: "صيام التطوع", icon: <Sun size={16}/> }, { name: "قضاء ما فات", icon: <Calendar size={16}/> }, { name: "سحور البركة", icon: <Coffee size={16}/> },
      { name: "كف اللسان", icon: <ShieldAlert size={16}/> }, { name: "نية الصيام", icon: <Heart size={16}/> }
    ]},
    { id: 4, title: "فقه القرآن", icon: <BookOpen />, items: [
      { name: "تلاوة يومية", icon: <BookOpen size={16}/> }, { name: "تدبر آية", icon: <Brain size={16}/> }, { name: "حفظ جديد", icon: <Zap size={16}/> },
      { name: "الاستماع بإنصات", icon: <Activity size={16}/> }, { name: "مراجعة الورد", icon: <Clock size={16}/> }
    ]},
    { id: 5, title: "الذكر الذكي", icon: <Activity />, items: [
      { name: "أذكار الصباح", icon: <Sun size={16}/> }, { name: "أذكار المساء", icon: <Moon size={16}/> }, { name: "الاستغفار", icon: <Wind size={16}/> },
      { name: "الصلاة على النبي", icon: <Heart size={16}/> }, { name: "التسبيح", icon: <Sparkles size={16}/> }
    ]},
    { id: 6, title: "العفة والحجاب", icon: <ShieldCheck />, items: [
      { name: "حجاب القلب", icon: <Heart size={16}/> }, { name: "غض البصر", icon: <ShieldCheck size={16}/> }, { name: "الحياء في القول", icon: <MessageCircle size={16}/> },
      { name: "سمو الفكر", icon: <Brain size={16}/> }, { name: "الستر الأنيق", icon: <Gem size={16}/> }
    ]},
    { id: 7, title: "المعاملات والبيوت", icon: <Users />, items: [
      { name: "بر الوالدين", icon: <Heart size={16}/> }, { name: "مودة الزوج", icon: <Users2 size={16}/> }, { name: "رحمة الأبناء", icon: <Baby size={16}/> },
      { name: "صلة الرحم", icon: <Users size={16}/> }, { name: "حسن الجوار", icon: <Users2 size={16}/> }
    ]},
    { id: 8, title: "تجنب المحرمات", icon: <ShieldAlert />, items: [
      { name: "محاربة الغيبة", icon: <ShieldAlert size={16}/> }, { name: "ترك النميمة", icon: <X size={16}/> }, { name: "تجنب الإباحية", icon: <Shield size={16}/> },
      { name: "الصدق", icon: <Check size={16}/> }, { name: "ترك الجدال", icon: <Minus size={16}/> }
    ]},
    { id: 9, title: "الهدوء النفسي", icon: <Wind />, items: [
      { name: "تفريغ الانفعالات", icon: <Wind size={16}/> }, { name: "الرضا بالقدر", icon: <Smile size={16}/> }, { name: "حسن الظن بالله", icon: <Sparkles size={16}/> },
      { name: "الصبر الجميل", icon: <Clock size={16}/> }
    ]},
    { id: 10, title: "أعمال صالحة", icon: <Gift />, items: [
      { name: "صدقة خفية", icon: <Coins size={16}/> }, { name: "إماطة الأذى", icon: <Trash2 size={16}/> }, { name: "إفشاء السلام", icon: <MessageCircle size={16}/> },
      { name: "نفع الناس", icon: <Users size={16}/> }, { name: "جبر الخواطر", icon: <Gift size={16}/> }
    ]},
    { id: 11, title: "الوقت والإنجاز", icon: <Clock />, items: [
      { name: "البكور", icon: <Sun size={16}/> }, { name: "تنظيم المهام", icon: <List size={16}/> }, { name: "ترك ما لا يعني", icon: <X size={16}/> },
      { name: "استغلال الفراغ", icon: <Hourglass size={16}/> }
    ]},
    { id: 12, title: "الوعي الفقهي", icon: <Brain />, items: [
      { name: "مقاصد الشريعة", icon: <GraduationCap size={16}/> }, { name: "قراءة السيرة", icon: <BookOpen size={16}/> }, { name: "فقه الواقع", icon: <Brain size={16}/> },
      { name: "طلب العلم", icon: <GraduationCap size={16}/> }
    ]},
    { id: 13, title: "الرعاية الذاتية", icon: <Flower2 />, items: [
      { name: "النوم على طهارة", icon: <Moon size={16}/> }, { name: "رياضة بنية القوة", icon: <Activity size={16}/> }, { name: "الأكل الطيب", icon: <Utensils size={16}/> },
      { name: "التزين المشروع", icon: <Gem size={16}/> }
    ]},
    { id: 14, title: "العطاء والزكاة", icon: <Coins />, items: [
      { name: "زكاة المال", icon: <Coins size={16}/> }, { name: "زكاة العلم", icon: <GraduationCap size={16}/> }, { name: "زكاة الجمال", icon: <Sparkles size={16}/> },
      { name: "الهدية", icon: <Gift size={16}/> }
    ]},
    { id: 15, title: "لقاء الله", icon: <Hourglass />, items: [
      { name: "تجديد التوبة", icon: <Wind size={16}/> }, { name: "كتابة الوصية", icon: <BookOpen size={16}/> }, { name: "ذكر هادم اللذات", icon: <Hourglass size={16}/> },
      { name: "حسن الخاتمة", icon: <Star size={16}/> }
    ]},
  ];

  const handleProcess = async (directMsg = null) => {
    setLoading(true);
    const summary = Object.entries(inputs).map(([k, v]) => `${k}: ${v === 'yes' ? 'تم' : 'لم يتم'}`).join(", ");
    const promptText = directMsg || `أنا أنثى مسلمة، تقريري: (${summary}). حللي نموي الروحي بأسلوب رقة الديني والنفسي دون فتاوى.`;

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };
      const response = await CapacitorHttp.post(options);
      const reply = response.data.reply || response.data.message;
      setAiResponse(reply);
      setHistory(prev => [{ role: 'ai', text: reply }, ...prev]);
    } catch (err) {
      setAiResponse("حدث خطأ في الاتصال يا رفيقتي 🌸");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>فقه المرأة الوعي والجمال</p>
        
        {/* الأزرار العلوية الثابتة */}
        <div style={styles.topActions}>
          <button style={styles.fقهرقةBtn} onClick={() => setShowChat(true)}>
            <MessageCircle size={18} />
            <span>فقه رقة</span>
          </button>
          <a href="https://www.azhar.eg/fatwacenter" target="_blank" rel="noreferrer" style={styles.azharBtn}>
            <MapPin size={18} />
            <span>اسألي الأزهر</span>
          </a>
        </div>
      </header>

      {!activeCategory && (
        <div style={styles.grid}>
          {[0, 1, 2].map(colIndex => (
            <div key={colIndex} style={styles.column}>
              {menuData.slice(colIndex * 5, (colIndex + 1) * 5).map(cat => (
                <div key={cat.id} style={styles.menuItem} onClick={() => {setActiveCategory(cat); setInputs({});}}>
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
            <div style={styles.inputsList}>
              {activeCategory.items.map((item, idx) => (
                <div key={idx} style={styles.inputStrip}>
                  <div style={styles.stripInfo}>
                    {item.icon}
                    <span style={styles.stripLabel}>{item.name}</span>
                  </div>
                  <div style={styles.stripActions}>
                    <button 
                      onClick={() => setInputs({...inputs, [item.name]: 'yes'})}
                      style={{...styles.yesBtn, opacity: inputs[item.name] === 'yes' ? 1 : 0.5}}
                    >نعم</button>
                    <button 
                      onClick={() => setInputs({...inputs, [item.name]: 'no'})}
                      style={{...styles.noBtn, opacity: inputs[item.name] === 'no' ? 1 : 0.5}}
                    >لا</button>
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

      {/* مودال الشات (كما هو بدون تغيير في المنطق) */}
      {showChat && (
        <div style={styles.chatModal}>
          <div style={styles.chatContent}>
            <div style={styles.chatHeader}>
              <X onClick={() => setShowChat(false)} style={{cursor: 'pointer'}} />
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{fontWeight: 'bold'}}>دردشة رقة الذكية</span>
                <List size={20} onClick={() => setShowSavedList(!showSavedList)} style={{cursor: 'pointer'}} />
              </div>
              <Trash2 size={20} onClick={() => setHistory([])} style={{cursor: 'pointer'}} />
            </div>
            {showSavedList ? (
              <div style={styles.savedArea}>
                {savedReplies.map((r, i) => <div key={i} style={styles.savedItem}>{r}</div>)}
                <button onClick={() => setShowSavedList(false)} style={styles.backBtn}>العودة</button>
              </div>
            ) : (
              <div style={styles.chatHistory}>
                {history.map((msg, idx) => (
                  <div key={idx} style={msg.role === 'ai' ? styles.aiMsg : styles.userMsg}>
                    {msg.text}
                    {msg.role === 'ai' && <Bookmark size={14} onClick={() => setSavedReplies([...savedReplies, msg.text])} style={styles.saveIcon} />}
                  </div>
                ))}
              </div>
            )}
            <div style={styles.chatFooter}>
              <div style={styles.mediaRow}>
                <button style={styles.iconBtn} onClick={() => cameraInputRef.current.click()}><Camera size={20}/></button>
                <button style={styles.iconBtn}><Mic size={20}/></button>
                <button style={styles.iconBtn} onClick={() => fileInputRef.current.click()}><Image size={20}/></button>
              </div>
              <div style={styles.inputRow}>
                <input style={styles.chatInput} placeholder="اسألي رقة..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
                <button style={styles.sendBtn} onClick={() => {setHistory([{role:'user', text:chatMessage}, ...history]); handleProcess(chatMessage); setChatMessage("");}}>إرسال</button>
              </div>
            </div>
            <input type="file" ref={cameraInputRef} capture="environment" style={{display:'none'}} />
            <input type="file" ref={fileInputRef} style={{display:'none'}} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  appContainer: { minHeight: '100vh', background: '#fdfcfb', padding: '20px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#f06292', fontSize: '2.5rem', marginBottom: '5px' },
  subtitle: { color: '#888' },
  topActions: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' },
  fقهرقةBtn: { background: '#f06292', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' },
  azharBtn: { background: '#00897b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' },
  column: { background: 'rgba(240, 98, 146, 0.03)', padding: '15px', borderRadius: '20px' },
  menuItem: { background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '15px', display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' },
  iconWrapper: { color: '#f06292', marginLeft: '12px' },
  menuText: { fontWeight: 'bold', color: '#444' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10, backdropFilter: 'blur(4px)' },
  activeCard: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: '600px', maxHeight: '90vh', background: 'white', borderRadius: '25px', padding: '25px', zIndex: 11, overflowY: 'auto' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  cardTitle: { color: '#f06292', margin: 0 },
  inputsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  inputStrip: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdf2f8', padding: '12px 20px', borderRadius: '15px', border: '1px solid #fce4ec' },
  stripInfo: { display: 'flex', alignItems: 'center', gap: '12px', color: '#f06292' },
  stripLabel: { color: '#444', fontWeight: '500' },
  stripActions: { display: 'flex', gap: '8px' },
  yesBtn: { background: '#4caf50', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '10px', cursor: 'pointer' },
  noBtn: { background: '#e91e63', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '10px', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '15px', background: '#f06292', color: 'white', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' },
  aiBox: { marginTop: '20px', padding: '15px', background: '#fdf2f8', borderRadius: '15px', lineHeight: '1.6' },
  chatModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatContent: { width: '95%', maxWidth: '500px', height: '85vh', background: 'white', borderRadius: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '15px', background: '#f06292', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatHistory: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '10px' },
  aiMsg: { alignSelf: 'flex-start', background: '#fce4ec', padding: '10px 15px', borderRadius: '15px 15px 15px 0', maxWidth: '85%', position: 'relative' },
  userMsg: { alignSelf: 'flex-end', background: '#eee', padding: '10px 15px', borderRadius: '15px 15px 0 15px', maxWidth: '85%' },
  saveIcon: { position: 'absolute', bottom: '-20px', left: '5px', color: '#f06292', cursor: 'pointer' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
  mediaRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  inputRow: { display: 'flex', gap: '10px' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { background: '#f06292', color: 'white', border: 'none', padding: '0 20px', borderRadius: '20px' },
  iconBtn: { border: 'none', background: '#f8f9fa', color: '#f06292', padding: '8px', borderRadius: '50%' },
  savedArea: { flex: 1, padding: '15px', overflowY: 'auto' },
  savedItem: { background: '#fdf2f8', padding: '10px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #fce4ec' },
  backBtn: { width: '100%', padding: '10px', background: '#f06292', color: 'white', border: 'none', borderRadius: '10px' }
};

export default RaqqaApp;
