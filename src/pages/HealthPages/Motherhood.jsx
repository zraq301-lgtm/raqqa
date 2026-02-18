import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Brain, Users, Star, Smile, Lightbulb, Activity,
  Sparkles, X, ChevronLeft, Check, ChevronDown, ArrowRight
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

/* ── Palette inspired by Dribbble reference ── */
const P = {
  bgFrom: '#FDF2F5',
  bgTo: '#EEF7F0',
  card: 'rgba(255,255,255,0.65)',
  cardSolid: '#FFFFFF',
  glass: 'rgba(255,255,255,0.45)',
  pink: '#E8467C',
  pinkLight: '#FDE8EF',
  mint: '#6BBF8A',
  mintLight: '#E4F5EB',
  text: '#1E2432',
  sub: '#7B8294',
  border: 'rgba(255,255,255,0.7)',
  shadow: '0 8px 32px rgba(0,0,0,0.06)',
};

const categories = [
  { id: 'physical', title: 'الجسدية', subtitle: 'النمو والصحة', icon: Activity, accent: '#E8467C', bg: '#FDE8EF', fields: ['جودة النوم', 'الشهية', 'النشاط الحركي', 'نمو الوزن', 'نمو الطول', 'المناعة', 'صحة الحواس', 'النظافة', 'شرب الماء', 'التنفس'] },
  { id: 'cognitive', title: 'المعرفة', subtitle: 'التعلم والذكاء', icon: Brain, accent: '#5B8DEF', bg: '#E8F0FD', fields: ['التركيز', 'حل المشكلات', 'حب الاستطلاع', 'الذاكرة', 'اللغة', 'المنطق', 'الحساب', 'القراءة', 'اللغات', 'الاستنتاج'] },
  { id: 'emotional', title: 'العاطفة', subtitle: 'المشاعر والثقة', icon: Heart, accent: '#DA5BA5', bg: '#FAEAF4', fields: ['التعبير', 'الثقة', 'الفشل', 'المرونة', 'الضبط', 'التعاطف', 'الأمان', 'حب الذات', 'الخوف', 'الاستقرار'] },
  { id: 'social', title: 'الاجتماعية', subtitle: 'التفاعل والتواصل', icon: Users, accent: '#4EAF6E', bg: '#E4F5EB', fields: ['آداب الحديث', 'المشاركة', 'الصداقات', 'احترام القوانين', 'القيادة', 'النزاعات', 'التعاون', 'الذكاء', 'الخصوصية', 'الحوار'] },
  { id: 'values', title: 'القيم', subtitle: 'الأخلاق والمبادئ', icon: Star, accent: '#E6A23C', bg: '#FDF5E6', fields: ['الصدق', 'بر الوالدين', 'المسؤولية', 'الامتنان', 'التواضع', 'الرحمة', 'البيئة', 'الوقت', 'الصبر', 'العدل'] },
  { id: 'behavior', title: 'السلوك', subtitle: 'العادات والانضباط', icon: Smile, accent: '#7C6FE4', bg: '#EFECFD', fields: ['إدارة الغضب', 'العناد', 'المواعيد', 'الترتيب', 'الأماكن العامة', 'الاستقلال', 'الاعتذار', 'طلب الإذن', 'الاستماع', 'المبادرة'] },
  { id: 'creative', title: 'الإبداع', subtitle: 'الخيال والابتكار', icon: Lightbulb, accent: '#9B6FE4', bg: '#F2ECFD', fields: ['الخيال', 'الرسم', 'الأشغال اليدوية', 'التمثيل', 'الابتكار', 'الموسيقى', 'التصوير', 'الكتابة', 'البرمجة', 'إعادة التدوير'] }
];

/* ── Small reusable components ── */

const CircleProgress = ({ pct, size = 52, stroke = 4, color = P.pink }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * pct) / 100 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".35em"
        style={{ fontSize: size * 0.28, fontWeight: 800, fill: color }}>
        {Math.round(pct)}
      </text>
    </svg>
  );
};

const GlassCard = ({ children, style, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={className}
    style={{
      background: P.card,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 24,
      border: `1px solid ${P.border}`,
      boxShadow: P.shadow,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Category Card (home grid) ── */
const CategoryCard = ({ cat, filled, onClick, index }) => {
  const Icon = cat.icon;
  const pct = (filled / 10) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard
        onClick={onClick}
        className="active:scale-[0.97] transition-transform cursor-pointer"
        style={{ padding: 16, position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative blob */}
        <div style={{
          position: 'absolute', top: -18, left: -18,
          width: 72, height: 72, borderRadius: '50%',
          background: cat.bg, opacity: 0.6,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Icon + mini progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: cat.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} color={cat.accent} strokeWidth={2.2} />
            </div>
            <CircleProgress pct={pct} size={38} stroke={3} color={cat.accent} />
          </div>

          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: P.text }}>{cat.title}</h3>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: P.sub }}>{cat.subtitle}</p>

          {/* Pill progress */}
          <div style={{
            marginTop: 12, height: 5, borderRadius: 10,
            background: `${cat.accent}14`,
          }}>
            <motion.div
              style={{ height: '100%', borderRadius: 10, background: cat.accent }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

/* ── Field Input (detail view) ── */
const FieldInput = ({ field, index, value, onChange, accent, bg }) => {
  const filled = value && value.trim().length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.035, duration: 0.3 }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 18,
        background: filled ? `${bg}` : 'rgba(255,255,255,0.5)',
        border: `1.5px solid ${filled ? `${accent}30` : 'rgba(255,255,255,0.7)'}`,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease',
      }}>
        {/* Number badge */}
        <div style={{
          width: 32, height: 32, borderRadius: 11, flexShrink: 0,
          background: filled ? accent : `${accent}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}>
          {filled
            ? <Check size={14} color="#fff" strokeWidth={3} />
            : <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{index + 1}</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{
            display: 'block', fontSize: 10, fontWeight: 700,
            color: filled ? accent : P.sub,
            marginBottom: 2, letterSpacing: 0.3,
          }}>
            {field}
          </label>
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder="اكتبي هنا..."
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, fontWeight: 500, color: P.text,
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main App ── */
const MotherhoodApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const scrollRef = useRef(null);

  const [inputs, setInputs] = useState(() => {
    const s = {};
    categories.forEach(cat => { s[cat.id] = Array(10).fill(''); });
    return s;
  });

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({
      ...prev,
      [catId]: prev[catId].map((item, i) => (i === idx ? val : item)),
    }));
  };

  const filled = (catId) => inputs[catId].filter(v => v && v.trim().length > 0).length;
  const totalFilled = categories.reduce((a, c) => a + filled(c.id), 0);
  const totalPct = Math.round((totalFilled / 70) * 100);

  useEffect(() => {
    if (activeTab && scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleAnalyze = async () => {
    if (!activeTab) return;
    setLoading(true);
    setShowChat(true);
    setAiResponse('جاري تحليل بياناتك بعناية...');

    try {
      const catData = {};
      activeTab.fields.forEach((f, i) => { catData[f] = inputs[activeTab.id][i]; });

      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          category: `تقييم الطفل - ${activeTab.title}`,
          value: 'بيانات جديدة',
          user_id: 1,
          note: JSON.stringify(catData),
        },
      });

      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنتِ خبيرة تربية أطفال مختصة. إليكِ بيانات التقييم في مجال "${activeTab.title}": ${JSON.stringify(catData)}. حللي الوضع وقدمي نصائح عملية مخصصة بأسلوب رقيق ودافئ.`,
        },
      });

      setAiResponse(response.data.reply || response.data.message || 'حدث خطأ في استلام الرد.');
    } catch {
      setAiResponse('عذرًا، حدث خطأ في الاتصال. تأكدي من الإنترنت وحاولي مجددًا.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{
      minHeight: '100vh',
      background: `linear-gradient(165deg, ${P.bgFrom} 0%, ${P.bgTo} 100%)`,
      fontFamily: 'sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background shapes */}
      <div style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(232,70,124,0.07)' }} />
      <div style={{ position: 'absolute', top: 180, left: -90, width: 200, height: 200, borderRadius: '50%', background: 'rgba(107,191,138,0.08)' }} />
      <div style={{ position: 'absolute', bottom: 60, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(91,141,239,0.06)' }} />

      <AnimatePresence mode="wait">
        {!activeTab ? (
          /* ═══════════ HOME VIEW ═══════════ */
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{ paddingBottom: 32, position: 'relative', zIndex: 1 }}
          >
            {/* Header area */}
            <div style={{ padding: '28px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: P.text, lineHeight: 1.3 }}>
                    تقييم الطفل
                  </h1>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: P.sub }}>
                    تابعي نمو طفلك في كل جانب
                  </p>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 16,
                  background: `linear-gradient(135deg, ${P.pink}, #F06292)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 6px 20px ${P.pink}35`,
                }}>
                  <Sparkles size={20} color="#fff" />
                </div>
              </div>

              {/* Overall stat card */}
              <GlassCard style={{ padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <CircleProgress pct={totalPct} size={64} stroke={5} color={P.pink} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: P.text }}>التقدم الكلي</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: P.pink,
                        background: P.pinkLight, padding: '3px 10px', borderRadius: 20,
                      }}>
                        {totalFilled} / 70
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 10, background: `${P.pink}12` }}>
                      <motion.div
                        style={{ height: '100%', borderRadius: 10, background: `linear-gradient(90deg, ${P.pink}, #F06292)` }}
                        animate={{ width: `${totalPct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 11, color: P.sub }}>
                      {totalPct === 0 ? 'ابدئي بتعبئة البيانات' : totalPct < 50 ? 'أحسنتِ! استمري بالتعبئة' : totalPct < 100 ? 'رائع! اقتربتِ من الاكتمال' : 'ممتاز! اكتملت جميع البيانات'}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Category Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12, padding: '0 20px',
            }}>
              {categories.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  filled={filled(cat.id)}
                  index={i}
                  onClick={() => setActiveTab(cat)}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          /* ═══════════ DETAIL VIEW ═══════════ */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', flexDirection: 'column',
              background: `linear-gradient(165deg, ${P.bgFrom} 0%, ${P.bgTo} 100%)`,
            }}
          >
            {/* Decorative shapes in detail */}
            <div style={{ position: 'absolute', top: -40, left: -40, width: 140, height: 140, borderRadius: '50%', background: `${activeTab.accent}0A` }} />
            <div style={{ position: 'absolute', bottom: 100, right: -50, width: 180, height: 180, borderRadius: '50%', background: `${activeTab.accent}06` }} />

            {/* Top bar */}
            <div style={{
              flexShrink: 0, padding: '20px 20px 16px', position: 'relative', zIndex: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <button
                  onClick={() => setActiveTab(null)}
                  style={{
                    width: 40, height: 40, borderRadius: 14,
                    background: P.card, border: `1px solid ${P.border}`,
                    backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <ArrowRight size={18} color={P.sub} />
                </button>

                <div style={{ flex: 1, textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: P.text }}>{activeTab.title}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: P.sub }}>{activeTab.subtitle}</p>
                </div>

                <div style={{
                  width: 40, height: 40, borderRadius: 14,
                  background: activeTab.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {React.createElement(activeTab.icon, { size: 18, color: activeTab.accent, strokeWidth: 2.2 })}
                </div>
              </div>

              {/* Section progress */}
              <GlassCard style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CircleProgress pct={(filled(activeTab.id) / 10) * 100} size={42} stroke={3.5} color={activeTab.accent} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: P.text }}>حقول مكتملة</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: activeTab.accent,
                        background: activeTab.bg, padding: '2px 8px', borderRadius: 12,
                      }}>
                        {filled(activeTab.id)} / 10
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 10, background: `${activeTab.accent}12` }}>
                      <motion.div
                        style={{ height: '100%', borderRadius: 10, background: activeTab.accent }}
                        animate={{ width: `${(filled(activeTab.id) / 10) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Fields scroll area */}
            <div
              ref={scrollRef}
              style={{
                flex: 1, overflowY: 'auto', padding: '8px 20px 140px',
                position: 'relative', zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeTab.fields.map((field, idx) => (
                  <FieldInput
                    key={idx}
                    field={field}
                    index={idx}
                    value={inputs[activeTab.id][idx]}
                    onChange={(e) => handleUpdateInput(activeTab.id, idx, e.target.value)}
                    accent={activeTab.accent}
                    bg={activeTab.bg}
                  />
                ))}
              </div>
            </div>

            {/* Bottom action */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '24px 20px',
              background: `linear-gradient(to top, ${P.bgFrom} 60%, transparent)`,
              zIndex: 10,
            }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze}
                style={{
                  width: '100%', padding: '15px 0', borderRadius: 20, border: 'none',
                  background: `linear-gradient(135deg, ${activeTab.accent}, ${activeTab.accent}CC)`,
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer',
                  boxShadow: `0 8px 28px ${activeTab.accent}30`,
                  fontFamily: 'inherit',
                }}
              >
                <Sparkles size={18} />
                <span>تحليل البيانات بالذكاء الاصطناعي</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ AI Chat Overlay ═══════════ */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'flex-end',
            }}
            onClick={() => !loading && setShowChat(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxHeight: '80vh',
                background: '#fff',
                borderTopLeftRadius: 32, borderTopRightRadius: 32,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Chat handle */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
                <div style={{ width: 36, height: 4, borderRadius: 4, background: '#E0E0E0' }} />
              </div>

              {/* Chat header */}
              <div style={{
                padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #F0F1F5',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: `linear-gradient(135deg, ${P.pink}, #F06292)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles size={16} color="#fff" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: P.text }}>تقرير الذكاء الاصطناعي</h4>
                    <p style={{ margin: 0, fontSize: 11, color: P.sub }}>
                      {loading ? 'جاري التحليل...' : 'تم التحليل'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: '#F4F5F9', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={16} color={P.sub} />
                </button>
              </div>

              {/* Chat body */}
              <div style={{
                flex: 1, padding: 20, overflowY: 'auto',
                fontSize: 14, lineHeight: 1.8, color: P.text,
                textAlign: 'right', direction: 'rtl',
              }}>
                {loading ? (
                  <div style={{ textAlign: 'center', paddingTop: 40 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: `3px solid ${P.pinkLight}`,
                        borderTopColor: P.pink,
                        margin: '0 auto 16px',
                      }}
                    />
                    <p style={{ color: P.sub, fontSize: 13 }}>أقوم بمراجعة بياناتك بدقة...</p>
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-line' }}>{aiResponse}</div>
                )}
              </div>

              {/* Chat footer */}
              <div style={{ padding: '12px 20px 24px', borderTop: '1px solid #F0F1F5' }}>
                <button
                  onClick={() => setShowChat(false)}
                  style={{
                    width: '100%', padding: 14, borderRadius: 16,
                    background: P.mint, color: '#fff', border: 'none',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  فهمت، شكرًا
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotherhoodApp;
