import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Send, Trash2, ChevronRight, MessageSquare, Sparkles, X, 
  Settings, Bell, Search
} from 'lucide-react';

const MotherhoodApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'physical', title: 'الاحتياجات الجسدية', icon: <Activity />, color: '#6366f1', fields: ['جودة النوم', 'الشهية', 'النشاط'] },
    { id: 'cognitive', title: 'التطور المعرفي', icon: <Brain />, color: '#ec4899', fields: ['التركيز', 'اللغة', 'الذاكرة'] },
    { id: 'emotional', title: 'الذكاء العاطفي', icon: <Heart />, color: '#f59e0b', fields: ['الثقة', 'التعبير', 'المرونة'] },
    { id: 'social', title: 'المهارات الاجتماعية', icon: <Users />, color: '#10b981', fields: ['المشاركة', 'الصداقات', 'القيادة'] },
    { id: 'values', title: 'القناعات والقيم', icon: <Star />, color: '#8b5cf6', fields: ['الصدق', 'المسؤولية', 'الامتنان'] },
    { id: 'behavior', title: 'السلوك والتهذيب', icon: <Smile />, color: '#06b6d4', fields: ['الاستقلال', 'الترتيب', 'الهدوء'] }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 font-sans" dir="rtl">
      {/* الشريط العلوي - مستوحى من تطبيقات Dribbble */}
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-white flex items-center justify-center">
            <Settings className="text-slate-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">رقة الذكية</h1>
            <p className="text-xs text-slate-500">مرحباً بكِ، أمي المبدعة</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-white flex items-center justify-center text-slate-400">
                <Search size={20} />
            </button>
            <button className="w-12 h-12 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white">
                <Bell size={20} />
            </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!activeTab ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat)}
                  className="group bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all border border-transparent hover:border-indigo-50 flex items-center gap-6 text-right"
                >
                  <div 
                    className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}10`, color: cat.color }}
                  >
                    {React.cloneElement(cat.icon, { size: 32 })}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{cat.title}</h3>
                    <p className="text-sm text-slate-400">تابعي تطور طفلك في هذا الجانب</p>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))}
            </motion.div>
          ) : (
            /* كارت إدخال البيانات - تصميم ناعم (Soft UI) */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-white"
            >
              <div className="p-8 flex justify-between items-center border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: `${activeTab.color}15`, color: activeTab.color }}>
                        {activeTab.icon}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{activeTab.title}</h2>
                        <span className="text-xs text-slate-400">إدخال البيانات اليومية</span>
                    </div>
                </div>
                <button onClick={() => setActiveTab(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                    <X size={20} />
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 gap-4">
                {activeTab.fields.map((field, idx) => (
                  <div key={idx} className="relative">
                    <label className="text-xs font-bold text-slate-400 mr-4 mb-2 block">{field}</label>
                    <input 
                      type="text" 
                      placeholder="اكتبي ملاحظاتك هنا..."
                      className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] py-4 px-6 outline-none transition-all text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-50/50 flex gap-4">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[2rem] shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-95">
                  <Sparkles size={20} />
                  تحليل النتائج بالذكاء الاصطناعي
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* زر المساعدة العائم */}
      <button className="fixed bottom-8 left-8 w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 border border-indigo-50 hover:-translate-y-2 transition-transform">
        <MessageSquare size={28} />
      </button>
    </div>
  );
};

export default MotherhoodApp;
