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
  
  // مرجع للتمرير التلقائي لأسفل الشات
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const categories = [
    { id: "bonding", title: "الود والاتصال العاطفي", icon: <Heart size={24} />, items: ["لغة الحوار 🗣️", "تبادل النظرات 👀", "كلمات التقدير 💌", "الهدايا 🎁", "الدعم وقت الأزمات 🤝", "الضحك المشترك 😂", "وقت خاص ☕", "اللمس العفوي 🤚", "الأمان 🛡️", "التسامح 🏳️"] },
    { id: "foreplay", title: "لغة الجسد والتمهيد", icon: <Flower2 size={24} />, items: ["القبلات 💋", "الأحضان 🫂", "الملاطفة 🌸", "لغة العيون ✨", "همس 👂", "تدليك 💆‍♂️", "نظافة 🧼", "تأنق 👗"] },
    { id: "physical", title: "الصحة والتبادل الجنسي", icon: <Flame size={24} />, items: ["الرغبة 🌡️", "المبادرة ⚡", "مناطق الإثارة 📍", "التفاعل 🔥", "التعبير 💬", "الإشباع ✅", "المدة ⏳"] },
    { id: "climax", title: "النشوة وما بعدها", icon: <Star size={24} />, items: ["النشوة 🌟", "تزامن 💞", "حضن 🫂", "كلمات الحب 🗣️", "بقاء 🧘‍♂️", "رضا ✨"] },
    { id: "creativity", title: "الابتكار والنشاط", icon: <Sparkles size={24} />, items: ["تغيير أماكن 🏡", "أوضاع 🔄", "كسر روتين 🔨", "روائح 🕯️", "تفاعل سمعي 🔊", "مفاجآت 🎈"] },
    { id: "ethics", title: "الضوابط الشرعية", icon: <ShieldCheck size={24} />, items: ["تجنب الحيض 🚫", "تجنب الدبر 🛑", "خصوصية 🤐", "لا إكراه ❌", "ستر 🧺"] },
    { id: "health", title: "الصحة الفسيولوجية", icon: <PlusCircle size={24} />, items: ["قدرة 💪", "بلا آلام 💊", "هرمونات 🧬", "رياضة 🏋️‍♂️", "تغذية 🥑"] },
    { id: "barriers", title: "العوائق والمشكلات", icon: <Brain size={24} />, items: ["ضغوط 🌪️", "أبناء 🧒", "تعب 🔋", "ملل 💤", "صورة الجسد 🪞"] },
    { id: "awareness", title: "الثقافة والوعي", icon: <MessageCircle size={24} />, items: ["سيكولوجية الرجل 🧠", "سيكولوجية المرأة 🌸", "قراءة 📚", "نقاط متعة 🎯"] },
    { id: "spiritual", title: "الاطمئنان الروحي", icon: <Moon size={24} />, items: ["دعاء 🤲", "غسل 🚿", "شكر 🛐", "نية إعفاف 💎"] }
  ];

  // وظيفة إرسال السؤال للذكاء الاصطناعي (رقة)
  const askRaqqaAI = async (text) => {
    if (!text.trim()) return;
    
    // إضافة رسالة المستخدم فوراً للشاشة
    const newMsg = { role: 'user', text: text };
    setMessages(prev => [...prev, newMsg]);
    setLoading(true);
    
    try {
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }) // إرسال البرمبت حسب ملف raqqa-ai.js
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || "عذراً، لم أستطع الرد حالياً." }]); // استقبال الرد من الحقل reply
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "حدث خطأ في الاتصال، حاولي مرة أخرى يا رفيقتي." }]);
    }
    setLoading(false);
    setUserInput(""); // مسح صندوق الإدخال
  };

  // وظيفة حفظ البيانات في نيون (Neon)
  const saveToNeon = async (categoryTitle, note) => {
    try {
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // معرف افتراضي
          category: categoryTitle,
          value: "تحليل علاقة",
          note: note
        }) // إرسال البيانات حسب هيكلية save-health.js
      });
    } catch (e) { console.error("Neon Save Error", e); }
  };

  const handleAnalysis = (cat) => {
    const selected = selectedItems[cat.id] || [];
    const promptText = `أريد تحليل متخصص في العلاقات الزوجية. البيانات في قائمة "${cat.title}" هي: ${selected.join(', ')}. قدمي نصائح للمتعة والسعادة الدائمة بأسلوبك الرقيق.`;
    
    setShowChat(true);
    askRaqqaAI(promptText);
    saveToNeon(cat.title, `المختار: ${selected.join(' - ')}`);
    setActiveList(null);
  };

  return (
    <div style={{ backgroundColor: '#fffaf0', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif', paddingBottom: '20px' }}>
      
      {/* هيدر الصفحة */}
      <header style={{ background: 'linear-gradient(135deg, #800020, #b03060)', color: '#d4af37', padding: '20px 10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem' }}>محلل السعادة الزوجية الذكي</h1>
      </header>

      {/* زر الشات العلوي */}
      <button 
        onClick={() => setShowChat(true)}
        style={{ position: 'fixed', top: '15px', left: '15px', background: '#d4af37', border: 'none', borderRadius: '50%', width: '50px', height: '50px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', zIndex: 100, cursor: 'pointer' }}
      >
        <Sparkles color="#800020" size={24} />
      </button>

      {/* شبكة القوائم */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '15px' }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setActiveList(cat)} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '15px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ color: '#800020', marginBottom: '8px' }}>{cat.icon}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{cat.title}</div>
          </div>
        ))}
      </div>

      {/* نافذة اختيار البيانات */}
      {activeList && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '450px', borderRadius: '20px', maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h2 style={{ color: '#800020', fontSize: '1.1rem', margin: 0 }}>{activeList.title}</h2>
              <X onClick={() => setActiveList(null)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {activeList.items.map(item => (
                <div 
                  key={item}
                  onClick={() => {
                    const current = selectedItems[activeList.id] || [];
                    setSelectedItems({ ...selectedItems, [activeList.id]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] });
                  }}
                  style={{ padding: '8px', border: '1px solid #eee', borderRadius: '8px', fontSize: '0.8rem', backgroundColor: (selectedItems[activeList.id] || []).includes(item) ? '#800020' : '#f9f9f9', color: (selectedItems[activeList.id] || []).includes(item) ? '#fff' : '#333' }}
                >
                  {item}
                </div>
              ))}
            </div>
            <button 
              onClick={() => handleAnalysis(activeList)}
              style={{ width: '100%', marginTop: '15px', padding: '12px', background: '#800020', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}
            >
              تحليل الآن
            </button>
          </div>
        </div>
      )}

      {/* نافذة الشات المصلحة */}
      {showChat && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          {/* الرأس */}
          <div style={{ background: '#800020', color: '#d4af37', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>✨ مستشارة رقة الذكية</div>
            <X onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }} />
          </div>

          {/* منطقة الرسائل مع Scroll تلقائي */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fff9f9' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', 
                background: m.role === 'user' ? '#800020' : '#f0f0f0', 
                color: m.role === 'user' ? '#fff' : '#333', 
                padding: '12px', borderRadius: '15px', marginBottom: '10px', 
                maxWidth: '85%', marginLeft: m.role === 'user' ? 'auto' : '0',
                fontSize: '0.9rem', lineHeight: '1.4'
              }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ color: '#800020', fontSize: '0.8rem' }}>رقة تكتب الآن... ✨</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* شريط الأدوات المصلح (فوق الإدخال) */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px', borderTop: '1px solid #eee', background: '#fff' }}>
            <Trash2 onClick={() => setMessages([])} size={22} color="#800020" style={{cursor: 'pointer'}} />
            <Paperclip size={22} color="#800020" />
            <Mic size={22} color="#800020" />
            <Camera size={22} color="#800020" />
          </div>

          {/* صندوق الإدخال المصلح */}
          <div style={{ padding: '10px 15px 20px', background: '#fff', display: 'flex', gap: '10px' }}>
            <input 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="اكتبي رسالتك هنا..."
              style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' }}
              onKeyPress={(e) => e.key === 'Enter' && askRaqqaAI(userInput)}
            />
            <button 
              onClick={() => askRaqqaAI(userInput)}
              style={{ background: '#d4af37', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={20} color="#800020" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarriageApp;
