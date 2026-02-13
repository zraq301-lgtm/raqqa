import React, { useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap'; //

// تصحيح الاستيراد: التأكد من مطابقة أسماء الملفات الموجودة في مجلد HealthPages تماماً
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('./HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('./HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness'));

const Health = () => {
  const [activeTab, setActiveTab] = useState(null);

  // تنسيق الأقسام بناءً على التوزيع المطلوب في الصورة
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
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '15px',
      padding: '20px',
      direction: 'rtl',
      background: '#f9f9f9',
      minHeight: '100vh'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '15px',
      border: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
    },
    image: {
      width: '100px',
      height: '100px',
      objectFit: 'contain',
      marginBottom: '10px'
    }
  };

  return (
    <div style={styles.container}>
      {sections.map((sec) => {
        const Icon = iconMap[sec.icon] || iconMap.insight; //
        return (
          <div 
            key={sec.id} 
            style={{ ...styles.card, ...sec.pos }}
            onClick={() => setActiveTab(activeTab === sec.id ? null : sec.id)}
          >
            <img 
              src={new URL(`../assets/health/${sec.img}`, import.meta.url).href} 
              alt={sec.title} 
              style={styles.image} 
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon size={20} color="#ad1457" />
              <span style={{ fontWeight: 'bold', color: '#333' }}>{sec.title}</span>
            </div>
            
            {activeTab === sec.id && sec.component && (
              <div style={{ marginTop: '20px', width: '100%' }}>
                <Suspense fallback={<p>جاري التحميل...</p>}>
                  <sec.component />
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
