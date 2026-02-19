import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Settings, Bell, Search, Plus, Image as ImageIcon, Save
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const MotherhoodApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('raqqa_chat_history');
    return saved ? JSON.parse(saved) : [];
  });

  // هيكلة الفئات بـ 10 مدخلات لكل قسم
  const categories = [
    { id: 'physical', title: 'الجسدية', icon: <Activity size={24}/>, color: '#FF6B6B', fields: ['جودة النوم', 'الشهية', 'النشاط الحركي', 'نمو الوزن', 'نمو الطول', 'المناعة', 'صحة الحواس', 'النظافة', 'شرب الماء', 'التنفس'] },
    { id: 'cognitive', title: 'المعرفة', icon: <Brain size={24}/>, color: '#4D96FF', fields: ['التركيز', 'حل المشكلات', 'حب الاستطلاع', 'الذاكرة', 'اللغة', 'المنطق', 'الحساب', 'القراءة', 'اللغات', 'الاستنتاج'] },
    { id: 'emotional', title: 'العاطفة', icon: <Heart size={24}/>, color: '#FF87B2', fields: ['التعبير', 'الثقة', 'الفشل', 'المرونة', 'الضبط', 'التعاطف', 'الأمان', 'حب الذات', 'الخوف', 'الاستقرار'] },
    { id: 'social', title: 'الاجتماعية', icon: <Users size={24}/>, color: '#6BCB77', fields: ['آداب الحديث', 'المشاركة', 'الصداقات', 'احترام القوانين', 'القيادة', 'النزاعات', 'التعاون', 'الذكاء', 'الخصوصية', 'الحوار'] },
    { id: 'values', title: 'القيم', icon: <Star size={24}/>, color: '#FFD93D', fields: ['الصدق', 'بر الوالدين', 'المسؤولية', 'الامتنان', 'التواضع', 'الرحمة', 'البيئة', 'الوقت', 'الصبر', 'العدل'] },
    { id: 'behavior', title: 'السلوك', icon: <Smile size={24}/>, color: '#92A9BD', fields: ['إدارة الغضب', 'العناد', 'المواعيد', 'الترتيب', 'الأماكن العامة', 'الاستقلال', 'الاعتذار', 'طلب الإذن', 'الاستماع', 'المبادرة'] },
    { id: 'creative', title: 'الإبداع', icon: <Lightbulb size={24}/>, color: '#B1AFFF', fields: ['الخيال', 'الرسم', 'الأشغال اليدوية', 'التمثيل', 'الابتكار', 'الموسيقى', 'التصوير', 'الكتابة', 'البرمجة', 'إعادة التدوير'] }
  ];

  const [inputs, setInputs] = useState(() => {
    const state = {};
    categories.forEach(cat => { state[cat.id] = Array(10).fill(''); });
    return state;
  });

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // وظيفة حفظ البيانات في Neon DB
  const saveToNeonDB = async (category, data) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          title: `تحديث قسم ${category}`,
          message: `تم إدخال بيانات جديدة في ${category}`,
          type: 'motherhood_update'
        }
      });
    } catch (err) { console.error("Neon DB Error:", err); }
  };

  // وظيفة الذكاء الاصطناعي (طبيبة رقة)
  const handleAiAnalysis = async (category) => {
    const dataSummary = inputs[category.id].map((v, i) => v ? `${category.fields[i]}: ${v}` : '').filter(v => v).join(', ');
    if (!dataSummary) return alert("الرجاء إدخال بعض البيانات للتحليل");

    setLoading(true);
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنتِ طبيبة رقة للتربية، متخصصة في طب أطفال وتربية. قدمي تحليلاً مطولاً ونصائح طبية لهذه البيانات في قسم ${category.title}: ${dataSummary}`
        }
      };

      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;

      const newEntry = {
        id: Date.now(),
        category: category.title,
        reply: responseText,
        date: new Date().toLocaleString('ar-EG')
      };

      const updatedHistory = [newEntry, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('raqqa_chat_history', JSON.stringify(updatedHistory));
      
      await saveToNeonDB(category.title, inputs[category.id]);
      setShowChat(true);
      setActiveTab(null);
    } catch (err) {
      console.error("AI Error:", err);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans text-right" dir="rtl">
      {/* Header مع زر طبيبة رقة */}
      <header className="flex justify-between items-center mb-6">
        <button onClick={() => setShowChat(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-100 transition-transform active:scale-95">
          <Sparkles size={18} />
          <span className="text-sm font-bold">طبيبة رقة للتربية</span>
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">رقة الذكية</h1>
        </div>
      </header>

      {/* عرض القوائم عمودياً أسفل بعضها */}
      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat)}
            className="w-full bg-white p-4 rounded-[1.8rem] shadow-sm border border-slate-50 flex items-center justify-between transition-all active:bg-slate-50 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                {cat.icon}
              </div>
              <div className="text-right">
                <h3 className="font-black text-slate-800 text-sm">{cat.title}</h3>
                <p className="text-[10px] text-slate-400 font-medium">10 نقاط تطور متوفرة</p>
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-full group-hover:bg-indigo-50 transition-colors">
              <ChevronRight className="text-slate-300 group-hover:text-indigo-600" size={20} />
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {/* كارت إدخال البيانات الحديث */}
        {activeTab && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-40 bg-white flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-slate-50">
              <button onClick={() => setActiveTab(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-500"><X /></button>
              <h2 className="font-black text-lg text-slate-800">{activeTab.title}</h2>
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                {activeTab.icon}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
              {activeTab.fields.map((field, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-4 rounded-[1.5rem] border border-slate-100" style={{ backgroundColor: `${activeTab.color}05` }}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: activeTab.color }}>{idx + 1}</span>
                    <label className="text-xs font-bold" style={{ color: activeTab.color }}>{field}</label>
                  </div>
                  <input 
                    type="text" 
                    value={inputs[activeTab.id][idx]}
                    onChange={(e) => handleUpdateInput(activeTab.id, idx, e.target.value)}
                    placeholder="اكتبي الملاحظات هنا..." 
                    className="w-full bg-transparent outline-none text-sm font-medium py-1 placeholder:text-slate-300" 
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md">
              <button 
                onClick={() => handleAiAnalysis(activeTab)}
                disabled={loading}
                className="w-full py-5 rounded-[2rem] text-white font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                style={{ backgroundColor: activeTab.color, boxShadow: `0 15px 30px ${activeTab.color}40` }}
              >
                {loading ? 'جاري الاستشارة...' : <><Sparkles size={22}/> استشارة طبيبة رقة</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* شاشة شات الطبيبة المتخصصة */}
        {showChat && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 bg-[#F4F7F9] flex flex-col">
            <div className="p-6 bg-white border-b flex justify-between items-center shadow-sm">
              <button onClick={() => setShowChat(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-500"><X/></button>
              <div className="flex flex-col items-center">
                <h2 className="font-black text-slate-800 text-lg">طبيبة رقة للتربية</h2>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">● استشارية متصلة</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><MessageSquare size={20}/></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
              {chatHistory.map((msg) => (
                <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white p-6 rounded-[2.2rem] rounded-tr-none shadow-sm border border-slate-100 relative">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">{msg.category[0]}</div>
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">قسم {msg.category}</span>
                      </div>
                      <button onClick={() => {
                        const filtered = chatHistory.filter(m => m.id !== msg.id);
                        setChatHistory(filtered);
                        localStorage.setItem('raqqa_chat_history', JSON.stringify(filtered));
                      }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl"><Trash2 size={16}/></button>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">{msg.reply}</p>
                    <div className="mt-5 flex justify-between items-center">
                       <span className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">{msg.date}</span>
                       <button className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full"><Save size={12}/> حفظ الاستشارة</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* صندوق أدوات الشات (كاميرا، ميكروفون، رفع صور) */}
            <div className="p-6 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[1.8rem] border border-slate-100">
                <button className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600"><Camera size={20}/></button>
                <button className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600"><Mic size={20}/></button>
                <button className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600"><ImageIcon size={20}/></button>
                <input type="text" placeholder="اكتبي سؤالاً إضافياً للطبيبة..." className="flex-1 bg-transparent border-none outline-none text-xs font-bold px-2 text-slate-600" />
                <button className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200"><Send size={20}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotherhoodApp;
