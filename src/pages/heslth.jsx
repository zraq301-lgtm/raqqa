import React, { useState, useEffect } from 'react';
import { Layout, Calendar, Baby, Heart, Activity, Scissors, Stethoscope, ChevronDown, Send, Sparkles } from 'lucide-react';

const RaqqaDashboard = () => {
  const [activeTab, setActiveTab] = useState('menstrual');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  // State لبيانات الدورة الشهرية
  const [menstrualData, setMenstrualData] = useState({
    startDate: '',
    cycleLength: 28,
    symptoms: '',
    mood: ''
  });

  // دالة الحفظ في قاعدة البيانات (Neon) وجلب نصيحة AI
  const handleSaveData = async (category, value, note) => {
    setLoading(true);
    try {
      const response = await fetch('/api/save-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_123', // معرف افتراضي
          category: category,
          value: value,
          note: note
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiResponse(data.advice); // استلام نصيحة الطبيبة "رقة"
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setLoading(false);
    }
  };

  // حاسبة الدورة والتبويض
  const calculateCycle = () => {
    if (!menstrualData.startDate) return "يرجى تحديد تاريخ البدء";
    const nextDate = new Date(menstrualData.startDate);
    nextDate.setDate(nextDate.getDate() + parseInt(menstrualData.cycleLength));
    return nextDate.toLocaleDateString('ar-EG');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 text-right font-sans" dir="rtl">
      
      {/* Sidebar - Glassmorphism */}
      <nav className="fixed right-0 top-0 h-full w-64 bg-white/30 backdrop-blur-xl border-l border-white/20 p-6 flex flex-col shadow-2xl z-50">
        <h1 className="text-3xl font-bold bg-gradient-to-l from-pink-600 to-purple-600 bg-clip-text text-transparent mb-10 text-center">رقة ✨</h1>
        
        <div className="space-y-4">
          <NavItem active={activeTab === 'menstrual'} onClick={() => setActiveTab('menstrual')} icon={<Calendar size={20}/>} label="متابعة الحيض" />
          <NavItem active={activeTab === 'pregnancy'} onClick={() => setActiveTab('pregnancy')} icon={<Baby size={20}/>} label="متابعة الحمل" />
          <NavItem active={activeTab === 'lactation'} onClick={() => setActiveTab('lactation')} icon={<Heart size={20}/>} label="نظام الرضاعة" />
          <NavItem active={activeTab === 'doctor'} onClick={() => setActiveTab('doctor')} icon={<Stethoscope size={20}/>} label="متابعة الطبيب" />
          <NavItem active={activeTab === 'fitness'} onClick={() => setActiveTab('fitness')} icon={<Activity size={20}/>} label="الرشاقة" />
          <NavItem active={activeTab === 'beauty'} onClick={() => setActiveTab('beauty')} icon={<Scissors size={20}/>} label="الأناقة والجمال" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="mr-64 p-8">
        
        {/* Header Section */}
        <header className="mb-8 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm">
          <h2 className="text-2xl font-semibold text-purple-800">مرحباً بكِ، رقيقتنا 🌸</h2>
          <p className="text-gray-600 mt-2">نحن هنا لنهتم بكِ في كل مراحل حياتك.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Dynamic Component Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'menstrual' && (
              <section className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/40">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="text-pink-500" /> سجل الدورة الشهرية
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex flex-col">
                    <label className="mb-2 text-sm text-gray-700">تاريخ آخر دورة</label>
                    <input 
                      type="date" 
                      className="p-3 rounded-xl bg-white/50 border border-purple-200 focus:ring-2 ring-pink-300 outline-none"
                      onChange={(e) => setMenstrualData({...menstrualData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 text-sm text-gray-700">مدة الدورة (يوم)</label>
                    <input 
                      type="number" 
                      placeholder="مثلاً 28"
                      className="p-3 rounded-xl bg-white/50 border border-purple-200 focus:ring-2 ring-pink-300 outline-none"
                      onChange={(e) => setMenstrualData({...menstrualData, cycleLength: e.target.value})}
                    />
                  </div>
                </div>

                {/* Accordion Sections */}
                <Accordion title="الأعراض والمزاج">
                  <textarea 
                    placeholder="كيف تشعرين اليوم؟ (تشنجات، قلق، هدوء...)" 
                    className="w-full p-4 rounded-xl bg-white/40 border-none outline-none resize-none"
                    rows="3"
                    onChange={(e) => setMenstrualData({...menstrualData, symptoms: e.target.value})}
                  ></textarea>
                </Accordion>

                <button 
                  onClick={() => handleSaveData('menstrual', menstrualData.cycleLength, menstrualData.symptoms)}
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all flex justify-center items-center gap-2"
                >
                  {loading ? "جاري الحفظ..." : <><Send size={18}/> حفظ البيانات وتحليلها</>}
                </button>
              </section>
            )}
          </div>

          {/* AI Insights Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-pink-200 h-fit sticky top-8">
              <div className="flex items-center gap-2 mb-4 text-pink-600">
                <Sparkles size={24} />
                <h3 className="text-lg font-bold">رقة AI تنصحكِ</h3>
              </div>
              <div className="bg-pink-50/50 rounded-2xl p-4 min-h-[200px] border border-pink-100">
                {aiResponse ? (
                  <p className="text-gray-800 leading-relaxed leading-loose">{aiResponse}</p>
                ) : (
                  <p className="text-gray-400 text-center mt-10 italic underline decoration-pink-200 underline-offset-8">بانتظار بياناتك لتحليلها برقة... ✨</p>
                )}
              </div>
              
              {/* Cycle Result Card */}
              {menstrualData.startDate && (
                <div className="mt-6 p-4 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl text-white shadow-lg">
                  <p className="text-sm opacity-80">موعد الدورة القادمة المتوقع:</p>
                  <p className="text-2xl font-bold mt-1">{calculateCycle()}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// مكونات فرعية مساعدة
const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${active ? 'bg-pink-500 text-white shadow-md' : 'text-gray-600 hover:bg-white/50'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 rounded-2xl border border-purple-100 overflow-hidden bg-white/30 text-right">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center hover:bg-white/20 transition-colors">
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span className="font-semibold text-gray-700">{title}</span>
      </button>
      {isOpen && <div className="p-4 border-t border-purple-50 bg-white/10">{children}</div>}
    </div>
  );
};

export default RaqqaDashboard;
