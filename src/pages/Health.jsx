import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap'; [cite: 1]

// استيراد الصفحات بنفس المسارات الأصلية تماماً [cite: 2, 3, 4]
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('./HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('./HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness'));

const Health = () => {
  const [activeTab, setActiveTab] = useState(null); [cite: 5]

  // توزيع الأقسام بناءً على الصورة المرفوعة 
  const sections = [
    { id: 'fitness', title: 'الرشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, pos: { gridColumn: '2', gridRow: '1' } },
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, pos: { gridColumn: '1', gridRow: '2' } },
    { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: null, pos: { gridColumn: '2', gridRow: '2' } },
    { id: 'doctor', title: 'الطبيب', img: 'doctor.png', icon: 'insight', component: DoctorClinical, pos: { gridColumn: '3', gridRow: '2' } },
    { id: 'lactation', title: 'الرضاعة', img: 'lactation.png', icon: 'feelings', component: LactationHub, pos: { gridColumn: '1', gridRow: '3' } },
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, pos: { gridColumn: '2', gridRow: '3' } },
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, pos: { gridColumn: '3', gridRow: '3' } },
  ];

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)', [cite: 8]
      gap: '8px',
      padding: '12px',
      direction: 'rtl',
      background: '#000', 
      minHeight: '100vh',
      alignContent: 'center'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)', [cite: 8]
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      overflow: 'hidden',
      aspectRatio: '1 / 1.25', // لملاءمة جميع شاشات الجوال
      border: '1px solid rgba(255, 255, 255, 0.1)' [cite: 9]
    },
    image: {
      width: '100%', // الصورة تشغل الكارت بالكامل
      height: '82%', 
      objectFit: 'cover' [cite: 9]
    },
    labelArea: {
      height: '18%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      width: '100%',
      background: 'rgba(0,0,0,0.2)'
    },
    fullOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#fff',
      zIndex: 999,
      overflowY: 'auto',
      padding: '15px'
    }
  };

  return (
    <div style={styles.container}>
      {sections.map((sec) => {
        // إخفاء الأقسام الأخرى عند اختيار قسم معين
        if (activeTab && activeTab !== sec.id) return null; [cite: 10]

        const Icon = iconMap[sec.icon] || iconMap.insight; [cite: 10]

        return (
          <React.Fragment key={sec.id}>
            {!activeTab ? (
              <div 
                [cite_start]style={{ ...styles.card, ...sec.pos }} [cite: 10]
                onClick={() => setActiveTab(sec.id)}
              >
                <img 
                  [cite_start]src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} [cite: 11]
                  alt={sec.title} 
                  style={styles.image} 
                />
                <div style={styles.labelArea}>
                  <Icon size={12} color="#ff8a80" /> [cite: 12]
                  <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>{sec.title}</span>
                </div>
              </div>
            ) : (
              <div style={styles.fullOverlay}>
                <button 
                  onClick={() => setActiveTab(null)} 
                  style={{ marginBottom: '15px', padding: '10px', background: '#ad1457', color: '#fff', border: 'none', borderRadius: '8px' }}
                >
                  إغلاق ✕
                </button>
                <Suspense fallback={<p>جاري التحميل...</p>}> 
                  {sec.component ? <sec.component /> : <div style={{textAlign:'center', padding: '20px'}}>محتوى {sec.title}</div>}
                </Suspense>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Health; [cite: 14]
