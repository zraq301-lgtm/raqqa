import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap'; 

// استيراد المكونات (تم الحفاظ عليها كما هي)
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('./HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('./HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness'));

const Health = () => {
  const [activeTab, setActiveTab] = useState(null);

  // تعريف الأقسام مع إضافة ألوان مخصصة لكل كرت (Soft Pastel Palette)
  const sections = [
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, color: '#FFB7CE' }, // وردي ناعم
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, color: '#E0BBE4' }, // أرجواني لافندر
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, color: '#FFDFD3' }, // مشمشي هادئ
    { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: LactationHub, color: '#D5EDF5' }, // سماوي فاتح
    { id: 'doctor', title: 'طبيبك', img: 'doctor.png', icon: 'insight', component: DoctorClinical, color: '#FCE1E4' }, // وردي باهت
    { id: 'fitness', title: 'رشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, color: '#E2F0CB' }, // أخضر نعناعي
  ];

  const styles = {
    container: {
      padding: '25px 15px',
      direction: 'rtl',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f7 0%, #f0f4ff 100%)', // خلفية متدرجة أنثوية
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)', // ترتيب كرتين في كل صف كما في التصاميم العصرية
      gap: '15px',
      maxWidth: '500px',
      margin: '0 auto'
    },
    card: (bgColor) => ({
      background: '#ffffff',
      borderRadius: '24px',
      padding: '20px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      border: `2px solid ${bgColor}`, // إطار بلون القسم
      position: 'relative',
      overflow: 'hidden'
    }),
    iconBadge: (bgColor) => ({
      backgroundColor: bgColor,
      padding: '8px',
      borderRadius: '12px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 4px 10px ${bgColor}66`
    }),
    image: {
      width: '60px',
      height: '60px',
      objectFit: 'contain',
      marginBottom: '10px',
      filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.1))'
    },
    title: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#4A4A4A',
      marginTop: '5px'
    },
    fullPageContainer: {
      width: '100%',
      animation: 'slideUp 0.4s ease-out'
    },
    backHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      padding: '10px',
      background: '#fff',
      borderRadius: '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      {!activeTab ? (
        <>
          <h2 style={{ textAlign: 'center', color: '#ad1457', marginBottom: '25px', fontSize: '1.4rem' }}>
             ركن الصحة والجمال 🌸
          </h2>
          <div style={styles.gridContainer}>
            {sections.map((sec) => {
              const Icon = iconMap[sec.icon] || iconMap.insight;
              return (
                <div 
                  key={sec.id} 
                  style={styles.card(sec.color)}
                  onClick={() => setActiveTab(sec.id)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={styles.iconBadge(sec.color)}>
                    <Icon size={22} color="#fff" />
                  </div>
                  <img 
                    src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} 
                    alt={sec.title} 
                    style={styles.image} 
                  />
                  <span style={styles.title}>{sec.title}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={styles.fullPageContainer}>
          <div style={styles.backHeader} onClick={() => setActiveTab(null)}>
            <span style={{ fontSize: '1.2rem' }}>🔙</span>
            <span style={{ fontWeight: 'bold', color: '#ad1457' }}>العودة للقائمة</span>
          </div>
          
          <Suspense fallback={<div style={{textAlign:'center', padding:'50px', color: '#ad1457'}}>✨ جاري تحضير صفحتك...</div>}>
            {sections.find(s => s.id === activeTab)?.component && (
              React.createElement(sections.find(s => s.id === activeTab).component)
            )}
          </Suspense>
        </div>
      )}

      {/* إضافة انيميشن بسيط */}
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default Health;
