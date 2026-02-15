import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, Mosque, X 
} from 'lucide-react';

// --- التطبيق الرئيسي بنظام ريأكت ---
const RaqqaApp = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [inputs, setInputs] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // هيكل البيانات الـ 15 قائمة
  const menuData = [
    { id: 1, title: "فقه الطهارة", icon: <Sparkles />, items: ["سنن الفطرة", "صفة الغسل", "الوضوء الجمالي", "طهارة الثوب", "طيب الرائحة"] },
    { id: 2, title: "فقه الصلاة", icon: <Heart />, items: ["أوقات الصلاة", "السنن الرواتب", "سجدة الشكر", "لباس الصلاة", "صلاة الوتر"] },
    { id: 3, title: "فقه الصيام", icon: <Moon />, items: ["صيام التطوع", "قضاء ما فات", "سحور البركة", "كف اللسان"] },
    { id: 4, title: "فقه القرآن", icon: <BookOpen />, items: ["تلاوة يومية", "تدبر آية", "حفظ جديد", "الاستماع بإنصات"] },
    { id: 5, title: "الذكر الذكي", icon: <Activity />, items: ["أذكار الصباح", "أذكار المساء", "الاستغفار", "الصلاة على النبي"] },
    { id: 6, title: "العفة والحجاب", icon: <ShieldCheck />, items: ["حجاب القلب", "غض البصر", "الحياء في القول", "سمو الفكر"] },
    { id: 7, title: "المعاملات والبيوت", icon: <Users />, items: ["بر الوالدين", "مودة الزوج", "رحمة الأبناء", "صلة الرحم"] },
    { id: 8, title: "تجنب المحرمات", icon: <ShieldAlert />, items: ["محاربة الغيبة", "ترك النميمة", "تجنب الإباحية", "الصدق"] },
    { id: 9, title: "الهدوء النفسي", icon: <Wind />, items: ["تفريغ الانفعالات", "الرضا بالقدر", "حسن الظن بالله"] },
    { id: 10, title: "أعمال صالحة", icon: <Gift />, items: ["صدقة خفية", "إماطة الأذى", "إفشاء السلام", "نفع الناس"] },
    { id: 11, title: "الوقت والإنجاز", icon: <Clock />, items: ["البكور", "تنظيم المهام", "ترك ما لا يعني"] },
    { id: 12, title: "الوعي الفقهي", icon: <Brain />, items: ["مقاصد الشريعة", "قراءة السيرة", "فقه الواقع"] },
    { id: 13, title: "الرعاية الذاتية", icon: <Flower2 />, items: ["النوم على طهارة", "الرياضة بنية القوة", "الأكل الطيب"] },
    { id: 14, title: "العطاء والزكاة", icon: <Coins />, items: ["زكاة المال", "زكاة العلم", "زكاة الجمال"] },
    { id: 15, title: "لقاء الله", icon: <Hourglass />, items: ["تجديد التوبة", "كتابة الوصية", "ذكر هادم اللذات"] },
  ];

  // وظيفة إرسال البيانات (الربط بـ Neon و Raqqa AI)
  const handleProcess = async () => {
    setLoading(true);
    const summary = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(", ");

    try {
      // 1. الحفظ في نيون عبر API الخاص بك
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "user_123", 
          category: activeCategory.title,
          value: summary,
          note: "تم الإرسال من واجهة رقة الموحدة"
        })
      });

      // 2. التحليل بواسطة Raqqa AI
      const aiRes = await fetch('/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `بناءً على نشاطي في ${activeCategory.title}: (${summary})، قدمي لي نصيحة فقهية وروحية رقيقة ومفصلة.`
        })
      });
      const data = await aiRes.json();
      
      setAiResponse(data.reply);
      setHistory(prev => [data.reply, ...prev]);
    } catch (error) {
      setAiResponse("عذراً رفيقتي، حدث خطأ في الاتصال.. حاولي مرة أخرى 🌸");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setInputs({});
    setAiResponse("");
    setHistory([]);
  };

  return (
    <div style={styles.appContainer}>
      {/* الهيدر */}
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>فقه المرأة.. حيث يلتقي الوعي بالجمال</p>
      </header>

      {/* عرض المجموعات الثلاث */}
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

      {/* الكارت المستقل عند التفعيل */}
      {activeCategory && (
        <>
          <div style={styles.overlay} onClick={() => setActiveCategory(null)} />
          <div style={styles.activeCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>{activeCategory.title}</h2>
              <X style={{cursor: 'pointer'}} onClick={() => setActiveCategory(null)} />
            </div>

            <div style={styles.inputsContainer}>
              {activeCategory.items.map((item, idx) => (
                <div key={idx} style={styles.inputBox}>
                  <label style={styles.label}>{item}</label>
                  <input 
                    style={styles.input} 
                    placeholder="اكتبي هنا..."
                    value={inputs[item] || ""}
                    onChange={(e) => setInputs({...inputs, [item]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            {/* أدوات الشات */}
            <div style={styles.chatTools}>
              <button style={styles.toolBtn}><Camera size={20} /></button>
              <button style={styles.toolBtn}><Mic size={20} /></button>
              <button style={styles.toolBtn}><Image size={20} /></button>
              <button style={styles.toolBtn} onClick={clearAll}><Trash2 size={20} /></button>
            </div>

            <button style={styles.saveBtn} onClick={handleProcess} disabled={loading}>
              {loading ? "جاري التحليل..." : "حفظ وتحليل بالذكاء الصناعي ✨"}
            </button>

            {aiResponse && (
              <div style={styles.aiBox}>
                <p><strong>رقة تحلل نموكِ الروحي:</strong></p>
                <p>{aiResponse}</p>
              </div>
            )}
            
            <div style={styles.history}>
              {history.map((h, i) => (
                <div key={i} style={styles.historyItem}>{h}</div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* زر اسألي الأزهر */}
      <a href="https://www.azhar.eg/fatwacenter" target="_blank" rel="noreferrer" style={styles.fabAzhar}>
        <Mosque size={24} />
        <span>اسألي الأزهر</span>
      </a>
    </div>
  );
};

// --- التنسيقات (CSS-in-JS) ---
const styles = {
  appContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    padding: '20px',
    fontFamily: 'Tajawal, sans-serif',
    direction: 'rtl'
  },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { color: '#f06292', fontSize: '2.5rem', fontFamily: 'Amiri' },
  subtitle: { color: '#666', fontFamily: 'Amiri' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  column: { background: 'rgba(255,255,255,0.3)', padding: '15px', borderRadius: '20px' },
  menuItem: {
    background: 'white',
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: '0.3s',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  iconWrapper: { color: '#f06292', marginLeft: '15px' },
  menuText: { fontWeight: '500' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 10 },
  activeCard: {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '800px', maxHeight: '85vh', background: 'white',
    borderRadius: '30px', padding: '30px', zIndex: 11, overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  cardTitle: { color: '#f06292', margin: 0 },
  inputsContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  inputBox: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.8rem', marginBottom: '5px', color: '#888' },
  input: { padding: '10px', borderRadius: '10px', border: '1px solid #eee', background: '#fff9c4' },
  chatTools: { display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' },
  toolBtn: { padding: '10px', borderRadius: '50%', border: 'none', background: '#f0f0f0', cursor: 'pointer' },
  saveBtn: { 
    width: '100%', padding: '15px', borderRadius: '50px', border: 'none', 
    background: '#f06292', color: 'white', fontWeight: 'bold', cursor: 'pointer' 
  },
  aiBox: { marginTop: '20px', padding: '15px', background: '#e0f2f1', borderRadius: '15px', borderRight: '5px solid #f06292' },
  history: { marginTop: '20px', fontSize: '0.9rem' },
  historyItem: { padding: '10px', borderBottom: '1px solid #eee' },
  fabAzhar: {
    position: 'fixed', bottom: '30px', left: '30px', background: '#00897b',
    color: 'white', padding: '15px 25px', borderRadius: '50px', textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
  }
};

export default RaqqaApp;
