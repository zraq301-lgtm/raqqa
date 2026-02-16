import React, { useState, useEffect } from 'react';
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

  // القوائم الـ 10
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

  // وظيفة إرسال السؤال للذكاء الاصطناعي
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
      setMessages(prev => [...prev, { role: 'ai', text: "تعذر الاتصال بالذكاء الاصطناعي، يرجى المحاولة لاحقاً." }]);
    }
    setLoading(false);
  };

  // وظيفة حفظ البيانات في نيون
  const saveToNeon = async (categoryTitle, note) => {
    try {
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "user_mobile",
          category: categoryTitle,
          value: "تحليل ذكي",
          note: note
        })
      });
    } catch (e) { console.error("Save error", e); }
  };

  const handleAnalysis = (cat) => {
    const selected = selectedItems[cat.id] || [];
    const promptText = `بصفتك مستشارة علاقات، حللي المدخلات التالية في قائمة "${cat.title}": ${selected.join(', ')}. أعطني نصائح للمتعة والسعادة الزوجية.`;
    
    setShowChat(true);
    setMessages(prev => [...prev, { role: 'user', text: `تحليل: ${cat.title}` }]);
    askRaqqaAI(promptText);
    saveToNeon(cat.title, `المختار: ${selected.join(' - ')}`);
    setActiveList(null);
  };

  return (
    <div style={{ backgroundColor: '#fffaf0', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      
      {/* هيدر الصفحة */}
      <header style={{ background: 'linear-gradient(135deg, #800020, #b03060)', color: '#d4af37', padding: '25px 15px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>مستشارك الذكي للسعادة الزوجية</h1>
      </header>

      {/* زر الشات العلوي العائم */}
      <button 
        onClick={() => setShowChat(true)}
        style={{ position: 'fixed', top: '20px', left: '20px', background: '#d4af37', border: 'none', borderRadius: '50%', width: '55px', height: '55px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Sparkles color="#800020" size={28} />
      </button>

      {/* شبكة القوائم */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px', padding: '20px' }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setActiveList(cat)} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '15px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#800020', marginBottom: '10px' }}>{cat.icon}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{cat.title}</div>
          </div>
        ))}
      </div>

      {/* مودال القوائم (نافذة منبثقة) */}
      {activeList && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '20px', maxHeight: '90vh', overflowY: 'auto', padding: '20px', position: 'relative' }}>
            <button onClick={() => setActiveList(null)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none' }}><X size={24} /></button>
            <h2 style={{ color: '#800020', fontSize: '1.2rem', marginBottom: '20px' }}>{activeList.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {activeList.items.map(item => (
                <div 
                  key={item}
                  onClick={() => {
                    const current = selectedItems[activeList.id] || [];
                    setSelectedItems({ ...selectedItems, [activeList.id]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] });
                  }}
                  style={{ padding: '10px', border: '1px solid #eee', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: (selectedItems[activeList.id] || []).includes(item) ? '#800020' : '#f9f9f9', color: (selectedItems[activeList.id] || []).includes(item) ? '#fff' : '#333' }}
                >
                  {item}
                </div>
              ))}
            </div>
            <button 
              onClick={() => handleAnalysis(activeList)}
              style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#800020', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
            >
              تحليل وإرسال للذكاء الاصطناعي
            </button>
          </div>
        </div>
      )}

      {/* نافذة الشات (متجاوبة تماماً) */}
      {showChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          {/* رأس الشات */}
          <div style={{ background: '#800020', color: '#d4af37', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold' }}>مستشارة رقة الذكية ✨</div>
            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: '#d4af37' }}><X size={24} /></button>
          </div>

          {/* منطقة الرسائل */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fcf8f8' }}>
            {messages.length === 0 && <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>ابدئي الحوار مع رقة...</div>}
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#800020' : '#fff', color: m.role === 'user' ? '#fff' : '#333', padding: '12px', borderRadius: '15px', maxWidth: '85%', fontSize: '0.95rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ color: '#800020', fontSize: '0.8rem', padding: '10px' }}>رقة تكتب الآن...</div>}
          </div>

          {/* أدوات الميديا */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px', borderTop: '1px solid #eee' }}>
            <button style={{ background: 'none', border: 'none' }}><Camera size={22} color="#800020" /></button>
            <button style={{ background: 'none', border: 'none' }}><Mic size={22} color="#800020" /></button>
            <button style={{ background: 'none', border: 'none' }}><Paperclip size={22} color="#800020" /></button>
            <button onClick={() => setMessages([])} style={{ background: 'none', border: 'none' }}><Trash2 size={22} color="#800020" /></button>
          </div>

          {/* صندوق الإدخال */}
          <div style={{ padding: '10px 15px 25px', display: 'flex', gap: '10px', borderTop: '1px solid #eee' }}>
            <input 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' }}
              onKeyPress={(e) => e.key === 'Enter' && (askRaqqaAI(userInput), setUserInput(""))}
            />
            <button 
              onClick={() => { if(userInput) { setMessages([...messages, {role: 'user', text: userInput}]); askRaqqaAI(userInput); setUserInput(""); } }}
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
