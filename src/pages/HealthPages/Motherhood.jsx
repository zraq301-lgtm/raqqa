import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Send, Trash2, Camera, Mic, Save, ChevronRight, MessageSquare 
} from 'lucide-react';

// استيراد الأيقونات من المسار المحدد
import iconMap from '../constants/iconMap'; 

const MotherhoodPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('ai_history')) || []);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    physical: '', cognitive: '', emotional: '', 
    social: '', values: '', behavior: '', creative: ''
  });

  // القوائم السبعة
  const categories = [
    { id: 'physical', title: 'الاحتياجات الجسدية', icon: <Activity />, color: '#FF6B6B', fields: ['النوم', 'التغذية', 'النشاط البدني', 'الفيتامينات'] },
    { id: 'cognitive', title: 'التطور المعرفي', icon: <Brain />, color: '#4D96FF', fields: ['التركيز', 'حل المشكلات', 'الفضول', 'القراءة'] },
    { id: 'emotional', title: 'الذكاء العاطفي', icon: <Heart />, color: '#FF87B2', fields: ['التعبير عن المشاعر', 'الثقة', 'الأمان', 'المرونة'] },
    { id: 'social', title: 'المهارات الاجتماعية', icon: <Users />, color: '#6BCB77', fields: ['المشاركة', 'الصداقات', 'التعاطف', 'التواصل'] },
    { id: 'values', title: 'القناعات والقيم', icon: <Star />, color: '#FFD93D', fields: ['الصدق', 'المسؤولية', 'الاستحقاق', 'الامتنان'] },
    { id: 'behavior', title: 'السلوك والتهذيب', icon: <Smile />, color: '#92A9BD', fields: ['نوبات الغضب', 'العناد', 'المقارنة', 'الإيجابية'] },
    { id: 'creative', title: 'المواهب والإبداع', icon: <Lightbulb />, color: '#B1AFFF', fields: ['الرسم', 'الابتكار', 'التفكير', 'الفن'] }
  ];

  // وظيفة الحفظ في قاعدة بيانات نيون (Neon DB)
  const saveToNeon = async (data) => {
    try {
      await fetch('https://raqqa-v6cd.vercel.app/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'motherhood_entry' }),
      });
    } catch (err) { console.error("Error saving to DB", err); }
  };

  // وظيفة إرسال البيانات للذكاء الاصطناعي
  const handleAiAnalysis = async (textInput) => {
    setLoading(true);
    setShowChat(true);
    const prompt = `بصفتك خبير تربوي، حلل المدخل التالي للأم عن طفلها وقدم نصيحة مفصلة: ${textInput}`;
    
    try {
      const response = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const result = await response.json();
      const newMsg = { id: Date.now(), query: textInput, reply: result.message };
      const updatedHistory = [newMsg, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('ai_history', JSON.stringify(updatedHistory));
      saveToNeon({ query: textInput, response: result.message });
    } catch (err) { console.error("AI Error", err); }
    setLoading(false);
  };

  const deleteReply = (id) => {
    const filtered = chatHistory.filter(item => item.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('ai_history', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 p-4 font-sans text-right" dir="rtl">
      {/* رأس الصفحة */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">مساعد الرقة التربوي</h1>
        <p className="text-gray-500">متابعة شاملة لنمو طفلك بالذكاء الاصطناعي</p>
      </header>

      {/* شريط التنقل بين القوائم السبعة */}
      <div className="flex overflow-x-auto gap-2 mb-6 no-scrollbar pb-2">
        {categories.map((cat, index) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(index)}
            className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all ${activeTab === index ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 text-gray-600'}`}
          >
            {cat.icon}
            <span className="text-sm font-medium">{cat.title}</span>
          </button>
        ))}
      </div>

      {/* محتوى القائمة النشطة */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border-t-4"
        style={{ borderColor: categories[activeTab].color }}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: categories[activeTab].color }}>
          {categories[activeTab].icon} {categories[activeTab].title}
        </h2>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">سجلي ملاحظاتك حول: {categories[activeTab].fields.join(' - ')}</p>
          <textarea
            value={inputs[categories[activeTab].id]}
            onChange={(e) => setInputs({...inputs, [categories[activeTab].id]: e.target.value})}
            className="w-full h-32 p-4 rounded-2xl border-2 focus:ring-2 bg-indigo-50/30 dark:bg-slate-700 dark:border-slate-600 border-indigo-100 outline-none transition-all placeholder:text-gray-400"
            placeholder="اكتبي ملاحظاتك هنا ليتم تحليلها تربوياً..."
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => handleAiAnalysis(inputs[categories[activeTab].id])}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
              disabled={!inputs[categories[activeTab].id]}
            >
              <Brain size={20} /> تحليل بالذكاء الاصطناعي
            </button>
            <button className="p-4 bg-gray-100 dark:bg-slate-700 rounded-2xl text-gray-600 dark:text-gray-300">
              <Camera size={24} />
            </button>
            <button className="p-4 bg-gray-100 dark:bg-slate-700 rounded-2xl text-gray-600 dark:text-gray-300">
              <Mic size={24} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* نافذة الشات الذكي والردود */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white">
              <button onClick={() => setShowChat(false)}><ChevronRight size={28} /></button>
              <h3 className="font-bold">استشارات الذكاء الاصطناعي</h3>
              <div className="w-8"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {loading && <div className="text-center p-10 animate-pulse text-indigo-500 font-bold italic">جاري التفكير في أفضل نصيحة تربوية لكِ...</div>}
              
              {chatHistory.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tr-none ml-10 text-sm">
                    <strong>مدخلكِ:</strong> {item.query}
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-3xl rounded-tl-none mr-4 border-r-4 border-indigo-500 relative">
                    <p className="text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">{item.reply}</p>
                    <button 
                      onClick={() => deleteReply(item.id)}
                      className="absolute top-2 left-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* زر عائم لفتح الشات في أي وقت */}
      <button 
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
      >
        <MessageSquare />
      </button>
    </div>
  );
};

export default MotherhoodPage;
