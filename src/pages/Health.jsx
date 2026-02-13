import React, { useState, Suspense, lazy } from 'react';
[cite_start]import { iconMap } from '../constants/iconMap'; [cite: 1]

// استيراد الصفحات بشكل كسول (Lazy Loading)
[cite_start]const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker')); [cite: 2]
[cite_start]const Advice = lazy(() => import('./HealthPages/Advice')); [cite: 3]
[cite_start]const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor')); [cite: 3]
[cite_start]const LactationHub = lazy(() => import('./HealthPages/LactationHub')); [cite: 3]
[cite_start]const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical')); [cite: 4]
[cite_start]const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness')); [cite: 4]

const Health = () => {
  [cite_start]const [activeTab, setActiveTab] = useState(null); [cite: 5]

  // تعريف الأقسام مع توزيع الشبكة بناءً على الصورة المرفقة
  const sections = [
    [cite_start]{ id: 'fitness', title: 'الرشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness, pos: { gridColumn: '2', gridRow: '1' } }, [cite: 7]
    [cite_start]{ id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice, pos: { gridColumn: '1', gridRow: '2' } }, [cite: 6]
    [cite_start]{ id: 'doctor', title: 'الطبيب', img: 'doctor.png', icon: 'insight', component: DoctorClinical, pos: { gridColumn: '3', gridRow: '2' } }, [cite: 7]
    [cite_start]{ id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: null, pos: { gridColumn: '2', gridRow: '2' } }, [cite: 6]
    [cite_start]{ id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker, pos: { gridColumn: '3', gridRow: '4' } }, [cite: 6]
    [cite_start]{ id: 'pregnancy', title: 'حمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor, pos: { gridColumn: '2', gridRow: '4' } }, [cite: 6]
    [cite_start]{ id: 'lactation', title: 'الرضاعة', img: 'lactation.png', icon: 'feelings', component: LactationHub, pos: { gridColumn: '1', gridRow: '4' } }, [cite: 7]
  ];

  const styles = {
    container: {
      display: 'grid',
      [cite_start]gridTemplateColumns: 'repeat(3, 1fr)', // ثلاث أعمدة مثل الصورة [cite: 8]
      gridAutoRows: 'minmax(120px, auto)',
      gap: '12px',
      padding: '15px',
      direction: 'rtl',
      background: '#000', // خلفية سوداء لتطابق الصورة
      minHeight: '100vh',
      alignItems: 'center'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.15)', // شفافية خفيفة
      backdropFilter: 'blur(15px)',
      borderRadius: '25px',
      padding: '8px',
      [cite_start]border: '1px solid rgba(255, 255, 255, 0.2)', [cite: 9]
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      overflow: 'hidden',
      aspectRatio: '1 / 1.1' // الحفاظ على شكل متناسق للكارت
    },
    image: {
      width: '90%', // الصورة تأخذ أغلب مساحة الكارت
      height: '75%', 
      objectFit: 'contain',
      borderRadius: '15px'
    },
    labelContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      paddingBottom: '5px'
    },
    title: {
      fontWeight: 'bold',
      color: '#fff', // نص أبيض ليتناسب مع الخلفية السوداء
      fontSize: '0.85rem',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      {sections.map((sec) => {
        [cite_start]const Icon = iconMap[sec.icon] || iconMap.insight; [cite: 10]
        return (
          <div 
            key={sec.id} 
            style={{ ...styles.card, ...sec.pos }}
            [cite_start]onClick={() => setActiveTab(activeTab === sec.id ? null : sec.id)} [cite: 10]
          >
            <img 
              [cite_start]src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} [cite: 11]
              alt={sec.title} 
              style={styles.image} 
            />
            <div style={styles.labelContainer}>
              [cite_start]<Icon size={14} color="#ff8a80" /> [cite: 12]
              [cite_start]<span style={styles.title}>{sec.title}</span> [cite: 12]
            </div>
            
            {activeTab === sec.id && sec.component && (
              <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', zIndex: 100, padding: '20px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                [cite_start]<Suspense fallback={<p>جاري التحميل...</p>}> [cite: 13]
                  <sec.component />
                </Suspense>
                <button onClick={() => setActiveTab(null)} style={{marginTop: '10px', width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#ad1457', color: '#fff'}}>إغلاق</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

[cite_start]export default Health; [cite: 14]
