import React, { useState, useEffect, useCallback } from 'react';
import { CapacitorHttp } from '@capacitor/core'; 

// استدعاء مكون الإعلان
import AdBanner from '../components/AdBanner';

// استدعاء الصفحات بناءً على القائمة الموجودة
import Home from '../pages/SwingPage/Home';
import CulinaryArts from '../pages/SwingPage/CulinaryArts';
import EleganceIcon from '../pages/SwingPage/EleganceIcon';
import EmpowermentPaths from '../pages/SwingPage/EmpowermentPaths';
import HomeCorners from '../pages/SwingPage/HomeCorners';
import LittleOnesAcademy from '../pages/SwingPage/LittleOnesAcademy';
import MotherhoodHaven from '../pages/SwingPage/MotherhoodHaven';
import PassionsCrafts from '../pages/SwingPage/PassionsCrafts';
import SoulsLounge from '../pages/SwingPage/SoulsLounge';
import WellnessOasis from '../pages/SwingPage/WellnessOasis';

const SwingForum = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [isUpdating, setIsUpdating] = useState(false); 
  const currentBuildVersion = localStorage.getItem('raqqa_version_build') || '1.0.2';

  // ترتيب الأيقونات والمسميات
  const sections = [
    { id: 'Home', label: 'الرئيسية', icon: '🏠' },
    { id: 'EleganceIcon', label: 'أيقونة الأناقة', icon: '✨' },
    { id: 'PassionsCrafts', label: 'شغف وحرف', icon: '🎨' },
    { id: 'MotherhoodHaven', label: 'ملاذ الأمومة', icon: '🍼' },
    { id: 'WellnessOasis', label: 'واحة العافية', icon: '🌿' },
    { id: 'CulinaryArts', label: 'فنون الطهي', icon: '🍳' },
    { id: 'EmpowermentPaths', label: 'دروب التمكين', icon: '🚀' },
    { id: 'HomeCorners', label: 'زوايا المنزل', icon: '🏡' },
    { id: 'SoulsLounge', label: 'رواق الأرواح', icon: '🌙' },
  ];

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'Home': return <Home />;
      case 'EleganceIcon': return <EleganceIcon />;
      case 'PassionsCrafts': return <PassionsCrafts />;
      case 'MotherhoodHaven': return <MotherhoodHaven />;
      case 'WellnessOasis': return <WellnessOasis />;
      case 'CulinaryArts': return <CulinaryArts />;
      case 'EmpowermentPaths': return <EmpowermentPaths />;
      case 'HomeCorners': return <HomeCorners />;
      case 'SoulsLounge': return <SoulsLounge />;
      default: return <Home />;
    }
  };

  return (
    <div className="app-container">
      <style>{`
        :root {
          --female-pink: #ff4d7d;
          --female-pink-light: rgba(255, 77, 125, 0.15);
          --soft-bg: #fff5f7;
          --glass-white: rgba(255, 255, 255, 0.95);
        }
        .app-container { 
          display: flex; 
          flex-direction: column; 
          height: 100vh; 
          width: 100vw; 
          background-color: var(--soft-bg); 
          direction: rtl; 
          font-family: 'Tajawal', sans-serif; 
          position: fixed; 
          top: 0; 
          left: 0; 
          overflow: hidden; 
        }
        
        .top-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: white; border-bottom: 1px solid var(--female-pink-light); z-index: 100; }
        .back-btn { background: var(--female-pink); color: white; border: none; padding: 7px 18px; border-radius: 12px; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 8px rgba(255, 77, 125, 0.2); }
        
        .glass-header-nav { display: flex; overflow-x: auto; padding: 12px 10px; background: var(--glass-white); backdrop-filter: blur(15px); border-bottom: 1px solid var(--female-pink-light); gap: 10px; scrollbar-width: none; flex-shrink: 0; }
        .glass-header-nav::-webkit-scrollbar { display: none; }

        .section-item { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; padding: 8px 16px; background: white; border-radius: 16px; border: 1px solid var(--female-pink-light); cursor: pointer; transition: 0.3s; min-width: 85px; }
        .section-item.active { background: var(--female-pink); transform: scale(1.05); }
        .section-item.active .s-label, .section-item.active .s-icon { color: white; }
        
        .s-icon { font-size: 1.3rem; margin-bottom: 2px; }
        .s-label { font-size: 0.7rem; font-weight: bold; color: var(--female-pink); }
        
        .main-display-area { flex: 1; overflow-y: auto; padding: 15px; position: relative; }

        /* تنسيق حاوية الإعلان (تم تعديل الحواف لتناسب الأعلى) */
        .ad-wrapper {
          width: 100%;
          background: white;
          padding: 5px 0;
          border-bottom: 1px solid var(--female-pink-light);
          display: flex;
          justify-content: center;
          flex-shrink: 0;
        }

        .update-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: white; border-top: 1px solid #eee; font-size: 10px; color: #888; flex-shrink: 0; }
      `}</style>

      {/* شريط علوي */}
      <header className="top-bar">
        <button className="back-btn" onClick={() => window.location.href = "/"}>
          <span>🔙</span> خروج
        </button>
        <span style={{ fontWeight: '900', color: '#ff4d7d', fontSize: '1.2rem' }}>رقة</span>
        <div style={{ width: '40px' }}></div>
      </header>

      {/* مساحة إعلانية بالأعلى (تم نقلها هنا) */}
      <div className="ad-wrapper">
        <AdBanner />
      </div>

      {/* التنقل العلوي */}
      <nav className="glass-header-nav">
        {sections.map((sec) => (
          <div 
            key={sec.id} 
            className={`section-item ${activeTab === sec.id ? 'active' : ''}`} 
            onClick={() => setActiveTab(sec.id)}
          >
            <span className="s-icon">{sec.icon}</span>
            <span className="s-label">{sec.label}</span>
          </div>
        ))}
      </nav>

      {/* منطقة العرض الرئيسية */}
      <div className="main-display-area">
        {renderCurrentPage()}
      </div>

      {/* الفوتر */}
      <footer className="update-footer">
        <span>نسخة رقة: {currentBuildVersion}</span>
        <span>صنع بكل حب لـ رقة ✨</span>
      </footer>
    </div>
  );
};

export default SwingForum;
