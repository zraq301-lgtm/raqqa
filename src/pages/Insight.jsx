import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// استيراد الأيقونات
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

  const handleProcess = async (customPrompt = null) => {
    setLoading(true);
    const summary = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(", ");
    
    // البرومبت الموجه: ديني + نفسي + بدون فتوى مطلقة
    const finalPrompt = customPrompt || `أنا أنثى مسلمة، قمت بالآتي في ${activeCategory?.title || 'يومي'}: (${summary}). 
    حللي نمو روحي كطبيبة رقة بأسلوب ديني ونفسي دافئ، قدمي نصائح تربوية وروحية ولا تعطي فتاوى شرعية مطلقة.`;

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: finalPrompt }
      };

      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;
      
      setAiResponse(responseText);
      setHistory(prev => [{ role: 'ai', text: responseText, date: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      console.error("فشل الاتصال:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت يا رفيقتي.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setAiResponse("");
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>فقه المرأة الوعي والجمال</p>
      </header>

      {/* زر الدردشة الخاص */}
      <button style={styles.chatFab} onClick={() => setShowChat(true)}>
        <MessageCircle size={28} />
      </button>

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

      {/* نافذة تحليل الفئة */}
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
                    placeholder="اكتبي هنا..."
                    onChange={(e) => setInputs({...inputs, [item]: e.target.value})}
                  />
                </div>
              ))}
            </div>
            <button style={styles.submitBtn} onClick={() => handleProcess()} disabled={loading}>
              {loading ? "جاري التحليل الروحاني..." : "حفظ وتحليل بالذكاء الصناعي ✨"}
            </button>
            {aiResponse && <div style={styles.aiBox}>{aiResponse}</div>}
          </div>
        </>
      )}

      {/* نافذة الدردشة الذكية (Chat Page) */}
      {showChat && (
        <div style={styles.chatPage}>
          <div style={styles.chatHeader}>
            <X onClick={() => setShowChat(false)} />
            <span>دردشة رقة الذكية</span>
            <Trash2 size={20} onClick={clearHistory} style={{cursor: 'pointer'}} />
          </div>
          
          <div style={styles.chatBody}>
            {history.map((msg, i) => (
              <div key={i} style={msg.role === 'ai' ? styles.msgAi : styles.msgUser}>
                {msg.text}
                <small style={{display: 'block', fontSize: '10px', marginTop: '5px'}}>{msg.date}</small>
              </div>
            ))}
          </div>

          <div style={styles.chatFooter}>
            <div style={styles.mediaRow}>
              <button style={styles.iconBtn}><Camera size={20} /></button>
              <button style={styles.iconBtn}><Mic size={20} /></button>
              <button style={styles.iconBtn}><Image size={20} /></button>
            </div>
            <div style={styles.inputRow}>
              <input 
                style={styles.chatInput} 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="اسألي رقة عن أي شيء..."
              />
              <button style={styles.sendBtn} onClick={() => {
                setHistory(prev => [{role:'user', text: chatMessage, date: new Date().toLocaleTimeString()}, ...prev]);
                handleProcess(chatMessage);
                setChatMessage("");
              }}>إرسال</button>
            </div>
          </div>
        </div>
      )}

      {/* زر اسألي الأزهر العائم */}
      <a href="https://www.azhar.eg/fatwacenter" target="_blank" rel="noreferrer" style={styles.fabAzhar}>
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
  aiBox: { marginTop: '20px', padding: '20px', background: '#fdf2f8', borderRadius: '15px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  
  // تصميم صفحة الدردشة
  chatFab: { position: 'fixed', bottom: '100px', right: '30px', background: '#f06292', color: 'white', width: '60px', height: '60px', borderRadius: '50%', border: 'none', boxShadow: '0 4px 15px rgba(240,98,146,0.4)', cursor: 'pointer', zIndex: 99 },
  chatPage: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 200, display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '20px', background: '#f06292', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatBody: { flex: 1, padding: '20px', overflowY: 'auto', background: '#fdfcfb' },
  msgAi: { background: '#fce4ec', padding: '15px', borderRadius: '15px 15px 0 15px', marginBottom: '10px', maxWidth: '80%', alignSelf: 'flex-start' },
  msgUser: { background: '#eee', padding: '15px', borderRadius: '15px 15px 15px 0', marginBottom: '10px', maxWidth: '80%', alignSelf: 'flex-end', marginRight: 'auto' },
  chatFooter: { padding: '20px', borderTop: '1px solid #eee' },
  mediaRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  inputRow: { display: 'flex', gap: '10px' },
  chatInput: { flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd' },
  sendBtn: { padding: '0 20px', background: '#f06292', color: 'white', borderRadius: '25px', border: 'none' },
  iconBtn: { padding: '8px', borderRadius: '50%', border: 'none', background: '#f8f9fa', color: '#f06292' },

  // الزر العائم للأزهر
  fabAzhar: { 
    position: 'fixed', bottom: '30px', left: '30px', background: '#00897b', color: 'white', 
    padding: '12px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', 
    textDecoration: 'none', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease'
  }
};

export default RaqqaApp;
