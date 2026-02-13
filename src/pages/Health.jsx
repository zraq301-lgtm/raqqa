import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap'; 

// استيراد المكونات
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('./HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('./HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness'));

const Health = () => {
  const [activeTab, setActiveTab] = useState(null);

  const sections = [
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, color: '#fce4ec', accent: '#f06292' },
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, color: '#f3e5f5', accent: '#ba68c8' },
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, color: '#fff3e0', accent: '#ffb74d' },
    { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: LactationHub, color: '#e1f5fe', accent: '#4fc3f7' },
    { id: 'doctor', title: 'طبيبك', img: 'doctor.png', icon: 'insight', component: DoctorClinical, color: '#ede7f6', accent: '#9575cd' },
    { id: 'fitness', title: 'رشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, color: '#f1f8e9', accent: '#aed581' },
  ];

  const styles = {
    container: {
      padding: '20px 15px',
      direction: 'rtl',
      minHeight: '100vh',
      background: '#fff', 
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)', // كرتين في الصف لزيادة الحجم
      gap: '12px',
      maxWidth: '500px',
      margin: '0 auto'
    },
    card: (bgColor, accentColor) => ({
      background: bgColor,
      borderRadius: '20px',
      height: '160px', // زيادة الارتفاع ليعطي مساحة للصورة
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: `1.5px solid ${accentColor}44`,
      overflow: 'hidden',
      transition: 'transform 0.2s'
    }),
    imageWrapper: {
      flex: 1, // يأخذ كل المساحة المتاحة في الكرت
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 10px 0 10px',
    },
    image: {
      width: '90%', // الصورة تأخذ 90% من عرض الكرت
      height: '90%', // و90% من مساحة الـ wrapper
      objectFit: 'contain',
    },
    labelArea: {
      width: '100%',
      padding: '8px 0',
      background: 'rgba(255, 255, 255, 0.7)', // طبقة شفافة لاسم القسم
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px'
    },
    title: {
      fontSize: '0.95rem',
      fontWeight: 'bold',
      color: '#444'
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px',
      background: '#f8f9fa',
      borderRadius: '12px',
      marginBottom: '15px',
      cursor: 'pointer',
      border: 'none',
      width: '100%',
      color: '#ad1457',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.container}>
      {!activeTab ? (
        <>
          <h2 style={{ textAlign: 'center', color: '#ad1457', marginBottom: '20px' }}>صحتي وعنايتي ✨</h2>
          <div style={styles.gridContainer}>
            {sections.map((sec) => {
              const Icon = iconMap[sec.icon] || iconMap.insight;
              return (
                <div 
                  key={sec.id} 
                  style={styles.card(sec.color, sec.accent)}
                  onClick={() => setActiveTab(sec.id)}
                >
                  <div style={styles.imageWrapper}>
                    <img 
                      src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} 
                      alt={sec.title} 
                      style={styles.image} 
                    />
                  </div>
                  <div style={styles.labelArea}>
                    <Icon size={16} color={sec.accent} />
                    <span style={styles.title}>{sec.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <button style={styles.backBtn} onClick={() => setActiveTab(null)}>
             ⬅ العودة للأقسام
          </button>
          
          <Suspense fallback={<div style={{textAlign:'center', padding:'40px'}}>جاري التحميل...</div>}>
            {sections.find(s => s.id === activeTab)?.component && (
              React.createElement(sections.find(s => s.id === activeTab).component)
            )}
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default Health;
