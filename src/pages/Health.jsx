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
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker },
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice },
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor },
    { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: LactationHub },
    { id: 'doctor', title: 'طبيبك', img: 'doctor.png', icon: 'insight', component: DoctorClinical },
    { id: 'fitness', title: 'رشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness },
  ];

  const styles = {
    container: {
      padding: '20px',
      direction: 'rtl',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
    // شبكة الكروت الصغيرة
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '15px',
      maxWidth: '600px',
      margin: '0 auto'
    },
    card: {
      background: '#fff',
      borderRadius: '15px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      border: '1px solid #eee',
      textAlign: 'center'
    },
    image: {
      width: '50px', // حجم صغير للصور لتناسب الكروت
      height: '50px',
      objectFit: 'contain',
      marginBottom: '8px'
    },
    title: {
      fontSize: '0.85rem',
      fontWeight: 'bold',
      color: '#333'
    },
    // حاوية الصفحة الكاملة عند الفتح
    fullPageContainer: {
      width: '100%',
      animation: 'fadeIn 0.3s ease-in'
    },
    closeButton: {
      padding: '10px 20px',
      backgroundColor: '#ad1457',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      marginBottom: '20px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.container}>
      {/* إذا لم يتم اختيار أي قسم، تظهر الشبكة */}
      {!activeTab ? (
        <div style={styles.gridContainer}>
          {sections.map((sec) => {
            const Icon = iconMap[sec.icon] || iconMap.insight;
            return (
              <div 
                key={sec.id} 
                style={styles.card}
                onClick={() => setActiveTab(sec.id)}
              >
                <img 
                  src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} 
                  alt={sec.title} 
                  style={styles.image} 
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Icon size={14} color="#ad1457" />
                  <span style={styles.title}>{sec.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* عند الضغط على قسم، تظهر هذه الحاوية ويختفي ما سبق */
        <div style={styles.fullPageContainer}>
          <button style={styles.closeButton} onClick={() => setActiveTab(null)}>
             إغلاق والعودة للقائمة الرئيسية ✖
          </button>
          
          <Suspense fallback={<div style={{textAlign:'center', padding:'20px'}}>جاري التحميل...</div>}>
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
