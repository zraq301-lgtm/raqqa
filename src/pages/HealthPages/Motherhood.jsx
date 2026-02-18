import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Plus, X, Sparkles, Bell
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const MotherhoodPage = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('ai_history')) || []);

  const categories = [
    { id: 'physical', title: 'الاحتياجات الجسدية', icon: <Activity />, color: '#FF9E9E', fields: ['ساعات النوم', 'التغذية', 'النشاط', 'الطول', 'الوزن', 'الحواس', 'النظافة', 'المناعة', 'الماء', 'الفحوصات'] },
    { id: 'cognitive', title: 'التطور المعرفي', icon: <Brain />, color: '#91C8FF', fields: ['التركيز', 'المشكلات', 'الاستطلاع', 'الذاكرة', 'اللغة', 'المنطق', 'الحساب', 'القراءة', 'اللغات', 'الاستنتاج'] },
    { id: 'emotional', title: 'الذكاء العاطفي', icon: <Heart />, color: '#FFB1CF', fields: ['التعبير', 'الثقة', 'الفشل', 'المرونة', 'الضبط', 'التعاطف', 'الأمان', 'الذات', 'الخوف', 'الاستقرار'] },
    { id: 'social', title: 'المهارات الاجتماعية', icon: <Users />, color: '#A5E1AD', fields: ['الحديث', 'المشاركة', 'الأصدقاء', 'القوانين', 'القيادة', 'النزاعات', 'التعاون', 'الذكاء', 'الخصوصية', 'الحوار'] },
    { id: 'values', title: 'القناعات والقيم', icon: <Star />, color: '#FFE59E', fields: ['الصدق', 'الوالدين', 'المسؤولية', 'الامتنان', 'التواضع', 'الرحمة', 'البيئة', 'الوقت', 'الصبر', 'العدل'] },
    { id: 'behavior', title: 'السلوك والتهذيب', icon: <Smile />, color: '#B8C6D9', fields: ['الغضب', 'العناد', 'المواعيد', 'الترتيب', 'الأماكن العامة', 'الاستقلال', 'الاعتذار', 'الإذن', 'الاستماع', 'المبادرة'] },
    { id: 'creative', title: 'المواهب والإبداع', icon: <Lightbulb />, color: '#C9C7FF', fields: ['الخيال', 'الرسم', 'اليدوي', 'الإلقاء', 'الابتكار', 'الموسيقى', 'التصوير', 'الكتابة', 'البرمجة', 'التدوير'] }
  ];

  const [inputs, setInputs] = useState(() => {
    const initialState = {};
    categories.forEach(cat => initialState[cat.id] = Array(10).fill(''));
    return initialState;
  });

  const handleInputChange = (catId, index, value) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === index ? value : v) }));
  };

  // وظيفة الحفظ في نيون (Neon DB) 
  const saveToNeon = async (categoryTitle, advice) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: categoryTitle,
          value: 'تحديث تربوي جديد',
          note: advice
        }
      });
    } catch (err) { console.error("Neon DB Error", err); }
  };

  // وظيفة تحليل الذكاء الاصطناعي 
  const handleAiAnalysis = async (catIndex) => {
    const category = categories[catIndex];
    const summary = inputs[category.id].filter(v => v).join('، ');
    if (!summary) return;

    setLoading(true);
    setShowChat(true);

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، طفلي لديه هذه الملاحظات في (${category.title}): ${summary}. حللي حالته وقدمي نصيحة رقيقة.` }
      });

      const aiReply = response.data.reply || response.data.message;
      const newEntry = { id: Date.now(), query: category.title, reply: aiReply, time: new Date().toLocaleTimeString('ar-SA') };
      
      const updated = [newEntry, ...chatHistory];
      setChatHistory(updated);
      localStorage.setItem('ai_history', JSON.stringify(updated));
      await saveToNeon(category.title, aiReply); // حفظ في نيون 
    } catch (err) { console.error("AI Error", err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 p-6 font-sans text-slate-800" dir="rtl">
      
      {/* Header المستلهم من dribbble */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">مفكرة رقة</h1>
          <p className="text-slate-400 text-sm mt-1">رحلتكِ في رعاية طفلكِ بكل حب</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowChat(true)} className="p-3 bg-white shadow-soft rounded-full border border-slate-50">
            <Bell size={22} className="text-indigo-500" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-rose-400 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </header>

      {/* عرض الشبكة (Grid) */}
      {!activeTab && activeTab !== 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-5">
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(index)}
              className="group bg-white dark:bg-slate-900 p-5 rounded-[2rem] flex items-center justify-between shadow-soft border border-transparent hover:border-indigo-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl shadow-inner" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="text-right">
                  <span className="font-bold block">{cat.title}</span>
                  <span className="text-[10px] text-slate-400">10 حقول تخصصية</span>
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:text-indigo-400 transition-colors">
                <ChevronRight size={18} />
              </div>
            </button>
          ))}
        </motion.div>
      ) : (
        /* واجهة الإدخال المتخصصة */
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-0 z-50 bg-[#FDFCFB] dark:bg-slate-950 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setActiveTab(null)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
            <span className="font-bold text-lg" style={{ color: categories[activeTab].color }}>{categories[activeTab].title}</span>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-10">
            {categories[activeTab].fields.map((field, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-400 block mb-2">{field}</label>
                <input 
                  type="text"
                  value={inputs[categories[activeTab].id][idx]}
                  onChange={(e) => handleInputChange(categories[activeTab].id, idx, e.target.value)}
                  placeholder="سجلي ملاحظتك هنا..."
                  className="w-full bg-transparent outline-none text-sm placeholder:text-slate-300"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={() => handleAiAnalysis(activeTab)}
            className="w-full py-5 rounded-[2rem] text-white font-bold shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: categories[activeTab].color }}
          >
            {loading ? 'رقة تحلل...' : <><Sparkles size={20}/> استشارة رقة الذكية</>}
          </button>
        </motion.div>
      )}

      {/* شات الردود المنسق */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[60] bg-white flex flex-col">
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <button onClick={() => setShowChat(false)} className="text-slate-400"><X /></button>
              <span className="font-extrabold text-indigo-600">سجل التحليلات</span>
              <button onClick={() => setChatHistory([])} className="text-rose-300"><Trash2 size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCFB]">
              {chatHistory.map(msg => (
                <div key={msg.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{msg.query}</span>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] rounded-tr-none shadow-soft border border-indigo-50/50 relative">
                    <p className="text-sm leading-relaxed text-slate-600 italic">" {msg.reply} "</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-[9px] text-slate-300">{msg.time}</span>
                      <div className="flex gap-2">
                        <button className="text-slate-300"><Camera size={14}/></button>
                        <button className="text-slate-300"><Mic size={14}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button onClick={() => setShowChat(true)} className="fixed bottom-10 left-6 w-16 h-16 bg-indigo-500 text-white rounded-full shadow-button flex items-center justify-center z-40 transition-transform active:scale-90">
        <MessageSquare />
      </button>

      <style jsx>{`
        .shadow-soft { box-shadow: 0 10px 30px -5px rgba(0,0,0,0.03); }
        .shadow-button { box-shadow: 0 15px 35px -5px rgba(79, 70, 229, 0.4); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MotherhoodPage;
