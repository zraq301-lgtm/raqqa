import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap';
import RecentContentFeed from '../components/RecentContentFeed';
const MenstrualTracker = lazy(() => import('./HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('./HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('./HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('./HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('./HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('./HealthPages/FitnessWellness'));
const Motherhood = lazy(() => import('./HealthPages/Motherhood'));
const sections = [
  { id: 'menstrual', title: 'الحيض', img: 'menstrual.png', icon: 'health', component: MenstrualTracker },
  { id: 'advice', title: 'نصيحة طبيب', img: 'advice.png', icon: 'chat', component: Advice },
  { id: 'pregnancy', title: 'الحمل', img: 'pregnancy.png', icon: 'intimacy', component: PregnancyMonitor },
  { id: 'motherhood', title: 'الأمومة', img: 'motherhood.png', icon: 'feelings', component: Motherhood },
  { id: 'doctor', title: 'الطبيب', img: 'doctor.png', icon: 'insight', component: DoctorClinical },
  { id: 'fitness', title: 'الرشاقة', img: 'fitness.png', icon: 'health', component: FitnessWellness },
  { id: 'lactation', title: 'الرضاعة', img: 'lactation.png', icon: 'feelings', component: LactationHub },
];
export default function Health({ onSyncReminders }) {
  const [activeTab, setActiveTab] = useState(null);
  const railRef = useRef(null);
  const pausedRef = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current || !railRef.current) return;
      const rail = railRef.current;
      const card = rail.querySelector('.health-promo-card');
      const step = (card?.getBoundingClientRect().width || 220) + 12;
      const atEnd = rail.scrollLeft <= -(rail.scrollWidth - rail.clientWidth - 8);
      rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft - step, behavior: 'smooth' });
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const handleTriggerSync = () => {
    window.dispatchEvent(new Event('trigger_sync_notifications'));
    if (typeof onSyncReminders === 'function') onSyncReminders();
  };
  if (activeTab) {
    const activeSection = sections.find((section) => section.id === activeTab);
    return <div className="health-fullscreen-page">
      <button className="health-back-button" onClick={() => setActiveTab(null)}>عودة</button>
      <Suspense fallback={<p className="health-loading">جاري التحميل...</p>}>
        {activeSection && <activeSection.component onNotificationSync={handleTriggerSync} />}
      </Suspense>
    </div>;
  }
  return <section className="health-page" dir="rtl">
    <div className="health-heading"><div><span>مساحتك اليومية</span><h1>صحتك</h1></div><span className="health-swipe-hint">اسحبي للتصفح</span></div>
    <div className="health-promo-rail" ref={railRef} onPointerDown={() => { pausedRef.current = true; }} onPointerUp={() => { pausedRef.current = false; }} onPointerCancel={() => { pausedRef.current = false; }}>
      {sections.map((section) => {
        const Icon = iconMap[section.icon] || iconMap.insight;
        const imageSource = new URL(`../assets/health/${section.img}`, import.meta.url).href;
        return <button className="health-promo-card" key={section.id} onClick={() => setActiveTab(section.id)}>
          <img src={imageSource} alt={section.title} /><span className="health-promo-overlay" />
          <span className="health-promo-copy"><Icon size={17} /><strong>{section.title}</strong><small>اكتشفي المزيد</small></span>
        </button>;
      })}
    </div>
    <div className="health-dots" aria-hidden="true">{sections.map((section, index) => <span key={section.id} className={index === 0 ? 'active' : ''} />)}</div>
    <RecentContentFeed />
  </section>;
}
