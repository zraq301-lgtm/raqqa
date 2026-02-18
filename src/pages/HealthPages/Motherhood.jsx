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

  // تعريف الفئات مع الأيقونات والألوان [cite: 5, 6, 7]
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

  // التعامل مع المدخلات [cite: 9]
  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // إرسال البيانات للتحليل الذكي [cite: 12, 14, 15]
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
      setChatHistory(prev => [newMsg, ...prev]);
      localStorage.setItem('ai_history', JSON.stringify([newMsg, ...chatHistory]));
    } catch (err) { console.error("AI Error", err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans text-right" dir="rtl">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white">رقة الذكية</h1>
          <p className="text-slate-500 mt-1">مساعدكِ التربوي المتكامل</p>
        </div>
        <button onClick={() => setShowChat(true)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <MessageSquare className="text-indigo-600" />
        </button>
      </header>

      <AnimatePresence mode="wait">
        {!activeTab && activeTab !== 0 ? (
          /* شبكة القوائم (الرئيسية) [cite: 19, 20] */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {categories.map((cat, index) => (
              <button key={cat.id} onClick={() => setActiveTab(index)}
                className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] flex flex-col items-center gap-5 shadow-sm border-b-8 transition-all hover:-translate-y-2 active:scale-95"
                style={{ borderBottomColor: cat.color }}
              >
                <div className="p-5 rounded-3xl transition-colors group-hover:scale-110" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                  {React.cloneElement(cat.icon, { size: 32 })}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-lg">{cat.title}</span>
              </button>
            ))}
          </motion.div>
        ) : (
          /* كارت إدخال البيانات (التفصيلي) [cite: 21, 23, 26] */
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 text-white flex justify-between items-center" style={{ backgroundColor: categories[activeTab].color }}>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">{categories[activeTab].icon}</div>
                <h2 className="text-2xl font-bold">{categories[activeTab].title}</h2>
              </div>
              <button onClick={() => setActiveTab(null)} className="bg-black/10 hover:bg-black/20 p-3 rounded-full transition-colors"><X /></button>
            </div>

            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {categories[activeTab].fields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl group border border-transparent focus-within:border-indigo-200 transition-all">
                  <span className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg" 
                        style={{ backgroundColor: `${categories[activeTab].color}15`, color: categories[activeTab].color }}>
                    {idx + 1}
                  </span>
                  <input 
                    type="text" 
                    placeholder={`اكتبي عن ${field}...`}
                    value={inputs[categories[activeTab].id][idx]}
                    onChange={(e) => handleUpdateInput(categories[activeTab].id, idx, e.target.value)}
                    className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t flex gap-4">
              <button onClick={() => runAiAnalysis(activeTab)}
                className="flex-1 py-5 rounded-[2rem] font-black text-white shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                style={{ backgroundColor: categories[activeTab].color }}
              >
                <Sparkles /> {loading ? 'جاري التحليل...' : 'تحليل البيانات'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* شاشة المحادثة (النتائج) - تظهر عند التحليل [cite: 29, 31, 35] */}
      {/* ... (نفس منطق AnimatePresence لشاشة الشات في الكود الأصلي) */}
    </div>
  );
};

export default MotherhoodPage;
