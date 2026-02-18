import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Image as ImageIcon, Plus, Stethoscope
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const PregnancyTrackerPage = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('pregnancy_ai_history')) || []);

  // هيكلة الفئات بناءً على الصورة المرفوعة
  const categories = [
    { id: 'fetal_growth', title: 'نمو الجنين', icon: <Activity />, color: '#7C3AED', fields: ['حركة الجنين', 'نبض القلب', 'الوزن التقديري', 'وضعية الجنين', 'كمية السائل الأمينوسي'] },
    { id: 'mother_health', title: 'صحة الأم', icon: <Stethoscope />, color: '#7C3AED', fields: ['ضغط الدم', 'مستوى السكر', 'الوزن الحالي', 'الأعراض (غثيان/تعب)', 'الحالة النفسية'] },
    { id: 'exams', title: 'الفحوصات', icon: <ClipboardList />, color: '#7C3AED', fields: ['تحليل الدم الكامل', 'فحص السكر التراكمي', 'السونار الأخير', 'تحليل البول', 'فحوصات وراثية'] },
    { id: 'supplements', title: 'سجل المكملات', icon: <Pill />, color: '#7C3AED', fields: ['حمض الفوليك', 'الحديد', 'الكالسيوم', 'فيتامين د', 'أوميغا 3'] },
    { id: 'birth_prep', title: 'الاستعداد للولادة', icon: <ShoppingBag />, color: '#7C3AED', fields: ['حقيبة المستشفى', 'خطة الولادة', 'تمارين التنفس', 'تجهيزات المولود', 'اختيار المستشفى'] },
    { id: 'weekly_dev', title: 'تطور الأسابيع', icon: <Calendar />, color: '#7C3AED', fields: ['رقم الأسبوع الحالي', 'أعراض الأسبوع', 'ملاحظات الطبيب', 'الأسئلة القادمة', 'تاريخ المراجعة'] },
  ];

  const [inputs, setInputs] = useState(() => {
    const state = {};
    categories.forEach(cat => state[cat.id] = Array(cat.fields.length).fill(''));
    return state;
  });

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // وظيفة الحفظ في نيون (Neon DB)
  const saveToNeon = async (catTitle, aiReply) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: catTitle, value: 'تحليل طبي شامل', note: aiReply }
      });
    } catch (err) { console.error("Database Error", err); }
  };

  // تحليل الذكاء الاصطناعي بأسلوب طبيبة نساء وتوليد
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
        data: { 
          prompt: `بصفتك طبيبة نساء وتوليد متخصصة ورقيقة، حللي هذه البيانات الخاصة بـ (${category.title}): ${dataString}. 
          قدمي نصائح طبية موسعة، شرح للحالة، وتوجيهات للولادة والحمل بأسلوب دافئ ومطمئن.` 
        }
      });

      const reply = response.data.reply || response.data.message;
      const newMsg = { id: Date.now(), query: category.title, reply, time: new Date().toLocaleTimeString('ar-SA') };
      
      const history = [newMsg, ...chatHistory];
      setChatHistory(history);
      localStorage.setItem('pregnancy_ai_history', JSON.stringify(history));
      await saveToNeon(category.title, reply);
    } catch (err) { 
      console.error("AI Error", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF2F8] dark:bg-slate-950 font-sans p-6" dir="rtl">
      
      {/* الهيدر الرئيسي كما في الصورة */}
      <header className="flex justify-between items-start mb-8 mt-4">
        <button className="bg-[#7C3AED] text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-transform"
                onClick={() => setShowChat(true)}>
          تحليل الطبيب <br/> AI
        </button>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
             <h1 className="text-2xl font-bold text-[#5B21B6]">متابعة الحمل</h1>
             <div className="text-[#7C3AED]"><Plus size={24}/></div>
          </div>
          <h2 className="text-2xl font-bold text-[#5B21B6] mt-[-5px]">الذكية</h2>
        </div>
      </header>

      {/* قائمة الخيارات (Accordion style) */}
      <div className="space-y-4">
        {categories.map((cat, index) => (
          <div key={cat.id} className="bg-white/80 dark:bg-slate-900 rounded-[2rem] shadow-sm border border-white/20">
            <button 
              onClick={() => setActiveTab(activeTab === index ? null : index)}
              className="w-full flex justify-between items-center p-5 px-6"
            >
              <div className="text-[#7C3AED] transform transition-transform" style={{transform: activeTab === index ? 'rotate(180deg)' : 'rotate(0)'}}>
                ▼
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#5B21B6] font-bold text-lg">{cat.title}</span>
                <span className="text-2xl">{cat.icon}</span>
              </div>
            </button>

            <AnimatePresence>
              {activeTab === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 space-y-3">
                    {cat.fields.map((field, idx) => (
                      <input 
                        key={idx}
                        type="text"
                        placeholder={field}
                        value={inputs[cat.id][idx]}
                        onChange={(e) => handleUpdateInput(cat.id, idx, e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-100 p-3 rounded-xl text-sm outline-none focus:border-purple-300"
                      />
                    ))}
                    <button 
                      onClick={() => runAiAnalysis(index)}
                      className="w-full bg-[#7C3AED] text-white py-3 rounded-xl font-bold mt-2 shadow-md flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16}/> {loading ? 'جاري التحليل الطبي...' : 'تحليل وحفظ البيانات'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* زر العودة السفلي */}
      <div className="mt-8">
        <button className="bg-[#B91C1C] text-white px-8 py-3 rounded-full font-bold shadow-lg">
          عودة
        </button>
      </div>

      {/* شاشة الشات والردود الطبية */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col"
          >
            <div className="p-6 bg-[#7C3AED] text-white flex justify-between items-center">
              <button onClick={() => setShowChat(false)} className="bg-white/20 p-2 rounded-xl"><ChevronRight /></button>
              <div className="text-center">
                <p className="font-bold">طبيبة رقة الذكية</p>
                <p className="text-[10px] opacity-70">استشارات الحمل والولادة</p>
              </div>
              <button onClick={() => { if(confirm('حذف السجل؟')) { setChatHistory([]); localStorage.removeItem('pregnancy_ai_history'); }}} 
                className="bg-rose-500/20 p-2 rounded-xl"><Trash2 size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <Stethoscope size={60} className="opacity-20" />
                  <p className="font-medium text-slate-400">لا توجد استشارات محفوظة بعد</p>
                </div>
              )}
              
              {loading && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-purple-500 font-bold animate-pulse">الطبيبة تحلل بياناتك...</p>
                </div>
              )}

              {chatHistory.map(msg => (
                <div key={msg.id} className="group">
                  <div className="flex justify-end mb-2">
                    <span className="bg-purple-50 text-[#7C3AED] px-3 py-1 rounded-lg text-[10px] font-bold border border-purple-100">
                      قسم: {msg.query}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-[2rem] rounded-tr-none border border-slate-100 relative">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.reply}</p>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-200/50">
                      <span className="text-[9px] text-slate-400">{msg.time}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setChatHistory(prev => prev.filter(m => m.id !== msg.id))} 
                                className="p-2 bg-white rounded-lg text-rose-400 shadow-sm"><Trash2 size={14}/></button>
                        <button className="p-2 bg-white rounded-lg text-purple-400 shadow-sm"><Bookmark size={14}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* أزرار التحكم في الشات (كاميرا، ميكروفون، إرفاق) */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t flex items-center gap-3">
              <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-purple-50 transition-colors"
                      onClick={() => alert('فتح الكاميرا لتصوير الأشعة...')}><Camera size={20}/></button>
              <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-purple-50 transition-colors"
                      onClick={() => alert('بدأ تسجيل الملاحظات الصوتية...')}><Mic size={20}/></button>
              <div className="flex-1 relative">
                <input type="text" placeholder="اكتبي سؤالاً إضافياً هنا..." 
                       className="w-full bg-slate-50 rounded-2xl h-12 px-4 text-xs outline-none focus:ring-1 ring-purple-200" />
              </div>
              <button className="w-12 h-12 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                <Send size={20}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyTrackerPage;
