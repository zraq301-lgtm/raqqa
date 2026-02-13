import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap';

[cite_start]// استيراد الصفحات بنظام التحميل الكسول [cite: 16, 17, 18]
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('./HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('./HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness'));
const BeautyAesthetics = lazy(() => import('./HealthPages/BeautyAesthetics')); [cite_start]// ربط الأمومة بصفحة الجمال [cite: 2, 3]

const Health = () => {
  const [activeTab, setActiveTab] = useState(null);

  const sections = [
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, pos: { gridColumn: '1', gridRow: '1' } },
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, pos: { gridColumn: '2', gridRow: '1' } },
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, pos: { gridColumn: '3', gridRow: '1' } },
    { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: BeautyAesthetics, pos: { gridColumn: '2', gridRow: '2' } },
    { id: 'doctor', title: 'الطبيب', img: 'doctor.png', icon: 'insight', component: DoctorClinical, pos: { gridColumn: '3', gridRow: '3' } },
    { id: 'fitness', title: 'الرشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, pos: { gridColumn: '2', gridRow: '3' } },
    { id: 'lactation', title: 'الرضاعة', img: 'lactation.png', icon: 'feelings', component: LactationHub, pos: { gridColumn: '1', gridRow: '3' } },
  ];

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)', 
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
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      overflowY: 'auto'
    },
    card: {
      background: '#fff',
      borderRadius: '15px',
      overflow: 'hidden', 
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
      height: '80%', 
      objectFit: 'cover'
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
      zIndex: 1001,
      cursor: 'pointer'
    }
  };

  if (activeTab) {
    const activeSection = sections.find(s => s.id === activeTab);
    const ActiveComponent = activeSection?.component; // تعريف بمتغير يبدأ بحرف كبير لتلافي خطأ الترانزفورم

    return (
      <div style={styles.fullScreenComponent}>
        <button style={styles.backButton} onClick={() => setActiveTab(null)}>عودة</button>
        <Suspense fallback={<p style={{ textAlign: 'center', marginTop: '50px' }}>جاري التحميل...</p>}>
          {ActiveComponent ? <ActiveComponent /> : <div style={{ padding: '20px', textAlign: 'center' }}>قريباً...</div>}
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
