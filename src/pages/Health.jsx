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

  // تم إضافة قسم "الرضاعة" بشكل صريح وتحديد ألوان أنثوية ناعمة
  const sections = [
    { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, color: '#FFB7CE' },
    { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, color: '#E0BBE4' },
    { id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, color: '#FFDFD3' },
    { id: 'motherhood', title: 'الرضاعة', img: 'motherhood.png', icon: 'feelings', component: LactationHub, color: '#D5EDF5' }, // قسم الرضاعة
    { id: 'doctor', title: 'طبيبك', img: 'doctor.png', icon: 'insight', component: DoctorClinical, color: '#FCE1E4' },
    { id: 'fitness', title: 'رشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, color: '#E2F0CB' },
    { id: 'beauty', title: 'جمالك', img: 'beauty.png', icon: 'beauty', component: FitnessWellness, color: '#FFF5BA' }, // إضافة قسم سابع لاكتمال الشبكة
  ];

  const styles = {
    container: {
      padding: '20px 10px',
      direction: 'rtl',
      minHeight: '100vh',
      backgroundColor: '#fff',
    },
    gridContainer: {
      display: 'grid',
      // تنظيم الشبكة لتكون الكروت أصغر (3 كروت في الصف لتقليل الحجم بنسبة 30%)
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '10px',
      maxWidth: '500px',
      margin: '0 auto'
    },
    card: (bgColor) => ({
      background: bgColor,
      borderRadius: '18px',
      height: '110px', // حجم أصغر متناسق
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between', // توزيع المساحة بين الصورة والنص
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      transition: 'transform 0.2s',
      border: '1px solid rgba(0,0,0,0.03)'
    }),
    image: {
      width: '100%',
      height: '75%', // الصورة تأخذ معظم مساحة الكرت
      objectFit: 'contain',
      marginTop: '5px'
    },
    labelArea: {
      width: '100%',
      height: '25%', // مساحة صغيرة لاسم القسم في الأسفل
      backgroundColor: 'rgba(255,255,255,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3px'
    },
    title: {
      fontSize: '0.75rem', // خط أصغر ليتناسب مع حجم الكرت الجديد
      fontWeight: 'bold',
      color: '#444'
    },
    backButton: {
      padding: '10px 15px',
      backgroundColor: '#ad1457',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      marginBottom: '20px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }
  };

  return (
    <div style={styles.container}>
      {!activeTab ? (
        <div style={styles.gridContainer}>
          {sections.map((sec) => {
            const Icon = iconMap[sec.icon] || iconMap.insight;
            return (
              <div 
                key={sec.id} 
                style={styles.card(sec.color)}
                onClick={() => setActiveTab(sec.id)}
              >
                <img 
                  src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} 
                  alt={sec.title} 
                  style={styles.image} 
                />
                <div style={styles.labelArea}>
                  <Icon size={12} color="#ad1457" />
                  <span style={styles.title}>{sec.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.4s' }}>
          <button style={styles.backButton} onClick={() => setActiveTab(null)}>
            🔙 العودة للقائمة
          </button>
          
          <Suspense fallback={<div style={{textAlign:'center', padding:'50px'}}>جاري تحميل القسم... ✨</div>}>
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
