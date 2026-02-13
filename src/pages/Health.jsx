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

  // إعدادات الشبكة لتطابق الصورة المرفوعة (3 أعمدة × 3 صفوف) 
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
      gap: '10px',
      padding: '15px',
      direction: 'rtl',
      background: '#000', // خلفية داكنة لتناسب أجهزة الجوال
      minHeight: '100vh',
      alignContent: 'center'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.15)', [cite: 8]
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer', [cite: 9]
      overflow: 'hidden',
      aspectRatio: '1 / 1.1', // تصغير الحجم ليناسب الشاشة الواحدة
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    image: {
      width: '100%', // الصورة بحجم الكارت بالضبط
      height: '80%', 
      objectFit: 'cover' [cite: 9]
    },
    labelContainer: {
      height: '20%',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      justifyContent: 'center'
    },
    fullScreenPage: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#fff',
      zIndex: 2000,
      padding: '20px',
      overflowY: 'auto'
    },
    closeBtn: {
      padding: '10px',
      background: '#ad1457',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      marginBottom: '15px'
    }
  };

  return (
    <div style={styles.container}>
      {sections.map((sec) => {
        // إخفاء باقي الأقسام عند فتح قسم معين 
        if (activeTab && activeTab !== sec.id) return null;

        const Icon = iconMap[sec.icon] || iconMap.insight; 

        return (
          <React.Fragment key={sec.id}>
            {!activeTab ? (
              <div 
                style={{ ...styles.card, ...sec.pos }}
                [cite_start]onClick={() => setActiveTab(sec.id)} 
              >
                <img 
                  [cite_start]src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} [cite: 11]
                  alt={sec.title} 
                  style={styles.image} 
                />
                <div style={styles.labelContainer}>
                  <Icon size={14} color="#ff8a80" /> [cite: 12]
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>{sec.title}</span>
                </div>
              </div>
            ) : (
              // عرض الصفحة المستدعاة شاشة كاملة 
              <div style={styles.fullScreenPage}>
                <button onClick={() => setActiveTab(null)} style={styles.closeBtn}>إغلاق ✕</button>
                <Suspense fallback={<p>جاري التحميل...</p>}> 
                  {sec.component ? <sec.component /> : <p style={{textAlign:'center'}}>محتوى {sec.title}</p>}
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
