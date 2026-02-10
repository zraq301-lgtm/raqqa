import React, { useState, useEffect } from 'react';
import { 
  Calendar, Baby, Heart, Activity, Scissors, 
  Stethoscope, ChevronDown, Send, Sparkles, 
  Clock, Moon, Droplets, User, MessageCircle
} from 'lucide-react';

// --- المكونات المساعدة (Sub-Components) ---
const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
      active ? 'bg-white/30 shadow-lg text-pink-700 backdrop-blur-md border border-white/50' : 'text-gray-500 hover:bg-white/10 hover:text-pink-500'
    }`}
  >
    {icon}
    <span className="font-bold text-lg leading-none">{label}</span>
  </button>
);

const AccordionItem = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 rounded-3xl border border-white/40 bg-white/20 backdrop-blur-sm overflow-hidden transition-all shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full p-5 flex justify-between items-center hover:bg-white/30 transition-colors"
      >
        <div className="flex items-center gap-3 text-gray-700">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-6 border-t border-white/30 bg-white/10 animate-fade-in">{children}</div>}
    </div>
  );
};

// --- المكون الرئيسي (Main App) ---
const RaqqaApp = () => {
  const [activeTab, setActiveTab] = useState('menstrual');
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  
  // States للبيانات
  const [formData, setFormData] = useState({
    user_id: 'user_99', // افتراضي
    startDate: '',
    cycleLength: 28,
    symptoms: '',
    mood: '',
    notes: ''
  });

  // 1. منطق الحفظ والتحليل (الربط مع API الخاص بك)
  const handleProcessData = async () => {
    setLoading(true);
    try {
      // أولاً: حفظ البيانات في Neon DB وجلب نصيحة طبية سريعة
      const saveResponse = await fetch('/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: formData.user_id,
          category: activeTab,
          value: formData.cycleLength,
          note: `المزاج: ${formData.mood}, الأعراض: ${formData.symptoms}, ملاحظات إضافية: ${formData.notes}`
        })
      });
      const saveData = await saveResponse.json();

      // ثانياً: جلب تحليل موسع من "رقة AI" (المرتبط بـ Mixedbread و Groq)
      const aiResponse = await fetch('/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `رقيقتي، أريد تحليلاً لبياناتي الحالية في قسم ${activeTab}. دورتي مدتها ${formData.cycleLength} يوماً، وأشعر بـ ${formData.symptoms}. مزاجي حالياً ${formData.mood}. ${formData.notes}`
        })
      });
      const aiData = await aiResponse.json();
      
      setAiAdvice(aiData.reply); // عرض الرد من llama-3.3-70b-versatile
    } catch (error) {
      setAiAdvice("يا رفيقتي، حدث خطأ في الاتصال، لكن بياناتكِ في أمان.");
    } finally {
      setLoading(false);
    }
  };

  // 2. حاسبة التبويض
  const getNextPeriod = () => {
    if (!formData.startDate) return "---";
    const date = new Date(formData.startDate);
    date.setDate(date.getDate() + parseInt(formData.cycleLength));
    return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-100 via-white to-blue-50 text-right p-4 md:p-8" dir="rtl">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/60 shadow-2xl mb-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-3xl shadow-inner flex items-center justify-center text-white mb-4">
              <Sparkles size={40} />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-l from-pink-600 to-purple-700 bg-clip-text text-transparent">رقة</h1>
            <p className="text-gray-400 text-sm font-medium mt-1 italic">صحتكِ برقة وذكاء</p>
          </div>

          <nav className="bg-white/20 backdrop-blur-md p-4 rounded-[35px] border border-white/40 shadow-xl space-y-2">
            <NavItem active={activeTab === 'menstrual'} onClick={() => setActiveTab('menstrual')} icon={<Calendar />} label="متابعة الحيض" />
            <NavItem active={activeTab === 'pregnancy'} onClick={() => setActiveTab('pregnancy')} icon={<Baby />} label="متابعة الحمل" />
            <NavItem active={activeTab === 'lactation'} onClick={() => setActiveTab('lactation')} icon={<Heart />} label="نظام الرضاعة" />
            <NavItem active={activeTab === 'doctor'} onClick={() => setActiveTab('doctor')} icon={<Stethoscope />} label="متابعة الطبيب" />
            <NavItem active={activeTab === 'fitness'} onClick={() => setActiveTab('fitness')} icon={<Activity />} label="الرشاقة" />
            <NavItem active={activeTab === 'beauty'} onClick={() => setActiveTab('beauty')} icon={<Scissors />} label="الأناقة والجمال" />
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-6 space-y-6">
          <header className="bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/60 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">أهلاً بكِ في عالمكِ الخاص 🌸</h2>
            <p className="text-gray-500 mt-2 font-medium">سجلي بياناتكِ الآن لتحصلي على نصائح "رقة" الذكية.</p>
          </header>

          <section className="bg-white/60 backdrop-blur-2xl p-8 rounded-[40px] border border-white/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-pink-400/50"></div>
            
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-pink-100 rounded-2xl text-pink-600"><Calendar size={28}/></div>
               <h3 className="text-2xl font-bold text-gray-800">متابعة الحيض</h3>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-600 mr-2">تاريخ بداية الدورة</label>
                 <input type="date" className="w-full p-4 rounded-2xl bg-white/50 border border-pink-100 outline-none focus:ring-2 ring-pink-300" 
                 onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-600 mr-2">متوسط مدة الدورة</label>
                 <input type="number" placeholder="28 يوم" className="w-full p-4 rounded-2xl bg-white/50 border border-pink-100 outline-none focus:ring-2 ring-pink-300"
                 onChange={(e) => setFormData({...formData, cycleLength: e.target.value})} />
               </div>
            </div>

            <AccordionItem title="الأعراض الجسدية" icon={<Activity size={20} className="text-blue-400"/>}>
               <div className="grid grid-cols-2 gap-2">
                 {['تشنجات 😖', 'انتفاخ 🎈', 'صداع 🤕', 'ألم ظهر 😫'].map(s => (
                   <button key={s} onClick={() => setFormData({...formData, symptoms: s})}
                   className="p-3 bg-white/50 rounded-xl hover:bg-pink-100 transition-colors text-right">{s}</button>
                 ))}
               </div>
            </AccordionItem>

            <AccordionItem title="الحالة المزاجية" icon={<Moon size={20} className="text-purple-400"/>}>
               <div className="grid grid-cols-2 gap-2">
                 {['قلق 😰', 'عصبية 💢', 'هدوء 🧘‍♀️', 'بكاء 😢'].map(m => (
                   <button key={m} onClick={() => setFormData({...formData, mood: m})}
                   className="p-3 bg-white/50 rounded-xl hover:bg-purple-100 transition-colors text-right">{m}</button>
                 ))}
               </div>
            </AccordionItem>

            <textarea 
              className="w-full mt-4 p-5 rounded-[25px] bg-white/40 border border-white/80 outline-none focus:bg-white/60 transition-all shadow-inner"
              placeholder="هل هناك ملاحظات أخرى تريدين إخبار رقة بها؟..."
              rows="4"
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>

            <button 
              onClick={handleProcessData}
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white py-5 rounded-[25px] font-bold text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Send size={24}/> تحليل البيانات ومشاركتها مع رقة</>}
            </button>
          </section>
        </main>

        {/* AI Insight Panel */}
        <aside className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-3xl p-8 rounded-[40px] border border-pink-200 shadow-2xl sticky top-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center gap-3 text-pink-600 mb-6 border-b border-pink-100 pb-4">
              <Sparkles size={28} className="animate-pulse" />
              <h3 className="text-xl font-black italic">طبيبتكِ رقة تنصحكِ</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              {aiAdvice ? (
                <div className="bg-gradient-to-b from-pink-50 to-white p-6 rounded-[30px] border border-pink-100 text-gray-800 leading-relaxed text-lg animate-fade-in shadow-sm">
                  {aiAdvice}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <MessageCircle size={60} className="mx-auto opacity-10 mb-4" />
                  <p className="italic underline decoration-pink-100 underline-offset-8">انتظر بياناتكِ الرقيقة لأحللها لكِ بدقة...</p>
                </div>
              )}

              {formData.startDate && (
                <div className="bg-gradient-to-br from-purple-700 to-pink-500 p-6 rounded-[30px] text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform">
                    <Calendar size={100} />
                  </div>
                  <div className="flex items-center gap-2 mb-2 opacity-80 font-bold">
                    <Clock size={18}/> موعدكِ القادم
                  </div>
                  <div className="text-3xl font-black">{getNextPeriod()}</div>
                  <p className="text-sm mt-3 bg-white/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">كوني مستعدة يا رفيقتي ✨</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-pink-100 flex items-center gap-4 text-pink-700 font-bold">
              <User size={24} className="bg-pink-100 p-1 rounded-full" />
              <span>الملف الشخصي: رقيقة 99</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default RaqqaApp;
