import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Send, Trash2, ChevronRight, MessageSquare, Sparkles, X, 
  Settings, Bell, Search, Plus
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const MotherhoodApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);

  // تعريف البيانات: كروت ملونة بـ 10 مدخلات لكل منها
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
    const initialState = {};
    categories.forEach(cat => { initialState[cat.id] = Array(10).fill(''); });
    return initialState;
  });

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({
      ...prev,
      [catId]: prev[catId].map((item, i) => (i === idx ? val : item))
    }));
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-4 font-sans text-right" dir="rtl">
      {/* Header الأنيق */}
      <header className="flex justify-between items-center mb-8 px-2">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white">
            <Plus size={20} />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">رقة الذكية</h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400"><Search size={18}/></button>
          <button className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400"><Settings size={18}/></button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!activeTab ? (
          /* شبكة الكروت الملونة الصغيرة */
          <motion.div 
            key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat)}
                className="relative overflow-hidden bg-white p-4 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-start gap-3 transition-all active:scale-95"
              >
                <div className="p-3 rounded-2xl text-white shadow-md" style={{ backgroundColor: cat.color }}>
                  {React.cloneElement(cat.icon, { size: 20 })}
                </div>
                <span className="font-bold text-slate-700 text-xs">{cat.title}</span>
                <div className="absolute -bottom-2 -right-2 opacity-10" style={{ color: cat.color }}>
                   {React.cloneElement(cat.icon, { size: 50 })}
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          /* واجهة الإدخال الفاخرة بالأشرطة الملونة */
          <motion.div 
            key="modal" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Header المودال */}
            <div className="p-6 flex justify-between items-center border-b border-slate-50">
              <button onClick={() => setActiveTab(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400"><X size={20}/></button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">تحديث البيانات</span>
                <h2 className="text-lg font-black text-slate-800">{activeTab.title}</h2>
              </div>
              <div className="w-12"></div>
            </div>

            {/* أشرطة المدخلات الملونة (أكثر من 7 مدخلات) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-32">
              {activeTab.fields.map((field, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 p-3 rounded-[1.5rem] shadow-sm border border-transparent focus-within:border-slate-200"
                  style={{ backgroundColor: `${activeTab.color}08` }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm shrink-0"
                    style={{ backgroundColor: activeTab.color, color: '#fff' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: activeTab.color }}>{field}</p>
                    <input 
                      type="text" 
                      placeholder={`ملاحظاتك حول ${field}...`}
                      value={inputs[activeTab.id][idx]}
                      onChange={(e) => handleUpdateInput(activeTab.id, idx, e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-300 font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* زر التحليل الذكي */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
              <button 
                className="w-full py-5 rounded-[2.2rem] font-black text-white shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
                style={{ 
                  backgroundColor: activeTab.color, 
                  boxShadow: `0 15px 35px ${activeTab.color}40` 
                }}
              >
                <Sparkles size={20} />
                تحليل البيانات بالذكاء الاصطناعي
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotherhoodApp;
