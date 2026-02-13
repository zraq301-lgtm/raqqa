import React, { useState, useEffect, Suspense, lazy } from 'react';
import { iconMap } from '../constants/iconMap';

// استيراد المكونات ديناميكياً من مسار src/pages/HealthPages بناءً على أسماء الملفات في الصورة الثانية
const MenstrualTracker = lazy(() => import('../pages/HealthPages/MenstrualTracker'));
const Advice = lazy(() => import('../pages/HealthPages/Advice'));
const PregnancyMonitor = lazy(() => import('../pages/HealthPages/PregnancyMonitor'));
const LactationHub = lazy(() => import('../pages/HealthPages/LactationHub'));
const DoctorClinical = lazy(() => import('../pages/HealthPages/DoctorClinical'));
const FitnessWellness = lazy(() => import('../pages/HealthPages/FitnessWellness'));
const BeautyAesthetics = lazy(() => import('../pages/HealthPages/BeautyAesthetics'));

// مخرن للمكونات لتسهيل استدعائها داخل الكرت
const PageComponents = {
  MenstrualTracker,
  Advice,
  PregnancyMonitor,
  LactationHub,
  DoctorClinical,
  FitnessWellness,
  BeautyAesthetics
};

const SectionCard = ({ title, iconKey, imageName, gridStyle, componentName }) => {
  const Icon = iconMap[iconKey] || iconMap.insight;
  const SelectedPage = PageComponents[componentName];
  const [showDetails, setShowDetails] = useState(false);

  // ستايل الكرت الزجاجي المدمج
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    ...gridStyle
  };

  return (
    <div style={cardStyle} onClick={() => setShowDetails(!showDetails)}>
      {/* استدعاء الصور من مسار src/assets/health بناءً على الصورة الأولى */}
      <img 
        src={require(`../assets/health/${imageName}.png`)} 
        alt={title}
        style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '15px' }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ad1457' }}>
        <Icon size={22} />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
      </div>

      {/* عرض الصفحة المخصصة عند النقر */}
      {showDetails && (
        <div style={{ marginTop: '15px', width: '100%', textAlign: 'right' }}>
          <Suspense fallback={<div>جاري التحميل...</div>}>
            <SelectedPage />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default function HealthDashboard() {
  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    padding: '30px',
    direction: 'rtl',
    background: 'linear-gradient(135deg, #fce4ec 0%, #e1f5fe 100%)',
    minHeight: '100vh'
  };

  return (
    <div style={containerStyle}>
      {/* الترتيب حسب طلبك: الحيض -> نصيحة -> حمل */}
      <SectionCard 
        title="متابعة الحيض" 
        imageName="menstrual" 
        iconKey="health" 
        componentName="MenstrualTracker"
      />
      <SectionCard 
        title="نصيحة طبيب" 
        imageName="advice" 
        iconKey="chat" 
        componentName="Advice"
      />
      <SectionCard 
        title="متابعة الحمل" 
        imageName="pregnancy" 
        iconKey="intimacy" 
        componentName="PregnancyMonitor"
      />

      {/* الوسط: الأمومة */}
      <SectionCard 
        title="الأمومة" 
        imageName="motherhood" 
        iconKey="feelings" 
        gridStyle={{ gridColumn: '2' }}
        componentName="BeautyAesthetics" // تم ربطها كأقرب تمثيل للأناقة/الأمومة في صفحاتك
      />

      {/* الصف السفلي: الطبيب -> الرشاقة -> الرضاعة */}
      <SectionCard 
        title="متابعة الطبيب" 
        imageName="doctor" 
        iconKey="insight" 
        componentName="DoctorClinical"
      />
      <SectionCard 
        title="الرشاقة" 
        imageName="fitness" 
        iconKey="health" 
        componentName="FitnessWellness"
      />
      <SectionCard 
        title="نظام الرضاعة" 
        imageName="lactation" 
        iconKey="feelings" 
        componentName="LactationHub"
      />
    </div>
  );
}
