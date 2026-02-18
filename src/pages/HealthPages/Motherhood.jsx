import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const MotherhoodPage = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('ai_history')) || []);

  // هيكلة الفئات مع 10 مدخلات تخصصية لكل فئة [cite: 7, 8]
  const categories = [
    { id: 'physical', title: 'الاحتياجات الجسدية', icon: <Activity />, color: '#FF6B6B', fields: ['جودة النوم', 'الشهية', 'النشاط الحركي', 'نمو الوزن', 'نمو الطول', 'المناعة', 'صحة الحواس', 'النظافة', 'شرب الماء', 'التنفس'] },
    { id: 'cognitive', title: 'التطور المعرفي', icon: <Brain />, color: '#4D96FF', fields: ['التركيز', 'حل المشكلات', 'حب الاستطلاع', 'الذاكرة', 'اللغة', 'المنطق', 'الحساب', 'القراءة', 'اللغات', 'الاستنتاج'] },
    { id: 'emotional', title: 'الذكاء العاطفي', icon: <Heart />, color: '#FF87B2', fields: ['التعبير', 'الثقة', 'الفشل', 'المرونة', 'الضبط', 'التعاطف', 'الأمان', 'حب الذات', 'الخوف', 'الاستقرار'] },
    { id: 'social', title: 'المهارات الاجتماعية', icon: <Users />, color: '#6BCB77', fields: ['آداب الحديث', 'المشاركة', 'الصداقات', 'احترام القوانين', 'القيادة', 'النزاعات', 'التعاون', 'الذكاء', 'الخصوصية', 'الحوار'] },
    { id: 'values', title: 'القناعات والقيم', icon: <Star />, color: '#FFD93D', fields: ['الصدق', 'بر الوالدين', 'المسؤولية', 'الامتنان', 'التواضع', 'الرحمة', 'البيئة', 'الوقت', 'الصبر', 'العدل'] },
    { id: 'behavior', title: 'السلوك والتهذيب', icon: <Smile />, color: '#92A9BD', fields: ['إدارة الغضب', 'العناد', 'المواعيد', 'الترتيب', 'الأماكن العامة', 'الاستقلال', 'الاعتذار', 'طلب الإذن', 'الاستماع', 'المبادرة'] },
    { id: 'creative', title: 'المواهب والإبداع', icon: <Lightbulb />, color: '#B1AFFF', fields: ['الخيال', 'الرسم', 'الأشغال اليدوية', 'التمثيل', 'الابتكار', 'الموسيقى', 'التصوير', 'الكتابة', 'البرمجة', 'إعادة التدوير'] }
  ];

  const [inputs, setInputs] = useState(() => {
    const state = {};
    categories.forEach(cat => state[cat.id] = Array(10).fill(''));
    return state;
  });

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // وظيفة الحفظ في نيون (Neon DB) [cite: 9, 29]
  const saveToNeon = async (catTitle, aiReply) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: catTitle, value: 'تحليل ذكي', note: aiReply }
      });
    } catch (err) { console.error("Database Error", err); }
  };

  // تحليل الذكاء الاصطناعي [cite: 12, 13]
  const runAiAnalysis = async (catIdx) => {
    const category = categories[catIdx];
    const dataString = inputs[category.id].map((v, i) => v ? `${category.fields[i]}: ${v}` : '').filter(v => v).join(' | ');
    if (!dataString) return;

    setLoading(true);
    setShowChat(true);

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `تحليل تربوي شامل لفئة (${category.title}): ${dataString}` }
      });

      const reply = response.data.reply || response.data.message;
      const newMsg = { id: Date.now(), query: category.title, reply, time: new Date().toLocaleTimeString('ar-SA') };
      
      const history = [newMsg, ...chatHistory];
      setChatHistory(history);
      localStorage.setItem('ai_history', JSON.stringify(history));
      await saveToNeon(category.title, reply);
    } catch (err) { console.error("AI Error", err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans p-5" dir="rtl">
      
      {/* الهيدر الرئيسي */}
      <header className="flex justify-between items-center mb-8 px-2 mt-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">رقة الذكية</h1>
          <p className="text-slate-400 text-xs">مساعدكِ التربوي المعتمد</p>
        </div>
        <button onClick={() => setShowChat(true)} className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100">
          <MessageSquare className="text-indigo-600" />
        </button>
      </header>

      {/* 1. شبكة القوائم الرئيسية (تختفي عند اختيار قائمة) */}
      <AnimatePresence mode="wait">
        {!activeTab && activeTab !== 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-2 gap-4"
          >
            {categories.map((cat, index) => (
              <button key={cat.id} onClick={() => setActiveTab(index)}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-sm border-b-4 transition-all active:scale-95"
                style={{ borderBottomColor: cat.color }}
              >
                <div className="p-4 rounded-2xl" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                <span className="font-bold text-slate-700 text-sm">{cat.title}</span>
              </button>
            ))}
          </motion.div>
        ) : (
          /* 2. كارت المدخلات الكبير (يظهر وحده) */
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-50"
          >
            <div className="p-6 text-white flex justify-between items-center shadow-lg" style={{ backgroundColor: categories[activeTab].color }}>
              <div className="flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-xl">{categories[activeTab].icon}</span>
                <h2 className="font-bold text-lg">{categories[activeTab].title}</h2>
              </div>
              <button onClick={() => setActiveTab(null)} className="bg-black/10 p-2 rounded-full"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto no-scrollbar">
              {categories[activeTab].fields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                    style={{ backgroundColor: `${categories[activeTab].color}20`, color: categories[activeTab].color }}
                  >
                    {idx + 1}
                  </div>
                  <input 
                    type="text" 
                    placeholder={field}
                    value={inputs[categories[activeTab].id][idx]}
                    onChange={(e) => handleUpdateInput(categories[activeTab].id, idx, e.target.value)}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400 font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 flex gap-3 border-t">
              <button onClick={() => runAiAnalysis(activeTab)}
                className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ backgroundColor: categories[activeTab].color }}
              >
                <Sparkles size={18}/> {loading ? 'جاري التحليل...' : 'تحليل وحفظ'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. شاشة الشات والردود */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed inset-0 z-[100] bg-[#F8FAFC] dark:bg-slate-950 flex flex-col"
          >
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center rounded-b-[2.5rem] shadow-xl">
              <button onClick={() => setShowChat(false)} className="bg-white/20 p-2 rounded-xl"><ChevronRight /></button>
              <div className="text-center">
                <p className="font-bold">مساعد رقة</p>
                <p className="text-[10px] opacity-70">سجل الردود الذكية</p>
              </div>
              <button onClick={() => { if(confirm('حذف السجل؟')) { setChatHistory([]); localStorage.removeItem('ai_history'); }}} 
                className="bg-rose-500/20 p-2 rounded-xl"><Trash2 size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                  <Bookmark size={60} />
                  <p className="font-medium">لا توجد ردود محفوظة بعد</p>
                </div>
              )}
              
              {loading && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-500 font-bold animate-pulse">رقة تحلل بيانات طفلك...</p>
                </div>
              )}

              {chatHistory.map(msg => (
                <div key={msg.id} className="group">
                  <div className="flex justify-end mb-2">
                    <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 uppercase tracking-tighter">
                      فئة: {msg.query}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] rounded-tr-none shadow-sm border border-slate-100 relative transition-all hover:shadow-md">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">{msg.reply}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-[9px] text-slate-400">{msg.time}</span>
                      <div className="flex gap-2">
                        <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-500"><ImageIcon size={14}/></button>
                        <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-500"><Mic size={14}/></button>
                        <button onClick={() => { setChatHistory(prev => prev.filter(m => m.id !== msg.id)) }} 
                          className="p-2 bg-slate-50 rounded-lg text-rose-400"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border-t flex items-center gap-3">
              <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Camera size={20}/></button>
              <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Mic size={20}/></button>
              <div className="flex-1 bg-slate-50 rounded-2xl h-12 flex items-center px-4 text-xs text-slate-400 italic">اكتبي سؤالاً إضافياً هنا...</div>
              <button className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg"><Send size={20}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotherhoodPage;
