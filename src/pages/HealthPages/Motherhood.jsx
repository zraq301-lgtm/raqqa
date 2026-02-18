import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  X, Save, Sparkles, Layout
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const MotherhoodPage = () => {
  const [activeTab, setActiveTab] = useState(null); // null تعني عرض الشبكة الرئيسية
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('ai_history')) || []);
  const [loading, setLoading] = useState(false);
  
  // هيكلية البيانات: 7 فئات، كل فئة تحتوي على 10 حقول تخصصية
  const categories = [
    { id: 'physical', title: 'الاحتياجات الجسدية', icon: <Activity />, color: '#FF6B6B', fields: ['ساعات النوم', 'جودة التغذية', 'النشاط الحركي', 'نمو الطول/الوزن', 'الحواس الخمس', 'النظافة الشخصية', 'المناعة والتشافي', 'التنسيق الحركي', 'شرب الماء', 'الفحوصات الدورية'] },
    { id: 'cognitive', title: 'التطور المعرفي', icon: <Brain />, color: '#4D96FF', fields: ['التركيز والانتباه', 'حل المشكلات', 'حب الاستطلاع', 'الذاكرة والاستيعاب', 'المهارات اللغوية', 'التفكير المنطقي', 'الرياضيات الذهنية', 'القراءة والكتابة', 'تعلم لغات', 'الاستنتاج العلمي'] },
    { id: 'emotional', title: 'الذكاء العاطفي', icon: <Heart />, color: '#FF87B2', fields: ['التعبير عن المشاعر', 'الثقة بالنفس', 'التعامل مع الفشل', 'المرونة النفسية', 'ضبط الانفعالات', 'التعاطف مع الآخرين', 'الشعور بالأمان', 'حب الذات', 'مواجهة المخاوف', 'الاستقرار النفسي'] },
    { id: 'social', title: 'المهارات الاجتماعية', icon: <Users />, color: '#6BCB77', fields: ['آداب الحديث', 'المشاركة والتعاون', 'تكوين الصداقات', 'احترام القوانين', 'القيادة والتبعية', 'حل النزاعات', 'العمل الجماعي', 'الذكاء الاجتماعي', 'احترام الخصوصية', 'مهارات الحوار'] },
    { id: 'values', title: 'القناعات والقيم', icon: <Star />, color: '#FFD93D', fields: ['الصدق والأمانة', 'بر الوالدين', 'المسؤولية الشخصية', 'الامتنان والتقدير', 'التواضع', 'الرحمة بالحيوان', 'الحفاظ على البيئة', 'قيمة الوقت', 'الصبر', 'العدل'] },
    { id: 'behavior', title: 'السلوك والتهذيب', icon: <Smile />, color: '#92A9BD', fields: ['إدارة الغضب', 'العناد الإيجابي', 'الالتزام بالمواعيد', 'ترتيب الغرفة', 'السلوك في الأماكن العامة', 'الاستقلالية', 'الاعتذار عند الخطأ', 'طلب الإذن', 'الاستماع للأوامر', 'المبادرة'] },
    { id: 'creative', title: 'المواهب والإبداع', icon: <Lightbulb />, color: '#B1AFFF', fields: ['الخيال العلمي', 'الرسم والتلوين', 'الأشغال اليدوية', 'التمثيل والإلقاء', 'الابتكار والحلول', 'الموسيقى/الإيقاع', 'التصوير الفوتوغرافي', 'الكتابة الإبداعية', 'البرمجة/الروبوت', 'إعادة التدوير'] }
  ];

  // حالة المدخلات (Object يحمل مصفوفات لكل فئة)
  const [inputs, setInputs] = useState(() => {
    const initialState = {};
    categories.forEach(cat => {
      initialState[cat.id] = Array(10).fill('');
    });
    return initialState;
  });

  // تحديث مدخل محدد داخل فئة
  const handleInputChange = (catId, index, value) => {
    setInputs(prev => ({
      ...prev,
      [catId]: prev[catId].map((val, i) => i === index ? value : val)
    }));
  };

  // 1. حفظ الإشعار في نيون (Neon DB) باستخدام CapacitorHttp
  const saveNotification = async (categoryTitle, advice) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1, // يمكن استبداله بـ ID المستخدم الفعلي
          category: categoryTitle,
          value: 'تحديث تربوي',
          note: advice
        }
      });
    } catch (err) { console.error("Database Sync Error", err); }
  };

  // 2. تحليل الذكاء الاصطناعي
  const handleAiAnalysis = async (categoryIndex) => {
    const category = categories[categoryIndex];
    const filledInputs = inputs[category.id]
      .map((val, i) => val ? `${category.fields[i]}: ${val}` : '')
      .filter(t => t !== '')
      .join(' | ');

    if (!filledInputs) return;

    setLoading(true);
    setShowChat(true);

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `تحليل تربوي شامل لفئة (${category.title}): ${filledInputs}` }
      };

      const response = await CapacitorHttp.post(options);
      const aiReply = response.data.reply || response.data.message;

      const newEntry = { 
        id: Date.now(), 
        query: `تحليل ${category.title}`, 
        reply: aiReply, 
        category: category.id,
        timestamp: new Date().toLocaleTimeString('ar-SA')
      };

      const updated = [newEntry, ...chatHistory];
      setChatHistory(updated);
      localStorage.setItem('ai_history', JSON.stringify(updated));
      
      await saveNotification(category.title, aiReply);

    } catch (err) {
      console.error("AI Error:", err);
    }
    setLoading(false);
  };

  const deleteMessage = (id) => {
    const filtered = chatHistory.filter(m => m.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('ai_history', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 p-4 font-sans" dir="rtl">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            مُفكرة الأمومة <Sparkles className="text-amber-400" />
          </h1>
          <p className="text-slate-500 text-sm">تابعي تطور طفلكِ بلمسة ذكية</p>
        </div>
        <button onClick={() => setShowChat(true)} className="relative p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <MessageSquare className="text-indigo-600" />
          {chatHistory.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{chatHistory.length}</span>}
        </button>
      </header>

      {/* Grid of Cards (Main View) */}
      <AnimatePresence mode="wait">
        {!activeTab && activeTab !== 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="grid grid-cols-2 gap-4"
          >
            {categories.map((cat, index) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(index)}
                className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 shadow-sm border-b-4 transition-transform active:scale-95"
                style={{ borderBottomColor: cat.color }}
              >
                <div className="p-4 rounded-2xl" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                  {cat.icon}
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-center text-sm">{cat.title}</span>
              </button>
            ))}
          </motion.div>
        ) : (
          /* Detailed Entry View */
          <motion.div 
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
          >
            <div className="p-6 text-white flex justify-between items-center" style={{ backgroundColor: categories[activeTab].color }}>
              <div className="flex items-center gap-3">
                {categories[activeTab].icon}
                <h2 className="font-bold text-lg">{categories[activeTab].title}</h2>
              </div>
              <button onClick={() => setActiveTab(null)} className="bg-white/20 p-2 rounded-full"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
              {categories[activeTab].fields.map((field, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 mr-2">{field}</label>
                  <input 
                    type="text"
                    value={inputs[categories[activeTab].id][idx]}
                    onChange={(e) => handleInputChange(categories[activeTab].id, idx, e.target.value)}
                    placeholder="اكتبي ملاحظتك هنا..."
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-offset-2 transition-all outline-none text-sm"
                    style={{ '--tw-ring-color': categories[activeTab].color }}
                  />
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
              <button 
                onClick={() => handleAiAnalysis(activeTab)}
                className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ backgroundColor: categories[activeTab].color }}
              >
                {loading ? 'جاري التحليل...' : <><Sparkles size={18}/> تحليل رقة الذكي</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat System */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col"
          >
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center rounded-b-[2rem] shadow-xl">
              <button onClick={() => setShowChat(false)} className="bg-white/20 p-2 rounded-xl"><ChevronRight /></button>
              <div className="text-center">
                <p className="font-bold">مساعد رقة التربوي</p>
                <p className="text-[10px] opacity-80">تحليل الذكاء الاصطناعي</p>
              </div>
              <button 
                onClick={() => { if(window.confirm('حذف السجل؟')) { setChatHistory([]); localStorage.removeItem('ai_history'); }}}
                className="bg-red-500/20 p-2 rounded-xl text-red-200"
              ><Trash2 size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                   <Layout size={60} className="mb-4" />
                   <p>لا توجد تحليلات سابقة</p>
                </div>
              )}
              
              {loading && (
                <div className="flex flex-col items-center gap-3 p-8">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-600 font-medium animate-pulse">رقة تفكر في طفلك...</p>
                </div>
              )}

              {chatHistory.map(msg => (
                <div key={msg.id} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl rounded-tr-none text-xs font-bold text-slate-500">
                      {msg.query}
                    </div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-[2rem] rounded-tl-none border-r-4 border-indigo-500 relative group">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{msg.reply}</p>
                    <span className="text-[9px] text-slate-400 mt-2 block">{msg.timestamp}</span>
                    <button 
                      onClick={() => deleteMessage(msg.id)} 
                      className="absolute -left-2 -top-2 bg-white dark:bg-slate-700 shadow-md p-1.5 rounded-full text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Actions inside Chat */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 flex items-center gap-3 border-t dark:border-slate-800">
               <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm"><Camera size={20}/></button>
               <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm"><Mic size={20}/></button>
               <div className="flex-1 bg-white dark:bg-slate-800 h-12 rounded-2xl flex items-center px-4 text-slate-400 text-sm italic">
                  رقة جاهزة للمساعدة...
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotherhoodPage;
