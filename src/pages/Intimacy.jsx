import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Camera, Mic, Trash2, Save, 
  Send, ChevronRight, Star, ShieldCheck, Flame, 
  Moon, Flower2, Sparkles, Brain, PlusCircle, X, Paperclip
} from 'lucide-react';

// --- الستايلات بنمط احترافي ---
const styles = {
  container: {
    backgroundColor: '#fffaf0',
    minHeight: '100vh',
    fontFamily: 'Tajawal, sans-serif',
    color: '#4a0e0e',
    direction: 'rtl',
    padding: '20px'
  },
  header: {
    background: 'linear-gradient(135deg, #800020 0%, #b03060 100%)',
    color: '#d4af37',
    padding: '30px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(128,0,32,0.2)',
    marginBottom: '40px',
    border: '1px solid #d4af37'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#fff',
    border: '2px solid #f3e5f5',
    borderRadius: '15px',
    padding: '25px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  modalContent: {
    background: 'white',
    padding: '30px',
    borderRadius: '25px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    border: '3px solid #800020'
  },
  chatWindow: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    width: '380px',
    height: '550px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    overflow: 'hidden',
    border: '1px solid #d4af37'
  },
  aiButton: {
    backgroundColor: '#800020',
    color: '#d4af37',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '15px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  }
};

const MarriageAnalyzer = () => {
  const [activeList, setActiveList] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedLogs, setSavedLogs] = useState([]);

  // القوائم الـ 10
  const categories = [
    { id: "bonding", title: "الود والاتصال العاطفي", icon: <Heart color="#800020" />, items: ["لغة الحوار 🗣️", "تبادل النظرات 👀", "كلمات التقدير 💌", "الهدايا الرمزية 🎁", "الدعم وقت الأزمات 🤝", "الضحك المشترك 😂", "قضاء وقت خاص ☕", "اللمس العفوي 🤚", "الشعور بالأمان 🛡️", "التسامح 🏳️"] },
    { id: "foreplay", title: "لغة الجسد والتمهيد", icon: <Flower2 color="#800020" />, items: ["القبلات العميقة 💋", "الأحضان الدافئة 🫂", "الملاطفة 🌸", "لغة العيون ✨", "الكلمات الهمسية 👂", "التدليك 💆‍♂️", "النظافة 🧼", "التأنق 👗"] },
    { id: "physical", title: "الصحة والتبادل الجنسي", icon: <Flame color="#800020" />, items: ["التوافق في الرغبة 🌡️", "المبادرة المشتركة ⚡", "مناطق الإثارة 📍", "التفاعل 🔥", "التعبير عن الاحتياجات 💬", "الإشباع ✅", "طول المدة ⏳"] },
    { id: "climax", title: "النشوة وما بعدها", icon: <Star color="#800020" />, items: ["الوصول للنشوة 🌟", "التزامن العاطفي 💞", "الحضن بعد اللقاء 🫂", "كلمات الحب 🗣️", "البقاء معاً 🧘‍♂️", "مشاعر الرضا ✨"] },
    { id: "creativity", title: "الابتكار والنشاط", icon: <Sparkles color="#800020" />, items: ["تغيير الأماكن 🏡", "أوضاع جديدة 🔄", "كسر الروتين 🔨", "الروائح والموسيقى 🕯️", "التفاعل السمعي 🔊", "المفاجآت 🎈"] },
    { id: "ethics", title: "الضوابط الشرعية", icon: <ShieldCheck color="#800020" />, items: ["تجنب الحيض 🚫", "تجنب الدبر 🛑", "احترام الخصوصية 🤐", "تجنب الإكراه ❌", "الالتزام بالستر 🧺"] },
    { id: "health", title: "الصحة الفسيولوجية", icon: <PlusCircle color="#800020" />, items: ["القدرة البدنية 💪", "عدم وجود آلام 💊", "توازن الهرمونات 🧬", "ممارسة الرياضة 🏋️‍♂️", "التغذية 🥑"] },
    { id: "barriers", title: "العوائق والمشكلات", icon: <Brain color="#800020" />, items: ["الضغوط النفسية 🌪️", "انشغال البال بالأبناء 🧒", "التعب الجسدي 🔋", "الملل الزوجي 💤", "صورة الجسد 🪞"] },
    { id: "awareness", title: "الثقافة والوعي", icon: <MessageCircle color="#800020" />, items: ["سيكولوجية الرجل 🧠", "سيكولوجية المرأة 🌸", "القراءة 📚", "نقاط المتعة 🎯"] },
    { id: "spiritual", title: "الاطمئنان الروحي", icon: <Moon color="#800020" />, items: ["الدعاء قبل العلاقة 🤲", "الغسل المشترك 🚿", "شكر الله 🛐", "نية الإعفاف 💎"] }
  ];

  // 1. وظيفة إرسال السؤال للذكاء الاصطناعي (رقة)
  const askRaqqaAI = async (text) => {
    setLoading(true);
    try {
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "عذراً رفيقتي، حدث خطأ في الاتصال." }]);
    }
    setLoading(false);
  };

  // 2. وظيفة حفظ البيانات في نيون (Neon)
  const saveToNeon = async (categoryTitle, note) => {
    try {
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "user_123", // يمكن تغييره حسب نظام التسجيل لديك
          category: categoryTitle,
          value: "تحليل علاقة",
          note: note
        })
      });
      const data = await response.json();
      if (data.success) {
        setSavedLogs(prev => [...prev, `تم حفظ تحليل: ${categoryTitle}`]);
      }
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const handleAnalysis = (cat) => {
    const selected = selectedItems[cat.id] || [];
    const promptText = `أريد تحليل متخصص في العلاقات الزوجية. البيانات المدخلة في قائمة "${cat.title}" هي: ${selected.join(', ')}. قدم لي نصائح للمتعة والسعادة الدائمة بأسلوب رقة.`;
    
    setShowChat(true);
    setMessages([{ role: 'user', text: `تحليل قائمة: ${cat.title}` }]);
    askRaqqaAI(promptText);
    saveToNeon(cat.title, `المختار: ${selected.join(' - ')}`);
    setActiveList(null);
  };

  const toggleItem = (catId, item) => {
    const current = selectedItems[catId] || [];
    if (current.includes(item)) {
      setSelectedItems({ ...selectedItems, [catId]: current.filter(i => i !== item) });
    } else {
      setSelectedItems({ ...selectedItems, [catId]: [...current, item] });
    }
  };

  return (
    <div style={styles.container}>
      {/* زر الذكاء الاصطناعي العلوي */}
      <button 
        style={{ position: 'fixed', top: '25px', left: '25px', backgroundColor: '#800020', color: '#d4af37', border: '2px solid #d4af37', borderRadius: '50%', width: '65px', height: '65px', zIndex: 1000, cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}
        onClick={() => setShowChat(!showChat)}
      >
        <Sparkles size={30} />
      </button>

      <header style={styles.header}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>محلل التناغم الزوجي الذكي</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>خطوتكم نحو علاقة أعمق، أكثر سعادة، ومتعة دائمة</p>
      </header>

      <div style={styles.grid}>
        {categories.map(cat => (
          <div key={cat.id} style={styles.card} onClick={() => setActiveList(cat)}>
            <div style={{ background: '#fffaf0', padding: '15px', borderRadius: '50%' }}>{cat.icon}</div>
            <h3 style={{ color: '#800020' }}>{cat.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#b03060' }}>
              <PlusCircle size={14} /> اضغطي للبدء
            </div>
          </div>
        ))}
      </div>

      {/* مودال إدخال البيانات */}
      {activeList && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={styles.modalContent}>
            <button onClick={() => setActiveList(null)} style={{ position: 'absolute', top: 20, left: 20, border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} color="#800020" /></button>
            <h2 style={{ color: '#800020', textAlign: 'center', marginBottom: '25px' }}>{activeList.title}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {activeList.items.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => toggleItem(activeList.id, item)}
                  style={{ 
                    padding: '12px', borderRadius: '10px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.9rem',
                    backgroundColor: selectedItems[activeList.id]?.includes(item) ? '#800020' : '#f9f9f9',
                    color: selectedItems[activeList.id]?.includes(item) ? '#fff' : '#333',
                    transition: 'all 0.2s'
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <button style={styles.aiButton} onClick={() => handleAnalysis(activeList)}>
              <Brain size={20} /> تحليل بالذكاء الاصطناعي وحفظ
            </button>
          </div>
        </div>
      )}

      {/* نافذة المحادثة (الشات) */}
      {showChat && (
        <div style={styles.chatWindow}>
          <div style={{ background: '#800020', color: '#d4af37', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '50%' }}></div>
              <span style={{ fontWeight: 'bold' }}>رقة - المستشارة الذكية</span>
            </div>
            <button onClick={() => setShowChat(false)} style={{ color: '#d4af37', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fff9f9' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? '#800020' : '#fff',
                color: m.role === 'user' ? '#fff' : '#4a0e0e',
                padding: '12px 15px',
                borderRadius: '15px',
                maxWidth: '85%',
                fontSize: '0.95rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                border: m.role === 'ai' ? '1px solid #f0e0e0' : 'none'
              }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ fontSize: '0.8rem', color: '#800020', textAlign: 'center' }}>رقة تفكر في نصيحة لكِ... ✨</div>}
          </div>

          {/* شريط الأدوات المتقدم */}
          <div style={{ padding: '10px', borderTop: '1px solid #eee', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px', color: '#800020' }}>
              <button title="كاميرا" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Camera size={20} /></button>
              <button title="ميكروفون" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Mic size={20} /></button>
              <button title="إرفاق" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Paperclip size={20} /></button>
              <button title="مسح المحادثة" onClick={() => setMessages([])} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="اسألي رقة عن أي شيء..."
                onKeyPress={(e) => e.key === 'Enter' && (askRaqqaAI(userInput), setUserInput(""))}
              />
              <button 
                onClick={() => { askRaqqaAI(userInput); setUserInput(""); }}
                style={{ background: '#d4af37', border: 'none', borderRadius: '10px', padding: '0 15px', cursor: 'pointer' }}
              >
                <Send size={20} color="#800020" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* سجل الحفظ السريع */}
      {savedLogs.length > 0 && (
        <div style={{ marginTop: '40px', background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #d4af37' }}>
          <h4 style={{ color: '#800020', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Save size={18} /> الردود المسجلة في نيون
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {savedLogs.map((log, i) => (
              <span key={i} style={{ background: '#fffaf0', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid #eee' }}>{log}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarriageAnalyzer;
