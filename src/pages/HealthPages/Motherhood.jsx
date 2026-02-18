import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity, 
  Sparkles, X, ChevronLeft, Check
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const COLORS = {
  bg: '#FAFBFE',
  card: '#FFFFFF',
  primary: '#C2185B',
  primaryLight: '#FCE4EC',
  text: '#1A1D2E',
  textSecondary: '#6B7089',
  border: '#F0F1F5',
};

const categories = [
  { id: 'physical', title: 'الجسدية', subtitle: 'النمو والصحة', icon: Activity, color: '#E84D6D', gradient: ['#E84D6D', '#F06F8E'], fields: ['جودة النوم', 'الشهية', 'النشاط الحركي', 'نمو الوزن', 'نمو الطول', 'المناعة', 'صحة الحواس', 'النظافة', 'شرب الماء', 'التنفس'] },
  { id: 'cognitive', title: 'المعرفة', subtitle: 'التعلم والذكاء', icon: Brain, color: '#3B82F6', gradient: ['#3B82F6', '#60A5FA'], fields: ['التركيز', 'حل المشكلات', 'حب الاستطلاع', 'الذاكرة', 'اللغة', 'المنطق', 'الحساب', 'القراءة', 'اللغات', 'الاستنتاج'] },
  { id: 'emotional', title: 'العاطفة', subtitle: 'المشاعر والثقة', icon: Heart, color: '#EC4899', gradient: ['#EC4899', '#F472B6'], fields: ['التعبير', 'الثقة', 'الفشل', 'المرونة', 'الضبط', 'التعاطف', 'الأمان', 'حب الذات', 'الخوف', 'الاستقرار'] },
  { id: 'social', title: 'الاجتماعية', subtitle: 'التفاعل والتواصل', icon: Users, color: '#10B981', gradient: ['#10B981', '#34D399'], fields: ['آداب الحديث', 'المشاركة', 'الصداقات', 'احترام القوانين', 'القيادة', 'النزاعات', 'التعاون', 'الذكاء', 'الخصوصية', 'الحوار'] },
  { id: 'values', title: 'القيم', subtitle: 'الأخلاق والمبادئ', icon: Star, color: '#F59E0B', gradient: ['#F59E0B', '#FBBF24'], fields: ['الصدق', 'بر الوالدين', 'المسؤولية', 'الامتنان', 'التواضع', 'الرحمة', 'البيئة', 'الوقت', 'الصبر', 'العدل'] },
  { id: 'behavior', title: 'السلوك', subtitle: 'العادات والانضباط', icon: Smile, color: '#6366F1', gradient: ['#6366F1', '#818CF8'], fields: ['إدارة الغضب', 'العناد', 'المواعيد', 'الترتيب', 'الأماكن العامة', 'الاستقلال', 'الاعتذار', 'طلب الإذن', 'الاستماع', 'المبادرة'] },
  { id: 'creative', title: 'الإبداع', subtitle: 'الخيال والابتكار', icon: Lightbulb, color: '#8B5CF6', gradient: ['#8B5CF6', '#A78BFA'], fields: ['الخيال', 'الرسم', 'الأشغال اليدوية', 'التمثيل', 'الابتكار', 'الموسيقى', 'التصوير', 'الكتابة', 'البرمجة', 'إعادة التدوير'] }
];

const CategoryCard = ({ cat, onClick, index }) => {
  const Icon = cat.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className="group relative bg-white rounded-3xl p-5 text-right transition-all duration-300 active:scale-[0.97]"
      style={{
        border: '1px solid #F0F1F5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-active:scale-110"
        style={{ 
          background: `linear-gradient(135deg, ${cat.gradient[0]}, ${cat.gradient[1]})`,
          boxShadow: `0 4px 14px ${cat.color}30`,
        }}
      >
        <Icon size={22} color="#fff" strokeWidth={2} />
      </div>
      <h3 className="font-bold text-sm mb-0.5" style={{ color: COLORS.text }}>{cat.title}</h3>
      <p className="text-[11px]" style={{ color: COLORS.textSecondary }}>{cat.subtitle}</p>
      <div 
        className="absolute top-4 left-4 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `${cat.color}10` }}
      >
        <ChevronLeft size={16} color={cat.color} />
      </div>
    </motion.button>
  );
};

const FieldInput = ({ field, index, value, onChange, color }) => {
  const isFilled = value && value.trim().length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="relative"
    >
      <div
        className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200"
        style={{
          background: isFilled ? `${color}08` : '#F8F9FC',
          border: `1.5px solid ${isFilled ? `${color}25` : '#EEEEF2'}`,
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: isFilled ? color : '#E4E5EB',
          }}
        >
          {isFilled ? (
            <Check size={14} color="#fff" strokeWidth={3} />
          ) : (
            <span className="text-[11px] font-bold text-white">{index + 1}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <label 
            className="block text-[10px] font-semibold mb-0.5 tracking-wide"
            style={{ color: isFilled ? color : '#9CA3AF' }}
          >
            {field}
          </label>
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder="اكتبي هنا..."
            className="w-full bg-transparent outline-none text-[13px] font-medium placeholder:text-slate-300"
            style={{ color: COLORS.text }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const MotherhoodApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

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

  const getFilledCount = (catId) => {
    return inputs[catId].filter(v => v && v.trim().length > 0).length;
  };

  useEffect(() => {
    if (activeTab && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen font-sans" dir="rtl" style={{ background: COLORS.bg }}>
      <AnimatePresence mode="wait">
        {!activeTab ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="pb-8"
          >
            {/* Header */}
            <div className="px-5 pt-6 pb-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-black tracking-tight" style={{ color: COLORS.text }}>
                    تقييم الطفل
                  </h1>
                  <p className="text-[12px] mt-0.5" style={{ color: COLORS.textSecondary }}>
                    تابعي نمو طفلك في كل جانب
                  </p>
                </div>
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary}, #E91E63)` }}
                >
                  <Sparkles size={18} color="#fff" />
                </div>
              </div>

              {/* Progress Summary */}
              <div 
                className="rounded-2xl p-4 mb-6"
                style={{ 
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-semibold" style={{ color: COLORS.text }}>
                    التقدم الكلي
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: COLORS.primary }}>
                    {Math.round((categories.reduce((acc, cat) => acc + getFilledCount(cat.id), 0) / 70) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: '#F0F1F5' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ 
                      background: `linear-gradient(90deg, ${COLORS.primary}, #E91E63)`,
                    }}
                    animate={{ 
                      width: `${(categories.reduce((acc, cat) => acc + getFilledCount(cat.id), 0) / 70) * 100}%` 
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.primary }} />
                  <span className="text-[10px]" style={{ color: COLORS.textSecondary }}>
                    {categories.reduce((acc, cat) => acc + getFilledCount(cat.id), 0)} من 70 حقل مكتمل
                  </span>
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <div className="px-5 grid grid-cols-2 gap-3">
              {categories.map((cat, index) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  index={index}
                  onClick={() => setActiveTab(cat)}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: COLORS.bg }}
          >
            {/* Detail Header */}
            <div 
              className="shrink-0 px-5 pt-5 pb-4"
              style={{ 
                background: COLORS.card,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setActiveTab(null)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: '#F4F5F9' }}
                >
                  <X size={18} color={COLORS.textSecondary} />
                </button>
                <div className="text-center flex-1 mx-3">
                  <h2 className="text-base font-black" style={{ color: COLORS.text }}>
                    {activeTab.title}
                  </h2>
                  <p className="text-[11px]" style={{ color: COLORS.textSecondary }}>
                    {activeTab.subtitle}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${activeTab.gradient[0]}, ${activeTab.gradient[1]})`,
                    boxShadow: `0 4px 12px ${activeTab.color}30`,
                  }}
                >
                  {React.createElement(activeTab.icon, { size: 18, color: '#fff' })}
                </div>
              </div>

              {/* Section Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F0F1F5' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: activeTab.color }}
                    animate={{ width: `${(getFilledCount(activeTab.id) / 10) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-[11px] font-bold shrink-0" style={{ color: activeTab.color }}>
                  {getFilledCount(activeTab.id)}/10
                </span>
              </div>
            </div>

            {/* Fields List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 pb-36">
              <div className="space-y-2.5">
                {activeTab.fields.map((field, idx) => (
                  <FieldInput
                    key={idx}
                    field={field}
                    index={idx}
                    value={inputs[activeTab.id][idx]}
                    onChange={(e) => handleUpdateInput(activeTab.id, idx, e.target.value)}
                    color={activeTab.color}
                  />
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <div 
              className="absolute bottom-0 left-0 right-0 p-5"
              style={{ 
                background: 'linear-gradient(to top, rgba(250,251,254,1) 70%, rgba(250,251,254,0))',
              }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${activeTab.gradient[0]}, ${activeTab.gradient[1]})`,
                  boxShadow: `0 8px 24px ${activeTab.color}35`,
                }}
              >
                <Sparkles size={18} />
                <span>تحليل البيانات بالذكاء الاصطناعي</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotherhoodApp;
