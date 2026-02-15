import React, { useState } from 'react';
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin, Smile
} from 'lucide-react';

const RaqqaFeelingsApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [inputs, setInputs] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // القوائم العشر المختارة بناءً على البرمبت الموسوعي
  const categories = [
    { id: 1, title: "المشاعر الإيمانية", icon: <Sparkles />, items: ["لذة المناجاة 🤲", "خشوع الصلاة ✨", "طمأنينة الذكر 📿", "حلاوة الإيمان 🍯", "الرضا بالقضاء ✅", "حسن الظن بالله 🌈"] },
    { id: 2, title: "المشاعر الهرمونية", icon: <Activity />, items: ["تقلبات المزاج 🎢", "وهن جسدي 💤", "حساسية مفرطة 🌸", "طاقة الصيام 🌙", "نشاط الفجر ☀️"] },
    { id: 3, title: "العلاقات والود", icon: <Heart />, items: ["بر الوالدين 🌳", "مودة الزوج ❤️", "رحمة الأبناء 🐣", "صلة الرحم 🔗", "الحب في الله 🫂"] },
    { id: 4, title: "الذات والنمو", icon: <Brain />, items: ["فخر بالحجاب 🧕", "استحقاق الذات 👑", "جهاد النفس ⚔️", "رغبة في الأثر 🍃", "توبة نصوح ✨"] },
    { id: 5, title: "الضغوط والابتلاءات", icon: <ShieldAlert />, items: ["صبر جميل 💎", "اختناق التوقعات 🌪️", "ضغط مجتمعي 👁️", "ثقل الأمانة 🎒"] },
    { id: 6, title: "النضج والوقار", icon: <Hourglass />, items: ["قبول الشيب 🕰️", "وقار الحكمة 💎", "زهد في الدنيا 🍃", "طمأنينة الختام 🌅"] },
    { id: 7, title: "المخاوف والظلال", icon: <ShieldCheck />, items: ["خوف سوء الخاتمة ⌛", "قلق على الأبناء 🧒", "رهبة القبر 🌑", "وساوس النفس 💭"] },
    { id: 8, title: "التعافي والترميم", icon: <Wind />, items: ["جبر القلوب 🩹", "مداواة الندبات 🧩", "انشراح الصدر 🌬️", "استشفاء بالقرآن 📖"] },
    { id: 9, title: "الطفلة الداخلية", icon: <Smile />, items: ["براءة الفطرة 🍭", "فضول المعرفة 🎈", "دهشة الخلق 🌟", "حاجة للأمان 🧸"] },
    { id: 10, title: "الإنجاز والعمل", icon: <Clock />, items: ["بركة الوقت ⏳", "إتقان العمل 🎯", "فرحة الإنجاز 🏆", "نفع الناس 🤝"] }
  ];

  const handleProcess = async () => {
    setLoading(true);
    const summary = Object.entries(inputs).filter(([k,v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ");
    
    try {
      // 1. الحفظ في Neon DB
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "user_raqqa_feelings",
          category: activeTab.title,
          value: summary,
          note: "تحليل مشاعر من الواجهة الجديدة"
        })
      });

      // 2. التحليل بواسطة Raqqa AI
      const aiRes = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `أنا أنثى مسلمة، أشعر في قسم ${activeTab.title} بالآتي: (${summary}). حللي مشاعري بأسلوب طويل ومتخصص، مع ذكر آية أو حديث يناسب حالتي.`
        })
      });
      const data = await aiRes.json();
      setAiResponse(data.reply);
      setHistory(prev => [data.reply, ...prev]);
    } catch (err) {
      setAiResponse("حدث خطأ في الاتصال، حاولي ثانية يا رفيقتي 🌸");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>محلل مشاعر المرأة المسلمة الشامل</p>
      </header>

      {/* عرض القوائم كأيقونات متراصة */}
      {!activeTab && (
        <div style={styles.grid}>
          {categories.map(cat => (
            <div key={cat.id} style={styles.iconCard} onClick={() => setActiveTab(cat)}>
              <div style={styles.iconLarge}>{cat.icon}</div>
              <span style={styles.iconTitle}>{cat.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* الكارت المستقل عند الضغط على أيقونة */}
      {activeTab && (
        <div style={styles.fullOverlay}>
          <div style={styles.activeContent}>
            <div style={styles.cardHeader}>
              <h2 style={{color: '#f06292'}}>{activeTab.title}</h2>
              <X style={{cursor: 'pointer'}} onClick={() => {setActiveTab(null); setAiResponse("");}} />
            </div>

            <div style={styles.inputList}>
              {activeTab.items.map((item, idx) => (
                <div key={idx} style={styles.inputRow}>
                  <label style={styles.label}>{item}</label>
                  <input 
                    style={styles.inputField} 
                    placeholder="صفي شعورك هنا..."
                    onChange={(e) => setInputs({...inputs, [item]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <div style={styles.aiToolbar}>
              <button style={styles.toolBtn}><Camera /></button>
              <button style={styles.toolBtn}><Mic /></button>
              <button style={styles.toolBtn}><Image /></button>
              <button style={styles.toolBtn} onClick={() => setHistory([])}><Trash2 /></button>
            </div>

            <button style={styles.actionBtn} onClick={handleProcess} disabled={loading}>
              {loading ? "جاري التحليل الإيماني..." : "تحليل المشاعر بالذكاء الصناعي ✨"}
            </button>

            {aiResponse && (
              <div style={styles.responseBox}>
                <p style={{whiteSpace: 'pre-wrap'}}>{aiResponse}</p>
              </div>
            )}

            <div style={styles.historyList}>
              {history.length > 0 && <h4 style={{color: '#f06292'}}>الردود السابقة:</h4>}
              {history.map((h, i) => <div key={i} style={styles.historyItem}>{h.substring(0, 50)}...</div>)}
            </div>
          </div>
        </div>
      )}

      <a href="https://www.azhar.eg/fatwacenter" target="_blank" rel="noreferrer" style={styles.azharBtn}>
        <MapPin size={20} /> اسألي الأزهر
      </a>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(to bottom, #fdf2f8, #ffffff)', padding: '20px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '2.5rem', color: '#f06292', fontFamily: 'Amiri' },
  subtitle: { color: '#888', fontStyle: 'italic' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' },
  iconCard: { background: 'white', padding: '25px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(240,98,146,0.1)', transition: '0.3s' },
  iconLarge: { fontSize: '2rem', color: '#f06292', marginBottom: '10px' },
  iconTitle: { fontWeight: 'bold', color: '#444' },
  fullOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.95)', zIndex: 100, display: 'flex', justifyContent: 'center', padding: '20px' },
  activeContent: { width: '100%', maxWidth: '700px', background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflowY: 'auto' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  inputList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  inputRow: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.8rem', color: '#f06292', marginBottom: '5px' },
  inputField: { padding: '10px', borderRadius: '10px', border: '1px solid #fce4ec', background: '#fff9f9' },
  aiToolbar: { display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' },
  toolBtn: { padding: '10px', borderRadius: '50%', border: 'none', background: '#f8f9fa', color: '#f06292', cursor: 'pointer' },
  actionBtn: { width: '100%', padding: '15px', borderRadius: '50px', border: 'none', background: '#f06292', color: 'white', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' },
  responseBox: { marginTop: '20px', padding: '20px', background: '#fdf2f8', borderRadius: '15px', borderRight: '5px solid #f06292', lineHeight: '1.8' },
  historyItem: { padding: '10px', fontSize: '0.8rem', color: '#999', borderBottom: '1px solid #eee' },
  azharBtn: { position: 'fixed', bottom: '20px', left: '20px', background: '#00897b', color: 'white', padding: '12px 20px', borderRadius: '50px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }
};

export default RaqqaFeelingsApp;
