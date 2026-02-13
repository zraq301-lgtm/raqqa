import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap';

// استيراد الصفحات بنظام التحميل الكسول
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('./HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('./HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness'));

const Health = () => {
  const [activeTab, setActiveTab] = useState(null);

  const sections = [
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, pos: { gridColumn: '1', gridRow: '1' } },
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, pos: { gridColumn: '2', gridRow: '1' } },
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, pos: { gridColumn: '3', gridRow: '1' } },
    { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: null, pos: { gridColumn: '2', gridRow: '2' } },
    { id: 'doctor', title: 'الطبيب', img: 'doctor.png', icon: 'insight', component: DoctorClinical, pos: { gridColumn: '3', gridRow: '3' } },
    { id: 'fitness', title: 'الرشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, pos: { gridColumn: '2', gridRow: '3' } },
    { id: 'lactation', title: 'الرضاعة', img: 'lactation.png', icon: 'feelings', component: LactationHub, pos: { gridColumn: '1', gridRow: '3' } },
  ];

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)', // عرض 3 أعمدة كما بالصورة 
      gap: '10px',
      padding: '10px',
      direction: 'rtl',
      background: '#f9f9f9',
      height: '100vh',
      boxSizing: 'border-box'
    },
    fullScreenComponent: {
      width: '100%',
      height: '100vh',
      background: '#fff',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 100,
      overflowY: 'auto'
    },
    card: {
      background: '#fff',
      borderRadius: '15px',
      overflow: 'hidden', // لضمان عدم خروج الصورة عن حدود الكارت 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      height: '100%' 
    },
    image: {
      width: '100%',
      height: '80%', // تأخذ الجزء الأكبر من الكارت [cite: 9]
      objectFit: 'cover', // تجعل الصورة تغطي المساحة المخصصة بالكامل 
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px',
      height: '20%'
    },
    backButton: {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '10px 20px',
        backgroundColor: '#ad1457',
        color: 'white',
        borderRadius: '25px',
        border: 'none',
        zIndex: 101,
        cursor: 'pointer'
    }
  };

  // إذا كان هناك قسم نشط، نعرضه هو فقط في كامل الشاشة 
  if (activeTab) {
    const activeSection = sections.find(s => s.id === activeTab);
    return (
      <div style={styles.fullScreenComponent}>
        <button style={styles.backButton} onClick={() => setActiveTab(null)}>عودة</button>
        <Suspense fallback={<p style={{textAlign: 'center', marginTop: '50px'}}>جاري التحميل...</p>}>
          {activeSection.component ? <activeSection.component /> : <div style={{padding: '20px', textAlign: 'center'}}>قريباً...</div>}
        </Suspense>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {sections.map((sec) => {
        const Icon = iconMap[sec.icon] || iconMap.insight;
        return (
          <div 
            key={sec.id} 
            style={{ ...styles.card, ...sec.pos }}
            onClick={() => setActiveTab(sec.id)}
          >
            <img 
              src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} 
              alt={sec.title} 
              style={styles.image} 
            />
            <div style={styles.footer}>
              <Icon size={16} color="#ad1457" />
              <span style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>{sec.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Health;
