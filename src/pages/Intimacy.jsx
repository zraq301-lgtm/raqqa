import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Camera, Mic, Trash2, Save, 
  Send, Star, ShieldCheck, Flame, 
  Moon, Flower2, Sparkles, Brain, PlusCircle, X, Paperclip
} from 'lucide-react';

const MarriageApp = () => {
  const [activeList, setActiveList] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showChat) scrollToBottom();
  }, [messages, loading, showChat]);

  const categories = [
    { id: "bonding", title: "الود والاتصال العاطفي", icon: <Heart size={24} />, items: ["لغة الحوار 🗣️", "تبادل النظرات 👀", "كلمات التقدير 💌", "الهدايا 🎁", "الدعم 🤝", "الضحك 😂", "وقت خاص ☕", "اللمس 🤚", "الأمان 🛡️", "التسامح 🏳️"] },
    { id: "foreplay", title: "لغة الجسد والتمهيد", icon: <Flower2 size={24} />, items: ["القبلات 💋", "الأحضان 🫂", "الملاطفة 🌸", "لغة العيون ✨", "همس 👂", "تدليك 💆‍♂️", "نظافة 🧼", "تأنق 👗"] },
    { id: "physical", title: "الصحة والتبادل الجنسي", icon: <Flame size={24} />, items: ["الرغبة 🌡️", "المبادرة ⚡", "مناطق الإثارة 📍", "التفاعل 🔥", "التعبير 💬", "الإشباع ✅", "المدة ⏳"] },
    { id: "climax", title: "النشوة وما بعدها", icon: <Star size={24} />, items: ["النشوة 🌟", "تزامن 💞", "حضن 🫂", "كلمات الحب 🗣️", "بقاء 🧘‍♂️", "رضا ✨"] },
    { id: "creativity", title: "الابتكار والنشاط", icon: <Sparkles size={24} />, items: ["أماكن 🏡", "أوضاع 🔄", "روتين 🔨", "روائح 🕯️", "سمعي 🔊", "مفاجآت 🎈"] },
    { id: "ethics", title: "الضوابط الشرعية", icon: <ShieldCheck size={24} />, items: ["تجنب الحيض 🚫", "تجنب الدبر 🛑", "خصوصية 🤐", "لا إكراه ❌", "ستر 🧺"] },
    { id: "health", title: "الصحة الفسيولوجية", icon: <PlusCircle size={24} />, items: ["قدرة 💪", "ألم 💊", "هرمونات 🧬", "رياضة 🏋️‍♂️", "تغذية 🥑"] },
    { id: "barriers", title: "العوائق والمشكلات", icon: <Brain size={24} />, items: ["ضغوط 🌪️", "أبناء 🧒", "تعب 🔋", "ملل 💤", "الجسد 🪞"] },
    { id: "awareness", title: "الثقافة والوعي", icon: <MessageCircle size={24} />, items: ["الرجل 🧠", "المرأة 🌸", "كتب 📚", "متعة 🎯"] },
    { id: "spiritual", title: "الاطمئنان الروحي", icon: <Moon size={24} />, items: ["دعاء 🤲", "غسل 🚿", "شكر 🛐", "نية 💎"] }
  ];

  // 1. وظيفة إرسال السؤال للذكاء الاصطناعي (رقة) [تعديل الحقول لتطابق raqqa-ai.js]
  const askRaqqaAI = async (text) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setLoading(true);
    setUserInput(""); 
    
    try {
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }) // الحقل المطلوب هو prompt
      });
      const data = await response.json();
      // استقبال الحقل reply كما هو في Backend
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || "عذراً رفيقتي، رقة لم تستطع الرد." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "حدث خطأ في الشبكة، حاولي مرة أخرى." }]);
    }
    setLoading(false);
  };

  // 2. وظيفة حفظ البيانات في نيون [تعديل الحقول لتطابق save-health.js]
  const saveToNeon = async (categoryTitle, selectedItemsList) => {
    try {
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // رقم افتراضي كما يتطلب الـ SQL لديك
          category: categoryTitle,
          value: "تحليل علاقة زوجية",
          note: `تم اختيار: ${selectedItemsList.join(' - ')}`
        }) // تطابق حقول req.body في ملف save-health.js
      });
    } catch (e) { console.error("Neon Save Error", e); }
  };

  const handleAnalysis = (cat) => {
    const selected = selectedItems[cat.id] || [];
    if (selected.length === 0) return alert("يرجى اختيار بعض العناصر أولاً");

    const promptText = `بصفتك مستشارة 'رقة' المتخصصة في السعادة الزوجية، حللي هذه البيانات من قائمة ${cat.title}: (${selected.join('، ')}). قدمي نصائح دافئة لتعزيز المتعة والسعادة الدائمة.`;
    
    setShowChat(true);
    askRaqqaAI(promptText);
    saveToNeon(cat.title, selected);
    setActiveList(null);
  };

  return (
    <div style={{ backgroundColor: '#fffaf0', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* هيدر ثابت */}
      <header style={{ background: '#800020', color: '#d4af37', padding: '15px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 500 }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>مستشارك الذكي للسعادة الزوجية</h1>
      </header>

      {/* زر الشات العائم */}
      <button 
        onClick={() => setShowChat(true)}
        style={{ position: 'fixed', bottom: '20px', left: '20px', background: '#d4af37', border: 'none', borderRadius: '50%', width: '60px', height: '60px', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
      >
        <Sparkles color="#800020" size={30} />
      </button>

      {/* القوائم */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px' }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setActiveList(cat)} style={{ background: '#fff', borderRadius: '15px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #eee' }}>
            <div style={{ color: '#800020', marginBottom: '10px' }}>{cat.icon}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{cat.title}</div>
          </div>
        ))}
      </div>

      {/* نافذة اختيار العناصر */}
      {activeList && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '450px', borderRadius: '25px', maxHeight: '85vh', overflowY: 'auto', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: '#800020', fontSize: '1.1rem', margin: 0 }}>{activeList.title}</h2>
              <X onClick={() => setActiveList(null)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {activeList.items.map(item => (
                <button 
                  key={item}
                  onClick={() => {
                    const current = selectedItems[activeList.id] || [];
                    setSelectedItems({ ...selectedItems, [activeList.id]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] });
                  }}
                  style={{ padding: '10px', border: '1px solid #eee', borderRadius: '10px', fontSize: '0.8rem', backgroundColor: (selectedItems[activeList.id] || []).includes(item) ? '#800020' : '#f9f9f9', color: (selectedItems[activeList.id] || []).includes(item) ? '#fff' : '#333', cursor: 'pointer' }}
                >
                  {item}
                </button>
              ))}
            </div>
            <button 
              onClick={() => handleAnalysis(activeList)}
              style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#800020', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem' }}
            >
              تحليل بالذكاء الاصطناعي وحفظ
            </button>
          </div>
        </div>
      )}

      {/* نافذة الشات المصلحة تماماً للهاتف */}
      {showChat && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#800020', color: '#d4af37', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>✨ مستشارة رقة الذكية</span>
            <X onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fff9f9' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', 
                background: m.role === 'user' ? '#800020' : '#fff', 
                color: m.role === 'user' ? '#fff' : '#333', 
                padding: '12px 18px', borderRadius: '20px', marginBottom: '15px', 
                maxWidth: '85%', marginLeft: m.role === 'user' ? 'auto' : '0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)', fontSize: '0.95rem', border: m.role === 'ai' ? '1px solid #f0e0e0' : 'none'
              }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ color: '#800020', fontSize: '0.8rem', textAlign: 'center' }}>رقة تكتب لكِ الآن... 🖋️</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* شريط الأدوات */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px', borderTop: '1px solid #eee', background: '#fff' }}>
            <Trash2 onClick={() => setMessages([])} size={24} color="#800020" style={{cursor:'pointer'}} />
            <Paperclip size={24} color="#800020" />
            <Mic size={24} color="#800020" />
            <Camera size={24} color="#800020" />
          </div>

          {/* مدخل النص */}
          <div style={{ padding: '10px 15px 30px', background: '#fff', display: 'flex', gap: '12px' }}>
            <input 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="اكتبي رسالتك هنا..."
              style={{ flex: 1, padding: '14px 20px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }}
              onKeyPress={(e) => e.key === 'Enter' && askRaqqaAI(userInput)}
            />
            <button 
              onClick={() => askRaqqaAI(userInput)}
              style={{ background: '#d4af37', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Send size={22} color="#800020" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarriageApp;
