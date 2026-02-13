import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap'; [cite: 1]

// استيراد الصفحات بنظام التحميل الكسول
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker')); [cite: 2]
const Advice = lazy(() => import('./HealthPages/Advice')); [cite: 3]
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor')); [cite: 3]
const LactationHub = lazy(() => import('./HealthPages/LactationHub')); [cite: 3]
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical')); [cite: 4]
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness')); [cite: 4]
// ربط ملف الجمال بقسم الأمومة كما طلبت
const BeautyAesthetics = lazy(() => import('./HealthPages/BeautyAesthetics')); 

const Health = () => {
  const [activeTab, setActiveTab] = useState(null); [cite: 5]

  const sections = [
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, pos: { gridColumn: '1', gridRow: '1' } }, [cite: 6]
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, pos: { gridColumn: '2', gridRow: '1' } }, [cite: 6]
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, pos: { gridColumn: '3', gridRow: '1' } }, [cite: 6]
    { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: BeautyAesthetics, pos: { gridColumn: '2', gridRow: '2' } }, [cite: 6, 7]
    { id: 'doctor', title: 'الطبيب', img: 'doctor.png', icon: 'insight', component: DoctorClinical, pos: { gridColumn: '3', gridRow: '3' } }, [cite: 7]
    { id: 'fitness', title: 'الرشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, pos: { gridColumn: '2', gridRow: '3' } }, [cite: 7]
    { id: 'lactation', title: 'الرضاعة', img: 'lactation.png', icon: 'feelings', component: LactationHub, pos: { gridColumn: '1', gridRow: '3' } }, [cite: 7]
  ];

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)', [cite: 8]
      gap: '12px',
      padding: '15px',
      direction: 'rtl',
      background: '#f9f9f9',
      minHeight: '100vh',
      boxSizing: 'border-box'
    },
    card: {
      background: '#fff',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      height: '140px' // حجم مصغر ليتناسب مع شاشات الموبايل
    },
    image: {
      width: '100%',
      height: '75%',
      objectFit: 'cover' // تجعل الصورة تملأ الكارت بالضبط
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '5px',
      height: '25%'
    },
    fullPage: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#fff',
      zIndex: 1000,
      overflowY: 'auto'
    },
    closeBtn: {
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#ad1457',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      zIndex: 1001,
      cursor: 'pointer'
    }
  };

  // عرض الصفحة المختارة ملء الشاشة وإخفاء الباقي
  if (activeTab) {
    const activeSection = sections.find(s => s.id === activeTab);
    return (
      <div style={styles.fullPage}>
        <button style={styles.closeBtn} onClick={() => setActiveTab(null)}>×</button>
        <Suspense fallback={<p style={{textAlign: 'center', marginTop: '50px'}}>جاري التحميل...</p>}> [cite: 13]
          <activeSection.component />
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
            [cite_start]style={{ ...styles.card, ...sec.pos }} [cite: 10]
            onClick={() => setActiveTab(sec.id)}
          >
            <img 
              [cite_start]src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} [cite: 11]
              alt={sec.title} 
              style={styles.image} 
            />
            <div style={styles.titleContainer}>
              <Icon size={16} color="#ad1457" /> [cite: 12]
              <span style={{ fontWeight: 'bold', color: '#333', fontSize: '11px' }}>{sec.title}</span> [cite: 12]
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Health; [cite: 14]
