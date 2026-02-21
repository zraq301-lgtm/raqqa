import React, { useState } from 'react';

// استدعاء الصفحات من نفس المجلد الحالي src/pages/
import Home from './Home';
import MotherhoodHaven from './MotherhoodHaven';
import LittleOnesAcademy from './LittleOnesAcademy';
import WellnessOasis from './WellnessOasis';
import EleganceIcon from './EleganceIcon';
import CulinaryArts from './CulinaryArts';
import EmpowermentPaths from './EmpowermentPaths';
import HomeCorners from './HomeCorners';
import PassionsCrafts from './PassionsCrafts';
import SoulsLounge from './SoulsLounge';

const SwingPage = () => {
  // الحالة الافتراضية لفتح صفحة Home
  const [activeTab, setActiveTab] = useState('Home');

  // قائمة الأقسام مع الأيقونات
  const sections = [
    { id: 'Home', label: 'الرئيسية', icon: '🏠' },
    { id: 'MotherhoodHaven', label: 'ملاذ الأمومة', icon: '🍼' },
    { id: 'LittleOnesAcademy', label: 'أكاديمية الصغار', icon: '🧸' },
    { id: 'WellnessOasis', label: 'واحة العافية', icon: '🌿' },
    { id: 'EleganceIcon', label: 'أيقونة الأناقة', icon: '👗' },
    { id: 'CulinaryArts', label: 'فنون الطهي', icon: '🍳' },
    { id: 'EmpowermentPaths', label: 'دروب التمكين', icon: '🚀' },
    { id: 'HomeCorners', label: 'زوايا المنزل', icon: '🏡' },
    { id: 'PassionsCrafts', label: 'شغف وحرف', icon: '🎨' },
    { id: 'SoulsLounge', label: 'رواق الأرواح', icon: '✨' },
  ];

  // دالة التبديل بين المكونات
  const renderPage = () => {
    switch (activeTab) {
      case 'Home': return <Home />;
      case 'MotherhoodHaven': return <MotherhoodHaven />;
      case 'LittleOnesAcademy': return <LittleOnesAcademy />;
      case 'WellnessOasis': return <WellnessOasis />;
      case 'EleganceIcon': return <EleganceIcon />;
      case 'CulinaryArts': return <CulinaryArts />;
      case 'EmpowermentPaths': return <EmpowermentPaths />;
      case 'HomeCorners': return <HomeCorners />;
      case 'PassionsCrafts': return <PassionsCrafts />;
      case 'SoulsLounge': return <SoulsLounge />;
      default: return <Home />;
    }
  };

  return (
    <div className="app-container">
      {/* دمج تنسيقات CSS الحيوية والأنثوية */}
      <style>{`
        :root {
          --female-pink: #ff4d7d;
          --female-pink-light: rgba(255, 77, 125, 0.15);
          --soft-bg: #fff5f7;
          --glass-white: rgba(255, 255, 255, 0.9);
        }

        body {
          margin: 0;
          background-color: var(--soft-bg);
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
        }

        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        /* شريط الأيقونات الزجاجي العلوي */
        .glass-nav-bar {
          display: flex;
          overflow-x: auto;
          padding: 12px 8px;
          background: var(--glass-white);
          backdrop-filter: blur(10px);
          border-bottom: 2px solid var(--female-pink-light);
          gap: 10px;
          scrollbar-width: none; 
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .glass-nav-bar::-webkit-scrollbar { display: none; }

        .nav-pill {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 18px;
          background: white;
          border-radius: 25px;
          border: 1px solid var(--female-pink-light);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-pill.active {
          background: var(--female-pink);
          box-shadow: 0 4px 15px rgba(255, 77, 125, 0.3);
          transform: translateY(-2px);
        }

        .nav-pill.active .pill-label, .nav-pill.active .pill-icon {
          color: white;
        }

        .pill-icon { font-size: 1.4rem; margin-bottom: 4px; }
        .pill-label { font-size: 0.8rem; font-weight: bold; color: var(--female-pink); }

        .forum-header-title {
          text-align: center;
          margin: 0;
          padding: 15px 0;
          color: var(--female-pink);
          font-weight: 800;
          background: linear-gradient(to bottom, #ffffff, var(--soft-bg));
          border-bottom: 1px dashed var(--female-pink);
        }

        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: var(--soft-bg);
        }
      `}</style>

      {/* شريط التنقل العلوي الزجاجي */}
      <nav className="glass-nav-bar">
        {sections.map((item) => (
          <div 
            key={item.id} 
            className={`nav-pill ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="pill-icon">{item.icon}</span>
            <span className="pill-label">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* اسم المنتدى أسفل شريط الأقسام */}
      <h1 className="forum-header-title">منتدي الأرجوحة</h1>

      {/* عرض الصفحة المستدعاة */}
      <div className="content-area">
        {renderPage()}
      </div>
    </div>
  );
};

export default SwingPage;
