import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap';

// تحميل الأقسام بنظام Lazy Loading [cite: 2, 3, 4]
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('./HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('./HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness'));

const Health = () => {
  const [activeTab, setActiveTab] = useState(null);

  // توزيع العناصر بناءً على الصورة المرفقة 
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
      gridTemplateColumns: 'repeat(3, 1fr)', // 3 أعمدة مثل الصورة 
      gap: '8px',
      padding: '10px',
      direction: 'rtl',
      background: '#000', // خلفية داكنة لتناسب الأجهزة الحديثة
      minHeight: '100vh',
      alignContent: 'center'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '5px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      cursor: 'pointer',
      overflow: 'hidden',
      aspectRatio: '1 / 1.2', // تناسب الكارت مع شاشات الجوال [cite: 9]
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    image: {
      width: '100%', // الصورة تأخذ عرض الكارت بالكامل [cite: 9]
      height: '80%', // ترك مساحة بسيطة للاسم بالأسفل
      objectFit: 'cover',
      borderRadius: '12px'
    },
    label: {
      fontSize: '11px',
      fontWeight: 'bold',
      color: '#fff',
      marginTop: '4px',
      textAlign: 'center'
    },
    fullView: {
      gridColumn: '1 / span 3',
      gridRow: '1 / span 3',
      width: '100%',
      minHeight: '80vh',
      background: '#fff',
      borderRadius: '20px',
      padding: '20px',
      zIndex: 10
    }
  };

  return (
    <div style={styles.container}>
      {sections.map((sec) => {
        // ميزة إخفاء باقي الأقسام عند تفعيل أحدها 
        if (activeTab && activeTab !== sec.id) return null;

        const Icon = iconMap[sec.icon] || iconMap.insight;
        const isActive = activeTab === sec.id;

        return (
          <div 
            key={sec.id} 
            style={isActive ? styles.fullView : { ...styles.card, ...sec.pos }}
            onClick={() => setActiveTab(isActive ? null : sec.id)}
          >
            {!isActive ? (
              <>
                <img 
                  src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} 
                  alt={sec.title} 
                  style={styles.image} 
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Icon size={12} color="#ff8a80" />
                  <span style={styles.label}>{sec.title}</span>
                </div>
              </>
            ) : (
              // عرض محتوى القسم عند الفتح [cite: 12, 13]
              <div style={{ width: '100%' }}>
                <div onClick={(e) => { e.stopPropagation(); setActiveTab(null); }} style={{ color: '#ad1457', marginBottom: '20px', fontWeight: 'bold' }}>
                  ✕ إغلاق {sec.title}
                </div>
                <Suspense fallback={<p>جاري التحميل...</p>}>
                  {sec.component && <sec.component />}
                </Suspense>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Health;
