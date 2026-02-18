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

  const categories = [
    { id: 'physical', title: 'الجسدية', icon: <Activity />, color: '#FF6B6B', fields: ['جودة النوم', 'الشهية', 'النشاط الحركي', 'نمو الوزن', 'نمو الطول', 'المناعة', 'صحة الحواس', 'النظافة', 'شرب الماء', 'التنفس'] },
    { id: 'cognitive', title: 'المعرفة', icon: <Brain />, color: '#4D96FF', fields: ['التركيز', 'حل المشكلات', 'حب الاستطلاع', 'الذاكرة', 'اللغة', 'المنطق', 'الحساب', 'القراءة', 'اللغات', 'الاستنتاج'] },
    { id: 'emotional', title: 'العاطفة', icon: <Heart />, color: '#FF87B2', fields: ['التعبير', 'الثقة', 'الفشل', 'المرونة', 'الضبط', 'التعاطف', 'الأمان', 'حب الذات', 'الخوف', 'الاستقرار'] },
    { id: 'social', title: 'الاجتماعية', icon: <Users />, color: '#6BCB77', fields: ['آداب الحديث', 'المشاركة', 'الصداقات', 'احترام القوانين', 'القيادة', 'النزاعات', 'التعاون', 'الذكاء', 'الخصوصية', 'الحوار'] },
    { id: 'values', title: 'القيم', icon: <Star />, color: '#FFD93D', fields: ['الصدق', 'بر الوالدين', 'المسؤولية', 'الامتنان', 'التواضع', 'الرحمة', 'البيئة', 'الوقت', 'الصبر', 'العدل'] },
    { id: 'behavior', title: 'السلوك', icon: <Smile />, color: '#92A9BD', fields: ['إدارة الغضب', 'العناد', 'المواعيد', 'الترتيب', 'الأماكن العامة', 'الاستقلال', 'الاعتذار', 'طلب الإذن', 'الاستماع', 'المبادرة'] },
    { id: 'creative', title: 'الإبداع', icon: <Lightbulb />, color: '#B1AFFF', fields: ['الخيال', 'الرسم', 'الأشغال اليدوية', 'التمثيل', 'الابتكار', 'الموسيقى', 'التصوير', 'الكتابة', 'البرمجة', 'إعادة التدوير'] }
  ];

  const [inputs, setInputs] = useState(() => {
    const state = {};
    categories.forEach(cat => { state[cat.id] = Array(10).fill(''); });
    return state;
  });

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // 1. حفظ البيانات في قاعدة بيانات Neon
  const saveToNeonDB = async (category, data) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          title: `تحديث: ${category}`,
          message: JSON.stringify(data),
          type: 'motherhood_update'
        }
      });
    } catch (err) { console.error("DB Save Error:", err); }
  };

  // 2. معالجة الذكاء الاصطناعي (طبيبة رقة للتربية)
  const handleAiAnalysis = async (category) => {
    const dataSummary = inputs[category.id].map((v, i) => v ? `${category.fields[i]}: ${v}` : '').filter(v => v).join(', ');
    if (!dataSummary) return;

    setLoading(true);
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنتِ الآن "طبيبة رقة للتربية"، طبيبة متخصصة في تربية الأطفال وعلم النفس السلوكي. 
          بناءً على البيانات التالية في قسم (${category.title}): ${dataSummary}، 
          قدمي تحليلاً طبياً وتربوياً مفصلاً، متبوعاً بنصائح عملية ومطولة لكل نقطة، بأسلوب حنون ومهني.`
        }
      };

      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;

      const newEntry = {
        id: Date.now(),
        category: category.title,
        query: dataSummary,
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
      alert("حدث خطأ في الاتصال، تأكدي من الإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = (id) => {
    const filtered = chatHistory.filter(item => item.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_chat_history', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans text-right" dir="rtl">
      {/* Header مع زر الطبيبة */}
      <header className="flex justify-between items-center mb-6">
        <button onClick={() => setShowChat(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-indigo-200">
          <Sparkles size={18} />
          <span className="text-sm font-bold">طبيبة رقة للتربية</span>
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-black text-slate-800">رقة الذكية</h1>
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
            <Plus size={20} />
          </div>
        </div>
      </header>

      {/* قوائم عمودية أسفل بعضها */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(cat)}
            className="w-full bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-50 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: cat.color }}>
                {cat.icon}
              </div>
              <div className="text-right">
                <h3 className="font-bold text-slate-800 text-sm">{cat.title}</h3>
                <p className="text-[10px] text-slate-400">10 حقول تطور جاهزة</p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={18} />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {/* كارت إدخال البيانات الأنيق */}
        {activeTab && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-40 bg-white flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-slate-50">
              <button onClick={() => setActiveTab(null)} className="p-2 bg-slate-50 rounded-xl"><X /></button>
              <h2 className="font-black text-slate-800 tracking-tight">{activeTab.title}</h2>
              <div className="w-8"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 pb-24">
              {activeTab.fields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: `${activeTab.color}08` }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: activeTab.color }}>{idx + 1}</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold mb-1 opacity-60" style={{ color: activeTab.color }}>{field}</p>
                    <input 
                      type="text" 
                      value={inputs[activeTab.id][idx]}
                      onChange={(e) => handleUpdateInput(activeTab.id, idx, e.target.value)}
                      placeholder="..." 
                      className="w-full bg-transparent outline-none text-sm font-medium" 
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6">
              <button 
                onClick={() => handleAiAnalysis(activeTab)}
                disabled={loading}
                className="w-full py-5 rounded-3xl text-white font-bold shadow-xl flex items-center justify-center gap-3"
                style={{ backgroundColor: activeTab.color }}
              >
                {loading ? 'جاري الاستشارة...' : <><Sparkles size={20}/> استشارة الطبيبة</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* صفحة شات الردود الذكية */}
        {showChat && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 bg-[#F0F2F5] flex flex-col">
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <button onClick={() => setShowChat(false)} className="p-2 bg-slate-100 rounded-xl"><X/></button>
              <div className="text-center">
                <h2 className="font-black text-slate-800">طبيبة رقة الذكية</h2>
                <div className="flex items-center justify-center gap-1 text-[9px] text-green-500 font-bold uppercase"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>متصلة الآن</div>
              </div>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-40">
                  <MessageSquare size={64} className="mb-4" />
                  <p>لا توجد استشارات محفوظة بعد</p>
                </div>
              )}
              {chatHistory.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className="bg-white p-5 rounded-[2rem] rounded-tr-none shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
                      <span className="text-[10px] font-bold text-indigo-500">قسم {msg.category}</span>
                      <button onClick={() => deleteResponse(msg.id)} className="text-rose-400 p-1 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{msg.reply}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-[9px] text-slate-300 font-mono">{msg.date}</span>
                      <button className="flex items-center gap-1 text-[10px] text-slate-400"><Save size={12}/> حفظ في التقارير</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* أدوات الشات المتطورة */}
            <div className="p-6 bg-white border-t rounded-t-[3rem] shadow-2xl">
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <button className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"><Camera size={20}/></button>
                <button className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"><Mic size={20}/></button>
                <button className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"><ImageIcon size={20}/></button>
                <input type="text" placeholder="اكتبي سؤالاً إضافياً للطبيبة..." className="flex-1 bg-transparent border-none outline-none text-xs font-medium px-2" />
                <button className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><Send size={20}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotherhoodApp;
