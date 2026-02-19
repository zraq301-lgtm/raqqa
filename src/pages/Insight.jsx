import React, { useState, useRef } from 'react';
// استيراد المحرك الأصلي لضمان عمل الاتصال
import HttpClient from '../utils/http';
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin, MessageCircle, Bookmark, List,
  CheckCircle2, CircleOff, Star, Droplets, Bath, Smile, Sun, Utensils, 
  Baby, GraduationCap, Zap, Coffee, Shield, Check, Minus
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
  const [showAnalysisModal, setShowAnalysisModal] = useState(false); // شاشة التحليل الجديدة
  const [chatMessage, setChatMessage] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const menuData = [
    { id: 1, title: "فقه الطهارة", icon: <Sparkles />, items: [
      {n: "سنن الفطرة", i: <Smile size={14}/>}, {n: "صفة الغسل", i: <Bath size={14}/>}, {n: "الوضوء الجمالي", i: <Droplets size={14}/>}, 
      {n: "طهارة الثوب", i: <Shield size={14}/>}, {n: "طيب الرائحة", i: <Zap size={14}/>}, {n: "أحكام المسح", i: <Minus size={14}/>}
    ]},
    { id: 2, title: "فقه الصلاة", icon: <Heart />, items: [
      {n: "أوقات الصلاة", i: <Clock size={14}/>}, {n: "السنن الرواتب", i: <Star size={14}/>}, {n: "سجدة الشكر", i: <Heart size={14}/>}, 
      {n: "لباس الصلاة", i: <Shield size={14}/>}, {n: "صلاة الوتر", i: <Moon size={14}/>}
    ]},
    { id: 3, title: "فقه الصيام", icon: <Moon />, items: [
      {n: "صيام التطوع", i: <Sun size={14}/>}, {n: "قضاء ما فات", i: <Check size={14}/>}, {n: "سحور البركة", i: <Coffee size={14}/>}, 
      {n: "كف اللسان", i: <ShieldAlert size={14}/>}, {n: "نية الصيام", i: <Heart size={14}/>}
    ]},
    { id: 4, title: "فقه القرآن", icon: <BookOpen />, items: [
      {n: "تلاوة يومية", i: <BookOpen size={14}/>}, {n: "تدبر آية", i: <Brain size={14}/>}, {n: "حفظ جديد", i: <Sparkles size={14}/>}, 
      {n: "الاستماع بإنصات", i: <Activity size={14}/>}, {n: "مراجعة الورد", i: <Clock size={14}/>}
    ]},
    { id: 5, title: "الذكر الذكي", icon: <Activity />, items: [
      {n: "أذكار الصباح", i: <Sun size={14}/>}, {n: "أذكار المساء", i: <Moon size={14}/>}, {n: "الاستغفار", i: <Wind size={14}/>}, 
      {n: "الصلاة على النبي", i: <Heart size={14}/>}, {n: "التسبيح", i: <Sparkles size={14}/>}
    ]},
    { id: 6, title: "العفة والحجاب", icon: <ShieldCheck />, items: [
      {n: "حجاب القلب", i: <Heart size={14}/>}, {n: "غض البصر", i: <ShieldCheck size={14}/>}, {n: "الحياء في القول", i: <MessageCircle size={14}/>}, 
      {n: "سمو الفكر", i: <Brain size={14}/>}, {n: "الستر الأنيق", i: <Shield size={14}/>}
    ]},
    { id: 7, title: "المعاملات والبيوت", icon: <Users />, items: [
      {n: "بر الوالدين", i: <Heart size={14}/>}, {n: "مودة الزوج", i: <Heart size={14}/>}, {n: "رحمة الأبناء", i: <Baby size={14}/>}, 
      {n: "صلة الرحم", i: <Users size={14}/>}, {n: "حسن الجوار", i: <MapPin size={14}/>}
    ]},
    { id: 8, title: "تجنب المحرمات", icon: <ShieldAlert />, items: [
      {n: "محاربة الغيبة", i: <ShieldAlert size={14}/>}, {n: "ترك النميمة", i: <X size={14}/>}, {n: "تجنب الإباحية", i: <Shield size={14}/>}, 
      {n: "الصدق", i: <CheckCircle2 size={14}/>}, {n: "ترك الجدال", i: <Minus size={14}/>}
    ]},
    { id: 9, title: "الهدوء النفسي", icon: <Wind />, items: [
      {n: "تفريغ الانفعالات", i: <Wind size={14}/>}, {n: "الرضا بالقدر", i: <Smile size={14}/>}, {n: "حسن الظن بالله", i: <Sparkles size={14}/>}, 
      {n: "الصبر الجميل", i: <Clock size={14}/>}
    ]},
    { id: 10, title: "أعمال صالحة", icon: <Gift />, items: [
      {n: "صدقة خفية", i: <Coins size={14}/>}, {n: "إماطة الأذى", i: <Trash2 size={14}/>}, {n: "إفشاء السلام", i: <MessageCircle size={14}/>}, 
      {n: "نفع الناس", i: <Users size={14}/>}, {n: "جبر الخواطر", i: <Gift size={14}/>}
    ]},
    { id: 11, title: "الوقت والإنجاز", icon: <Clock />, items: [
      {n: "البكور", i: <Sun size={14}/>}, {n: "تنظيم المهام", i: <List size={14}/>}, {n: "ترك ما لا يعني", i: <X size={14}/>}, 
      {n: "استغلال الفراغ", i: <Hourglass size={14}/>}
    ]},
    { id: 12, title: "الوعي الفقهي", icon: <Brain />, items: [
      {n: "مقاصد الشريعة", i: <GraduationCap size={14}/>}, {n: "قراءة السيرة", i: <BookOpen size={14}/>}, {n: "فقه الواقع", i: <Brain size={14}/>}, 
      {n: "طلب العلم", i: <GraduationCap size={14}/>}
    ]},
    { id: 13, title: "الرعاية الذاتية", icon: <Flower2 />, items: [
      {n: "النوم على طهارة", i: <Moon size={14}/>}, {n: "رياضة بنية القوة", i: <Activity size={14}/>}, {n: "الأكل الطيب", i: <Utensils size={14}/>}, 
      {n: "التزين المشروع", i: <Sparkles size={14}/>}
    ]},
    { id: 14, title: "العطاء والزكاة", icon: <Coins />, items: [
      {n: "زكاة المال", i: <Coins size={14}/>}, {n: "زكاة العلم", i: <GraduationCap size={14}/>}, {n: "زكاة الجمال", i: <Heart size={14}/>}, 
      {n: "الهدية", i: <Gift size={14}/>}
    ]},
    { id: 15, title: "لقاء الله", icon: <Hourglass />, items: [
      {n: "تجديد التوبة", i: <Wind size={14}/>}, {n: "كتابة الوصية", i: <BookOpen size={14}/>}, {n: "ذكر هادم اللذات", i: <Hourglass size={14}/>}, 
      {n: "حسن الخاتمة", i: <Star size={14}/>}
    ]},
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

      const response = await HttpClient.post(options);
      const responseText = response.data.reply || response.data.message || "عذراً رفيقتي، لم أتمكن من الرد الآن.";
      
      setAiResponse(responseText);
      setHistory(prev => [{ role: 'ai', text: responseText, id: Date.now() }, ...prev]);
      
      // إذا كان النداء من تحليل البيانات، نفتح شاشة التحليل
      if (!directMsg) {
          setShowAnalysisModal(true);
      }
    } catch (err) {
      console.error("فشل الاتصال الأصلي:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت 🌸");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>فقه المرأة الوعي والجمال</p>
        
        <div style={styles.headerActions}>
          <button style={styles.chatHeaderBtn} onClick={() => setShowChat(true)}>
            <MessageCircle size={18} />
            <span>دردشة فقه رقة</span>
          </button>
          <a href="https://www.azhar.eg/fatwacenter" target="_blank" rel="noreferrer" style={styles.azharHeaderBtn}>
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
            <div style={styles.inputsList}>
              {activeCategory.items.map((item, idx) => (
                <div key={idx} style={styles.inputStrip}>
                  <div style={styles.stripLabelRow}>
                    <span style={styles.itemIcon}>{item.i}</span>
                    <span style={styles.label}>{item.n}</span>
                  </div>
                  <div style={styles.btnGroup}>
                    <button 
                      onClick={() => setInputs({...inputs, [item.n]: 'yes'})}
                      style={{...styles.toggleBtn, backgroundColor: inputs[item.n] === 'yes' ? '#4caf50' : '#fff', color: inputs[item.n] === 'yes' ? '#fff' : '#888', borderColor: inputs[item.n] === 'yes' ? '#4caf50' : '#ddd'}}
                    >نعم</button>
                    <button 
                      onClick={() => setInputs({...inputs, [item.n]: 'no'})}
                      style={{...styles.toggleBtn, backgroundColor: inputs[item.n] === 'no' ? '#f06292' : '#fff', color: inputs[item.n] === 'no' ? '#fff' : '#888', borderColor: inputs[item.n] === 'no' ? '#f06292' : '#ddd'}}
                    >لا</button>
                  </div>
                </div>
              ))}
            </div>
            <button style={styles.submitBtn} onClick={() => handleProcess()} disabled={loading}>
              {loading ? "جاري التحليل الروحاني..." : "حفظ وتحليل بالذكاء الصناعي ✨"}
            </button>
          </div>
        </>
      )}

      {/* شاشة تحليل البيانات (بنفس شكل الدردشة) */}
      {showAnalysisModal && (
        <div style={styles.chatModal}>
          <div style={styles.chatContent}>
            <div style={styles.chatHeader}>
              <X onClick={() => setShowAnalysisModal(false)} style={{cursor: 'pointer'}} />
              <span style={{fontWeight: 'bold'}}>تحليل رقة الروحاني</span>
              <div style={{width: 20}}></div> 
            </div>
            <div style={styles.chatHistory}>
               <div style={styles.aiMsg}>
                    {aiResponse}
                    <Bookmark size={14} onClick={() => {setSavedReplies([...savedReplies, aiResponse]); alert("تم الحفظ!");}} style={styles.saveIcon} />
               </div>
            </div>
            <div style={styles.chatFooter}>
               <button style={styles.submitBtn} onClick={() => setShowAnalysisModal(false)}>شكراً رقة ✨</button>
            </div>
          </div>
        </div>
      )}

      {/* شاشة الدردشة الأصلية */}
      {showChat && (
        <div style={styles.chatModal}>
          <div style={styles.chatContent}>
            <div style={styles.chatHeader}>
              <X onClick={() => setShowChat(false)} style={{cursor: 'pointer'}} />
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>دردشة رقة</span>
                <List size={18} onClick={() => setShowSavedList(!showSavedList)} style={{cursor: 'pointer'}} />
              </div>
              <Trash2 size={18} onClick={() => setHistory([])} style={{cursor: 'pointer'}} />
            </div>
            {showSavedList ? (
              <div style={styles.savedArea}>
                <h4 style={{textAlign:'center', color:'#f06292'}}>المحفوظات 🌸</h4>
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
                <button style={styles.iconBtn} onClick={() => alert("الميكروفون مفعل")}><Mic size={20}/></button>
                <button style={styles.iconBtn} onClick={() => fileInputRef.current.click()}><Image size={20}/></button>
              </div>
              <div style={styles.inputRow}>
                <input style={styles.chatInput} placeholder="اسألي رقة..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
                <button style={styles.sendBtn} onClick={() => { if(!chatMessage) return; setHistory([{role:'user', text:chatMessage}, ...history]); handleProcess(chatMessage); setChatMessage(""); }}>إرسال</button>
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
  subtitle: { color: '#888', fontStyle: 'italic' },
  headerActions: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' },
  chatHeaderBtn: { background: '#f06292', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' },
  azharHeaderBtn: { background: '#00897b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', maxWidth: '1200px', margin: '0 auto' },
  column: { background: 'rgba(240, 98, 146, 0.03)', padding: '15px', borderRadius: '20px' },
  menuItem: { background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '15px', display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  iconWrapper: { color: '#f06292', marginLeft: '12px' },
  menuText: { fontWeight: 'bold', color: '#444' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10, backdropFilter: 'blur(4px)' },
  activeCard: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '550px', maxHeight: '85vh', background: 'white', borderRadius: '25px', padding: '25px', zIndex: 11, overflowY: 'auto' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px' },
  cardTitle: { color: '#f06292', margin: 0, fontSize: '1.2rem' },
  inputsList: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' },
  inputStrip: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#fff5f8', borderRadius: '15px', border: '1px solid #fce4ec' },
  stripLabelRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  itemIcon: { color: '#f06292' },
  label: { fontSize: '0.9rem', color: '#444', fontWeight: '500' },
  btnGroup: { display: 'flex', gap: '5px' },
  toggleBtn: { padding: '5px 12px', borderRadius: '10px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  submitBtn: { width: '100%', padding: '15px', background: '#f06292', color: 'white', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  chatModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatContent: { width: '90%', maxWidth: '450px', height: '80vh', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '15px', background: '#f06292', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatHistory: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  aiMsg: { alignSelf: 'flex-start', background: '#fce4ec', padding: '15px', borderRadius: '12px 12px 12px 0', maxWidth: '85%', position: 'relative', lineHeight: '1.6', fontSize: '0.9rem', color: '#444' },
  userMsg: { alignSelf: 'flex-end', background: '#eee', padding: '10px', borderRadius: '12px 12px 0 12px', maxWidth: '85%', fontSize: '0.9rem' },
  saveIcon: { position: 'absolute', bottom: '-20px', left: '0', color: '#f06292', cursor: 'pointer' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
  mediaRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  inputRow: { display: 'flex', gap: '10px' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { background: '#f06292', color: 'white', border: 'none', padding: '0 15px', borderRadius: '20px', cursor: 'pointer' },
  iconBtn: { border: 'none', background: '#f8f9fa', color: '#f06292', padding: '8px', borderRadius: '50%', cursor: 'pointer' },
  savedArea: { flex: 1, padding: '15px', overflowY: 'auto' },
  savedItem: { background: '#fdf2f8', padding: '10px', borderRadius: '10px', marginBottom: '8px', fontSize: '0.85rem' },
  backBtn: { width: '100%', padding: '10px', background: '#f06292', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }
};

export default RaqqaApp;
