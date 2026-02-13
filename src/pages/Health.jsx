import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap';

// استيراد الصفحات بنظام التحميل الكسول
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker')); [cite: 16]
const Advice = lazy(() => import('./HealthPages/Advice')); [cite: 16]
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor')); [cite: 17]
const LactationHub = lazy(() => import('./HealthPages/LactationHub')); [cite: 17]
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical')); [cite: 17]
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness')); [cite: 18]
// استدعاء صفحة الأمومة المطلوبة
const BeautyAesthetics = lazy(() => import('./HealthPages/BeautyAesthetics'));

const Health = () => {
  const [activeTab, setActiveTab] = useState(null); [cite: 18]

  const sections = [
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, pos: { gridColumn: '1', gridRow: '1' } }, [cite: 19]
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, pos: { gridColumn: '2', gridRow: '1' } }, [cite: 19]
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, pos: { gridColumn: '3', gridRow: '1' } }, [cite: 19]
    { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: BeautyAesthetics, pos: { gridColumn: '2', gridRow: '2' } }, [cite: 19]
    { id: 'doctor', title: 'الطبيب', img: 'doctor.png', icon: 'insight', component: DoctorClinical, pos: { gridColumn: '3', gridRow: '3' } }, [cite: 20]
    { id: 'fitness', title: 'الرشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, pos: { gridColumn: '2', gridRow: '3' } }, [cite: 20]
    { id: 'lactation', title: 'الرضاعة', img: 'lactation.png', icon: 'feelings', component: LactationHub, pos: { gridColumn: '1', gridRow: '3' } }, [cite: 20]
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
    }, [cite: 21]
    fullScreenComponent: {
      width: '100%',
      height: '100vh',
      background: '#fff',
      position: 'fixed', // تم التغيير لضمان التغطية الكاملة فوق الشبكة
      top: 0,
      left: 0,
      zIndex: 1000,
      overflowY: 'auto'
    }, [cite: 21, 22]
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
    }, [cite: 22, 23]
    image: {
      width: '100%',
      height: '80%', 
      objectFit: 'cover', 
    }, [cite: 23]
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px',
      height: '20%'
    }, [cite: 24]
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
    } [cite: 24, 25]
  };

  // عرض القسم المختار فقط في شاشة كاملة وإخفاء باقي الأقسام
  if (activeTab) {
    const activeSection = sections.find(s => s.id === activeTab); [cite: 26]
    return (
      <div style={styles.fullScreenComponent}>
        <button style={styles.backButton} onClick={() => setActiveTab(null)}>عودة</button> [cite: 27]
        <Suspense fallback={<p style={{textAlign: 'center', marginTop: '50px'}}>جاري التحميل...</p>}>
          {activeSection.component ? <activeSection.component /> : <div style={{padding: '20px', textAlign: 'center'}}>قريباً...</div>} [cite: 27]
        </Suspense>
      </div>
    );
  } [cite: 28]

  return (
    <div style={styles.container}>
      {sections.map((sec) => {
        const Icon = iconMap[sec.icon] || iconMap.insight; [cite: 28]
        return (
          <div 
            key={sec.id} 
            style={{ ...styles.card, ...sec.pos }}
            [cite_start]onClick={() => setActiveTab(sec.id)} [cite: 28, 29]
          >
            <img 
              src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} 
              alt={sec.title} 
              style={styles.image} 
            [cite_start]/> [cite: 29]
            <div style={styles.footer}>
              <Icon size={16} color="#ad1457" /> [cite: 30]
              <span style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>{sec.title}</span> [cite: 30]
            </div>
          </div>
        );
      })}
    </div>
  );
}; [cite: 31]

export default Health; [cite: 31]
