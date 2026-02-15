import React, { useState } from 'react';
// استيراد الأيقونات المتاحة والمتوافقة
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin 
} from 'lucide-react';

const RaqqaApp = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [inputs, setInputs] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // هيكل البيانات الـ 15 قائمة مع أيقونات مضمونة التوافق
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

  const handleProcess = async () => {
    setLoading(true);
    const summary = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(", ");

    try {
      // الربط مع كود save-health (Neon DB)
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "user_raqqa",
          category: activeCategory.title,
          value: summary,
          note: "تم الإرسال من تطبيق رقة"
        })
      });

      // الربط مع كود raqqa-ai (Groq API)
      const aiRes = await fetch('/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `أنا رقيقة أقوم بالآتي في ${activeCategory.title}: (${summary}). حللي نمو روحي كطبيبة رقة بأسلوب طويل ومتخصص ودافئ.`
        })
      });
      const data = await aiRes.json();
      
      setAiResponse(data.reply);
      setHistory(prev => [data.reply, ...prev]);
    } catch (error) {
      setAiResponse("عذراً يا رفيقتي، هناك مشكلة في الاتصال حالياً 🌸");
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
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>فقه المرأة الوعي والجمال</p>
      </header>

      {!activeCategory && (
        <div style={styles.grid}>
          {/* تقسيم الـ 15 قائمة لـ 3 مجموعات بجانب بعض */}
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

            <div style={styles.chatControls}>
              <button style={styles.iconBtn}><Camera size={20} /></button>
              <button style={styles.iconBtn}><Mic size={20} /></button>
              <button style={styles.iconBtn}><Image size={20} /></button>
              <button style={styles.iconBtn} onClick={clearAll} title="حذف الردود"><Trash2 size={20} /></button>
            </div>

            <button style={styles.submitBtn} onClick={handleProcess} disabled={loading}>
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

      {/* استبدال Mosque بـ MapPin كأيقونة للمركز (لتجنب خطأ التصدير) */}
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
  menuItem: { 
    background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '15px', 
    display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
  },
  iconWrapper: { color: '#f06292', marginLeft: '12px' },
  menuText: { fontWeight: 'bold', color: '#444' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10, backdropFilter: 'blur(4px)' },
  activeCard: { 
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
    width: '90%', maxWidth: '800px', maxHeight: '90vh', background: 'white', 
    borderRadius: '25px', padding: '30px', zIndex: 11, overflowY: 'auto' 
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px' },
  cardTitle: { color: '#f06292', margin: 0 },
  inputsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.85rem', color: '#666', marginBottom: '5px' },
  inputField: { padding: '10px', borderRadius: '8px', border: '1px solid #fce4ec', background: '#fff' },
  chatControls: { display: 'flex', gap: '15px', justifyContent: 'center', margin: '25px 0' },
  iconBtn: { padding: '12px', borderRadius: '50%', border: 'none', background: '#f8f9fa', cursor: 'pointer', color: '#f06292' },
  submitBtn: { width: '100%', padding: '15px', background: '#f06292', color: 'white', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  aiBox: { marginTop: '20px', padding: '20px', background: '#fdf2f8', borderRadius: '15px', color: '#444', lineHeight: '1.6' },
  fabAzhar: { 
    position: 'fixed', bottom: '30px', left: '30px', background: '#00897b', color: 'white', 
    padding: '12px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', zIndex: 100 
  }
};

export default RaqqaApp;
