import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sparkles, Heart, Baby, Utensils, Scissors, Home, Star } from 'lucide-react';

// --- مكونات داخلية (بدلاً من الاستيراد الخارجي حالياً) ---
const Placeholder = ({ title, icon: Icon }) => (
  <div style={{ padding: '40px 20px', textAlign: 'center', direction: 'rtl' }}>
    <Icon size={60} color="var(--female-pink)" style={{ marginBottom: '20px' }} />
    <h2 style={{ color: 'var(--female-pink)' }}>{title}</h2>
    <p style={{ color: '#666' }}>هذا القسم قيد التجهيز ليكون الأفضل لكِ..</p>
  </div>
);

// تعريف الأقسام كمكونات بسيطة داخل الملف نفسه
const Motherhood = () => <Placeholder title="ملاذ الأمومة" icon={Baby} />;
const Academy = () => <Placeholder title="أكاديمية الصغار" icon={Star} />;
const Culinary = () => <Placeholder title="فنون الطهي" icon={Utensils} />;
const Elegance = () => <Placeholder title="أيقونة الأناقة" icon={Scissors} />;

const Swing = () => {
  const location = useLocation();
  
  const CATEGORIES = [
    { ar: "الرئيسية", path: "/Swing", component: <div style={{padding: '20px', textAlign: 'center'}}>🏠 الرئيسية تعمل بنجاح!</div> },
    { ar: "ملاذ الأمومة", path: "/MotherhoodHaven", component: <Motherhood /> },
    { ar: "أكاديمية الصغار", path: "/LittleOnesAcademy", component: <Academy /> },
    { ar: "فنون الطهي", path: "/CulinaryArts", component: <Culinary /> },
    { ar: "أيقونة الأناقة", path: "/EleganceIcon", component: <Elegance /> },
  ];

  return (
    <div style={{ direction: 'rtl', backgroundColor: 'var(--soft-bg)', minHeight: '100vh' }}>
      {/* هيدر ثابت */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '65px',
        backgroundColor: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: '2px solid var(--female-pink-light)'
      }}>
        <div style={{ color: 'var(--female-pink)', fontSize: '24px', fontWeight: '900' }}>رقة</div>
        <div style={{ color: 'var(--female-pink)' }}><Sparkles /></div>
      </header>

      {/* قائمة التنقل */}
      <nav style={{
        position: 'fixed', top: '65px', left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--female-pink-light)', padding: '12px 0', overflowX: 'auto', 
        display: 'flex', zIndex: 1050, whiteSpace: 'nowrap'
      }}>
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.path}
            style={{
              textDecoration: 'none', padding: '8px 20px', margin: '0 5px',
              borderRadius: '20px', fontSize: '14px', fontWeight: 'bold',
              color: location.pathname === cat.path ? '#fff' : 'var(--female-pink)',
              backgroundColor: location.pathname === cat.path ? 'var(--female-pink)' : '#fff',
              border: '1px solid var(--female-pink)'
            }}
          >
            {cat.ar}
          </Link>
        ))}
      </nav>

      {/* عرض المحتوى */}
      <main style={{ paddingTop: '150px', paddingBottom: '100px' }}>
        <Routes>
          {CATEGORIES.map((cat, i) => (
            <Route key={i} path={cat.path} element={cat.component} />
          ))}
          {/* مسار افتراضي لكي لا تظهر صفحة بيضاء */}
          <Route path="*" element={<div style={{textAlign:'center', padding:'20px'}}>مرحباً بكِ في رقة ✨</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default Swing;
