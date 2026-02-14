import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare 
} from 'lucide-react';

// تصحيح المسار ليتوافق مع هيكلية المجلدات لديك
import iconMap from '../../constants/iconMap'; 

const MotherhoodPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('ai_history')) || []);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    physical: '', cognitive: '', emotional: '', 
    social: '', values: '', behavior: '', creative: ''
  });

  const categories = [
    { id: 'physical', title: 'الاحتياجات الجسدية', icon: <Activity />, color: '#FF6B6B', fields: ['النوم', 'التغذية', 'النشاط البدني'] },
    { id: 'cognitive', title: 'التطور المعرفي', icon: <Brain />, color: '#4D96FF', fields: ['التركيز', 'حل المشكلات', 'القراءة'] },
    { id: 'emotional', title: 'الذكاء العاطفي', icon: <Heart />, color: '#FF87B2', fields: ['التعبير عن المشاعر', 'الثقة'] },
    { id: 'social', title: 'المهارات الاجتماعية', icon: <Users />, color: '#6BCB77', fields: ['المشاركة', 'الصداقات'] },
    { id: 'values', title: 'القناعات والقيم', icon: <Star />, color: '#FFD93D', fields: ['الصدق', 'المسؤولية', 'الامتنان'] },
    { id: 'behavior', title: 'السلوك والتهذيب', icon: <Smile />, color: '#92A9BD', fields: ['الغضب', 'العناد', 'الإيجابية'] },
    { id: 'creative', title: 'المواهب والإبداع', icon: <Lightbulb />, color: '#B1AFFF', fields: ['الرسم', 'الابتكار'] }
  ];

  // 1. الحفظ في جدول الصحة (Neon DB)
  const saveToNeon = async (data) => {
    try {
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
      });
    } catch (err) { console.error("Neon DB Save Error", err); }
  };

  // 2. تحليل الذكاء الاصطناعي وفتح الشات
  const handleAiAnalysis = async (category) => {
    const text = inputs[category];
    if (!text) return;

    setLoading(true);
    setShowChat(true);
    
    try {
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `تحليل تربوي للقائمة (${category}): ${text}` }),
      });
      const result = await response.json();
      
      const newEntry = { id: Date.now(), query: text, reply: result.message, category };
      const updated = [newEntry, ...chatHistory];
      
      setChatHistory(updated);
      localStorage.setItem('ai_history', JSON.stringify(updated));
      
      // حفظ النسخة في قاعدة البيانات
      await saveToNeon(newEntry);
    } catch (err) { console.error("AI Analysis Error", err); }
    setLoading(false);
  };

  const deleteMessage = (id) => {
    const filtered = chatHistory.filter(m => m.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('ai_history', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 p-4" dir="rtl">
      {/* القوائم السبعة */}
      <div className="flex overflow-x-auto gap-3 mb-6 no-scrollbar py-2">
        {categories.map((cat, index) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(index)}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl flex items-center gap-2 transition-all ${activeTab === index ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-500'}`}
          >
            {cat.icon} <span className="text-sm font-bold">{cat.title}</span>
          </button>
        ))}
      </div>

      {/* منطقة الإدخال الملونة */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl border-b-8"
          style={{ borderBottomColor: categories[activeTab].color }}
        >
          <label className="block mb-4 font-bold text-lg" style={{ color: categories[activeTab].color }}>
            سجلي ملاحظاتك ({categories[activeTab].fields.join('، ')}):
          </label>
          
          <textarea
            value={inputs[categories[activeTab].id]}
            onChange={(e) => setInputs({...inputs, [categories[activeTab].id]: e.target.value})}
            className="w-full h-40 p-4 rounded-2xl border-2 border-dashed bg-slate-50 dark:bg-slate-700 outline-none focus:border-indigo-500 transition-colors"
            style={{ borderColor: `${categories[activeTab].color}44` }}
            placeholder="اكتبي هنا ليحلل الذكاء الاصطناعي سلوك طفلك..."
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleAiAnalysis(categories[activeTab].id)}
              className="flex-1 bg-indigo-600 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Send size={20} /> حفظ وتحليل الذكاء الاصطناعي
            </button>
            <button className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center"><Camera /></button>
            <button className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center"><Mic /></button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* صفحة الردود (Chat) */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <button onClick={() => setShowChat(false)}><ChevronRight size={30} /></button>
              <span className="font-bold">تحليل المساعد الذكي</span>
              <button onClick={() => { localStorage.removeItem('ai_history'); setChatHistory([]); }}><Trash2 size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && <div className="p-6 text-center animate-pulse text-indigo-500">جاري تحليل البيانات تربوياً...</div>}
              {chatHistory.map(msg => (
                <div key={msg.id} className="space-y-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm w-3/4 mr-auto">{msg.query}</div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border-r-4 border-indigo-500 text-sm leading-relaxed relative">
                    {msg.reply}
                    <button onClick={() => deleteMessage(msg.id)} className="absolute top-1 left-1 text-slate-300"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setShowChat(true)} className="fixed bottom-24 left-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50">
        <MessageSquare />
      </button>
    </div>
  );
};

export default MotherhoodPage;
