import React, { useState } from 'react';
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin, Smile, Send, Stethoscope
} from 'lucide-react';
// استيراد CapacitorHttp للاتصال المتوافق مع الهواتف
import { CapacitorHttp } from '@capacitor/core';

const RaqqaFeelingsApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [inputs, setInputs] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

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

  // دالة المعالجة الرئيسية باستخدام CapacitorHttp
  const handleProcess = async (customPrompt = null) => {
    setLoading(true);
    setShowChat(true);

    const summary = Object.entries(inputs)
      .filter(([k, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    // البرومبت المتخصص في طب المشاعر والعمق النفسي
    const systemPrompt = customPrompt || `أنا أنثى مسلمة، أشعر في قسم ${activeTab?.title || "العام"} بالآتي: (${summary}). 
    حللي مشاعري بأسلوب يجمع بين "طب المشاعر" والعمق النفسي التحليلي. 
    قدمي نصائح عملية (Somatic tracking) وتوجيهات لترميم الذات، مع ذكر آية أو حديث يربط الجانب النفسي بالإيماني.`;

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: systemPrompt }
      };

      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message || "شكراً لمشاركتكِ مشاعركِ يا رفيقتي.";
      
      setAiResponse(responseText);
      setHistory(prev => [responseText, ...prev]);
    } catch (err) {
      console.error("فشل الاتصال:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت يا رفيقتي 🌸");
    } finally {
      setLoading(false);
    }
  };

  // وظائف أزرار الشات الإضافية
  const handleFeatureNotImplemented = (feature) => {
    alert(`خاصية ${feature} ستكون متاحة قريباً في التحديث القادم بإذن الله ✨`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>محلل مشاعر المرأة المسلمة الشامل</p>
        
        {/* زر التحدث مع طبيب المشاعر الجديد */}
        <button 
          style={styles.doctorBtn} 
          onClick={() => { setShowChat(true); setAiResponse("أهلاً بكِ في عيادة رقة النفسية.. كيف تشعرين اليوم؟"); }}
        >
          <Stethoscope size={20} /> تحدثي مع طبيب المشاعر الذكي
        </button>
      </header>

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

      {activeTab && !showChat && (
        <div style={styles.fullOverlay}>
          <div style={styles.activeContent}>
            <div style={styles.cardHeader}>
              <h2 style={{color: '#f06292'}}>{activeTab.title}</h2>
              <X style={{cursor: 'pointer'}} onClick={() => {setActiveTab(null); setInputs({});}} />
            </div>

            <div style={styles.scrollableInputList}>
              {activeTab.items.map((item, idx) => (
                <div key={idx} style={styles.inputRowFull}>
                  <label style={styles.label}>{item}</label>
                  <input 
                    style={styles.inputField} 
                    placeholder="صفي شعورك بعمق..."
                    value={inputs[item] || ""}
                    onChange={(e) => setInputs({...inputs, [item]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <button 
              style={styles.actionBtn} 
              onClick={() => handleProcess()} 
              disabled={loading || Object.keys(inputs).length === 0}
            >
              {loading ? "جاري التحليل النفسي العميق..." : "تحليل المشاعر بالذكاء الصناعي ✨"}
            </button>
          </div>
        </div>
      )}

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContainer}>
            <div style={styles.chatHeader}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Sparkles color="#f06292" size={20} />
                <h3 style={{margin: 0, color: '#f06292', fontSize: '1.1rem'}}>محراب رقة للدردشة</h3>
              </div>
              <X style={{cursor: 'pointer'}} onClick={() => setShowChat(false)} />
            </div>

            <div style={styles.chatBody}>
              {loading ? (
                <div style={styles.loadingPulse}>جاري استحضار الإجابة الإيمانية والنفسية...</div>
              ) : (
                <>
                  <div style={styles.responseBox}>
                    <p style={{whiteSpace: 'pre-wrap'}}>{aiResponse}</p>
                  </div>
                  
                  {history.length > 1 && (
                    <div style={styles.historySection}>
                      <h4 style={styles.historyTitle}>سجل الاستشفاء السابق:</h4>
                      {history.slice(1).map((h, i) => (
                        <div key={i} style={styles.historyItem}>
                          <div style={{flex: 1}}>{h.substring(0, 70)}...</div>
                          <Trash2 size={16} style={{color: '#ff8aae', cursor: 'pointer', marginRight: '10px'}} 
                            onClick={() => {
                              const newHistory = [...history];
                              newHistory.splice(i+1, 1);
                              setHistory(newHistory);
                            }} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={styles.chatFooter}>
              <div style={styles.inputWrapper}>
                <input 
                  style={styles.mainChatInput} 
                  placeholder="اسألي رقة عن أي وجع أو شعور..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && chatInput && handleProcess(chatInput)}
                />
                <button 
                  style={styles.sendBtn} 
                  onClick={() => { if(chatInput) { handleProcess(chatInput); setChatInput(""); } }}
                >
                  <Send size={20} />
                </button>
              </div>
              
              <div style={styles.chatToolbar}>
                <button style={styles.toolBtnChat} onClick={() => handleFeatureNotImplemented("الكاميرا")} title="كاميرا"><Camera size={22}/></button>
                <button style={styles.toolBtnChat} onClick={() => handleFeatureNotImplemented("التسجيل الصوتي")} title="تسجيل صوتي"><Mic size={22}/></button>
                <button style={styles.toolBtnChat} onClick={() => handleFeatureNotImplemented("إرفاق صور")} title="إرفاق صورة"><Image size={22}/></button>
                <button style={styles.toolBtnChat} onClick={() => {setHistory([]); setAiResponse("تم مسح السجل بنجاح.");}} title="مسح السجل"><Trash2 size={22}/></button>
              </div>
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
  header: { textAlign: 'center', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { fontSize: '2.5rem', color: '#f06292', marginBottom: '5px' },
  subtitle: { color: '#888', fontStyle: 'italic', marginBottom: '15px' },
  doctorBtn: { background: '#f06292', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(240,98,146,0.3)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', maxWidth: '1000px', margin: '0 auto' },
  iconCard: { background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(240,98,146,0.1)', transition: '0.3s' },
  iconLarge: { fontSize: '1.8rem', color: '#f06292', marginBottom: '10px' },
  iconTitle: { fontWeight: 'bold', color: '#444', fontSize: '0.9rem' },
  fullOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' },
  activeContent: { width: '100%', maxWidth: '500px', maxHeight: '90vh', background: 'white', borderRadius: '25px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  scrollableInputList: { flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' },
  inputRowFull: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
  label: { fontSize: '0.85rem', color: '#f06292', marginBottom: '6px', fontWeight: 'bold' },
  inputField: { padding: '12px', borderRadius: '12px', border: '1px solid #fce4ec', background: '#fff9f9', outline: 'none' },
  actionBtn: { width: '100%', padding: '14px', borderRadius: '50px', border: 'none', background: '#f06292', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 200, display: 'flex', flexDirection: 'column' },
  chatContainer: { height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto', width: '100%' },
  chatHeader: { padding: '15px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatBody: { flex: 1, overflowY: 'auto', padding: '20px', background: '#fcfcfc' },
  responseBox: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(240,98,146,0.1)', borderRight: '5px solid #f06292', color: '#444', lineHeight: '1.8' },
  chatFooter: { padding: '15px 20px', borderTop: '1px solid #f5f5f5', background: 'white' },
  inputWrapper: { display: 'flex', gap: '10px', marginBottom: '15px' },
  mainChatInput: { flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #eee', outline: 'none', background: '#f9f9f9' },
  sendBtn: { background: '#f06292', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatToolbar: { display: 'flex', gap: '25px', justifyContent: 'center' },
  toolBtnChat: { background: 'none', border: 'none', color: '#f06292', cursor: 'pointer', opacity: 0.8 },
  historySection: { marginTop: '30px', borderTop: '1px dashed #eee', paddingTop: '20px' },
  historyTitle: { color: '#f06292', fontSize: '0.9rem', marginBottom: '12px' },
  historyItem: { display: 'flex', alignItems: 'center', padding: '12px', background: '#fff', borderRadius: '12px', marginBottom: '10px', fontSize: '0.8rem', color: '#777', border: '1px solid #f9f9f9' },
  loadingPulse: { textAlign: 'center', padding: '40px', color: '#f06292', fontWeight: 'bold' },
  azharBtn: { position: 'fixed', bottom: '20px', left: '20px', background: '#00897b', color: 'white', padding: '12px 20px', borderRadius: '50px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 101, fontSize: '0.9rem' }
};

export default RaqqaFeelingsApp;
