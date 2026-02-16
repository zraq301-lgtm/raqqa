import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Camera, Mic, Trash2, Save, 
  Send, ChevronRight, Star, ShieldCheck, Flame, 
  Moon, Flower2, Sparkles, Brain, PlusCircle, X
} from 'lucide-react';

// --- Styles (CSS-in-JS) ---
const styles = {
  container: {
    backgroundColor: '#fffaf0',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    color: '#4a0e0e',
    direction: 'rtl',
    padding: '20px'
  },
  header: {
    background: 'linear-gradient(135deg, #800020 0%, #b03060 100%)',
    color: '#d4af37',
    padding: '20px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    marginBottom: '30px',
    position: 'relative'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  card: {
    background: '#fff',
    border: '1px solid #d4af37',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    padding: '30px',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative'
  },
  chatButton: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    backgroundColor: '#d4af37',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    zIndex: 999
  },
  chatWindow: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    width: '350px',
    height: '500px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    border: '2px solid #800020'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  button: {
    backgroundColor: '#800020',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

const MarriageConsultant = () => {
  const [activeList, setActiveList] = useState(null);
  const [formData, setFormData] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [savedResponses, setSavedResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  // القوائم الـ 10 المطلوبة
  const categories = [
    { id: 1, title: "الود والاتصال العاطفي", icon: <Heart color="#800020" />, items: ["لغة الحوار 🗣️", "تبادل النظرات 👀", "كلمات التقدير 💌", "الهدايا الرمزية 🎁", "الدعم وقت الأزمات 🤝", "الضحك المشترك 😂", "قضاء وقت خاص ☕", "اللمس العفوي 🤚", "الشعور بالأمان 🛡️", "التسامح 🏳️"] },
    { id: 2, title: "لغة الجسد والتمهيد", icon: <Flower2 color="#800020" />, items: ["القبلات العميقة 💋", "الأحضان الدافئة 🫂", "الملاطفة 🌸", "لغة العيون ✨", "الكلمات الهمسية 👂", "التدليك الاسترخائي 💆‍♂️", "النظافة الشخصية 🧼", "التأنق 👗"] },
    { id: 3, title: "الصحة والتبادل الجنسي", icon: <Flame color="#800020" />, items: ["التوافق في الرغبة 🌡️", "المبادرة المشتركة ⚡", "مناطق الإثارة 📍", "التفاعل 🔥", "التعبير عن الاحتياجات 💬", "الإشباع ✅", "طول المدة ⏳"] },
    { id: 4, title: "النشوة وما بعدها", icon: <Star color="#800020" />, items: ["الوصول للنشوة 🌟", "التزامن العاطفي 💞", "الحضن بعد اللقاء 🫂", "كلمات الحب 🗣️", "البقاء معاً 🧘‍♂️", "مشاعر الرضا ✨"] },
    { id: 5, title: "الابتكار والنشاط", icon: <Sparkles color="#800020" />, items: ["تغيير الأماكن 🏡", "أوضاع جديدة 🔄", "كسر الروتين 🔨", "الروائح والموسيقى 🕯️", "التفاعل السمعي 🔊", "المفاجآت 🎈"] },
    { id: 6, title: "الضوابط الشرعية", icon: <ShieldCheck color="#800020" />, items: ["تجنب الحيض 🚫", "تجنب الدبر 🛑", "احترام الخصوصية 🤐", "تجنب الإكراه ❌", "الالتزام بالستر 🧺"] },
    { id: 7, title: "الصحة الفسيولوجية", icon: <PlusCircle color="#800020" />, items: ["القدرة البدنية 💪", "عدم وجود آلام 💊", "توازن الهرمونات 🧬", "ممارسة الرياضة 🏋️‍♂️", "التغذية 🥑"] },
    { id: 8, title: "العوائق والمشكلات", icon: <Brain color="#800020" />, items: ["الضغوط النفسية 🌪️", "انشغال البال بالأبناء 🧒", "التعب الجسدي 🔋", "الملل الزوجي 💤", "صورة الجسد 🪞"] },
    { id: 9, title: "الثقافة والوعي", icon: <MessageCircle color="#800020" />, items: ["سيكولوجية الرجل 🧠", "سيكولوجية المرأة 🌸", "القراءة 📚", "نقاط المتعة 🎯"] },
    { id: 10, title: "الاطمئنان الروحي", icon: <Moon color="#800020" />, items: ["الدعاء قبل العلاقة 🤲", "الغسل المشترك 🚿", "شكر الله 🛐", "نية الإعفاف 💎"] },
  ];

  // وظيفة الإرسال للذكاء الاصطناعي
  const askAI = async (content) => {
    setLoading(true);
    try {
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `أنت خبير علاقات زوجية. حلل المدخلات التالية وقدم نصيحة لزيادة المتعة والسعادة الزوجية وفق الضوابط الشرعية: ${content}`
        })
      });
      const data = await response.json();
      const aiReply = data.reply || "شكراً لمشاركتك. استمر في تعزيز المودة والرحمة بينكما.";
      
      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      saveToDB(content, aiReply); // حفظ في قاعدة البيانات
    } catch (error) {
      console.error("AI Error:", error);
    }
    setLoading(false);
  };

  // وظيفة الحفظ في قاعدة بيانات نيون
  const saveToDB = async (input, output) => {
    try {
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        body: JSON.stringify({ input, output, timestamp: new Date() })
      });
    } catch (e) { console.error("DB Error", e); }
  };

  const handleSendMessage = () => {
    if (!userInput) return;
    setMessages([...messages, { role: 'user', text: userInput }]);
    askAI(userInput);
    setUserInput("");
  };

  return (
    <div style={styles.container}>
      {/* زر الشات العلوي */}
      <button style={styles.chatButton} onClick={() => setShowChat(!showChat)}>
        <MessageCircle size={30} />
      </button>

      <header style={styles.header}>
        <h1>The Intimacy & Harmony Analyzer</h1>
        <p>مستشارك الذكي لعلاقة زوجية ملؤها المودة والرحمة</p>
      </header>

      {/* القوائم الرئيسية */}
      <div style={styles.grid}>
        {categories.map(cat => (
          <div key={cat.id} style={styles.card} onClick={() => setActiveList(cat)}>
            {cat.icon}
            <h3 style={{fontSize: '1.1rem'}}>{cat.title}</h3>
            <span style={{fontSize: '0.8rem', color: '#888'}}>اضغط للتقييم</span>
          </div>
        ))}
      </div>

      {/* مودال إدخال البيانات */}
      {activeList && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button onClick={() => setActiveList(null)} style={{position:'absolute', top:10, left:10, border: 'none', background:'none', cursor:'pointer'}}><X /></button>
            <h2 style={{color: '#800020', marginBottom: '20px'}}>{activeList.title}</h2>
            {activeList.items.map((item, index) => (
              <div key={index} style={{display:'flex', alignItems:'center', marginBottom: '10px', gap: '10px'}}>
                <input type="checkbox" id={`item-${index}`} style={{width:'20px', height:'20px'}} />
                <label htmlFor={`item-${index}`}>{item}</label>
              </div>
            ))}
            <textarea 
              placeholder="ملاحظات إضافية..." 
              style={styles.input} 
              onBlur={(e) => setFormData({...formData, [activeList.id]: e.target.value})}
            ></textarea>
            <button style={styles.button} onClick={() => {
              askAI(`تحليل للقائمة: ${activeList.title}`);
              setShowChat(true);
              setActiveList(null);
            }}>إرسال للتحليل الذكي</button>
          </div>
        </div>
      )}

      {/* نافذة الشات */}
      {showChat && (
        <div style={styles.chatWindow}>
          <div style={{background: '#800020', color: '#fff', padding: '10px', display:'flex', justifyContent:'space-between', borderRadius: '13px 13px 0 0'}}>
            <span>مستشارك الخاص</span>
            <button onClick={() => setShowChat(false)} style={{color:'#fff', background:'none', border:'none'}}>X</button>
          </div>
          
          <div style={{flex: 1, overflowY: 'auto', padding: '10px', display:'flex', flexDirection:'column', gap:'10px'}}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? '#e6ccb2' : '#f0f0f0',
                padding: '8px 12px',
                borderRadius: '10px',
                maxWidth: '80%',
                fontSize: '0.9rem'
              }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{fontSize:'0.7rem'}}>جاري التحليل...</div>}
          </div>

          {/* أدوات الميديا */}
          <div style={{display:'flex', justifyContent:'space-around', padding:'5px', borderTop:'1px solid #eee'}}>
            <button title="فتح الكاميرا"><Camera size={18} /></button>
            <button title="رفع صورة"><Save size={18} /></button>
            <button title="تسجيل صوتي"><Mic size={18} /></button>
            <button title="حفظ" onClick={() => setSavedResponses([...savedResponses, messages[messages.length-1]])}><Star size={18} /></button>
            <button title="مسح" onClick={() => setMessages([])}><Trash2 size={18} /></button>
          </div>

          <div style={{padding: '10px', display:'flex', gap: '5px'}}>
            <input 
              style={{...styles.input, margin:0}} 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="اكتب هنا..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} style={{background:'#d4af37', border:'none', borderRadius:'5px', padding:'0 10px'}}><Send size={18} color="#fff" /></button>
          </div>
        </div>
      )}

      {/* قائمة الردود المحفوظة */}
      {savedResponses.length > 0 && (
        <div style={{marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #d4af37'}}>
          <h3><Star style={{display:'inline'}} /> الردود المحفوظة</h3>
          {savedResponses.map((r, i) => (
            <div key={i} style={{padding: '10px', borderBottom: '1px dashed #ccc'}}>
              {r?.text.substring(0, 100)}...
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarriageConsultant;
