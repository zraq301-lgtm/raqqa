import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Trash2, Mic, Camera, Image as ImageIcon, 
  Sparkles, Star, Heart, Brain, Save, X, ChevronLeft 
} from 'lucide-react';

// القوائم الـ 15 مع مهامها (تم اختصارها للعرض، يمكنك توسيعها)
const CATEGORIES = [
  { id: 1, name: "فقه الطهارة", icon: "✨", color: "#FCE4EC", tasks: ["سنن الفطرة", "صفة الغسل", "الوضوء الجمالي", "طهارة الثوب"] },
  { id: 2, name: "فقه الصلاة", icon: "🕌", color: "#E8F5E9", tasks: ["أوقات الصلاة", "السنن الرواتب", "سجدة الشكر"] },
  { id: 3, name: "فقه الصيام", icon: "🌙", color: "#FFF3E0", tasks: ["صيام الاثنين", "قضاء ما فات", "سحور البركة"] },
  { id: 4, name: "فقه القرآن", icon: "📖", color: "#E3F2FD", tasks: ["تلاوة يومية", "تدبر آية", "حفظ سورة"] },
  { id: 5, name: "الذكر الذكي", icon: "📿", color: "#F3E5F5", tasks: ["أذكار الصباح", "أذكار المساء", "الاستغفار"] },
  // أضف بقية القوائم هنا بنفس النمط...
];

const App = () => {
  const [selectedCat, setSelectedCat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // دالة الحفظ في نيون DB
  const handleSave = async (data) => {
    try {
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        body: JSON.stringify({ category: selectedCat.name, data, date: new Date() }),
      });
      alert("تم حفظ التقدم في قاعدة البيانات بنجاح 🌸");
    } catch (err) { console.error(err); }
  };

  // دالة تحليل الذكاء الاصطناعي
  const handleAIAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        body: JSON.stringify({ prompt: `حلل مستوى تقدمي في ${selectedCat.name}` }),
      });
      const data = await res.json();
      setMessages([...messages, { role: 'ai', text: data.reply }]);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="main-header">
        <Heart className="heart-icon" fill="#f06292" />
        <h1>رفيقة الدرب الرقمية</h1>
      </header>

      {/* Grid of Icons (القوائم في شكل أيقونات) */}
      <div className="icon-grid">
        {CATEGORIES.map(cat => (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            key={cat.id} 
            className="cat-card"
            style={{ backgroundColor: cat.color }}
            onClick={() => setSelectedCat(cat)}
          >
            <span className="cat-emoji">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Modal / Overlay for Category Details (كارت المدخلات) */}
      <AnimatePresence>
        {selectedCat && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="details-overlay"
          >
            <div className="details-card">
              <div className="card-header">
                <h2>{selectedCat.icon} {selectedCat.name}</h2>
                <X onClick={() => setSelectedCat(null)} className="close-btn" />
              </div>
              
              <div className="tasks-list">
                {selectedCat.tasks.map((task, i) => (
                  <div key={i} className="task-row">
                    <span>{task}</span>
                    <input type="checkbox" className="custom-check" />
                  </div>
                ))}
              </div>

              <div className="card-actions">
                <button onClick={handleAIAnalysis} className="ai-btn">
                  <Brain size={18} /> {loading ? "جاري التحليل..." : "تحليل الذكاء الصناعي"}
                </button>
                <button onClick={handleSave} className="save-btn">
                  <Save size={18} /> حفظ البيانات
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Box (نظام المحادثة) */}
      <div className="floating-chat">
        <div className="chat-header">
          <Sparkles size={18} /> رفيقتكِ الذكية
          <Trash2 size={16} onClick={() => setMessages([])} className="clear-chat" />
        </div>
        <div className="chat-content">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>{m.text}</div>
          ))}
        </div>
        <div className="token-input-container">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="اسألي عن أي حكم..."
          />
          <div className="input-tools">
            <Mic size={18} />
            <Camera size={18} />
            <ImageIcon size={18} />
            <Send size={18} className="send-icon" />
          </div>
        </div>
      </div>

      {/* Azhar Button */}
      <a href="https://www.azhar.eg/fatwa" target="_blank" className="azhar-button">
        اسألي الأزهر الشريف 🕌
      </a>
    </div>
  );
};

export default App;
