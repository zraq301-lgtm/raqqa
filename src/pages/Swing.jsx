import React, { useState } from 'react';

// استيراد المكونات (تأكد من صحة المسارات في مشروعك)
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

const ForumApp = () => {
  // الحالة الافتراضية هي صفحة Home كما طلبت
  const [activeTab, setActiveTab] = useState('Home');

  // مصفوفة الأقسام لتوليد القائمة ديناميكياً
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

  // دالة عرض الصفحة المختارة
  const renderContent = () => {
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
      {/* دمج الـ CSS مباشرة في المكون */}
      <style>{`
        :root {
          --female-pink: #ff4d7d;
          --female-pink-light: rgba(255, 77, 125, 0.15);
          --soft-bg: #fff5f7;
          --text-gray: #555;
          --glass-white: rgba(255, 255, 255, 0.85);
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

        /* شريط الأقسام العلوي الزجاجي */
        .top-navbar-scroll {
          display: flex;
          overflow-x: auto;
          padding: 15px 10px;
          background: var(--glass-white);
          backdrop-filter: blur(15px);
          border-bottom: 2px solid var(--female-pink-light);
          gap: 12px;
          scrollbar-width: none; /* إخفاء شريط التمرير */
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .top-navbar-scroll::-webkit-scrollbar {
          display: none;
        }

        .nav-card {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 15px;
          background: white;
          border-radius: 20px;
          border: 1px solid var(--female-pink-light);
          cursor: pointer;
          transition: 0.3s;
          min-width: 80px;
        }

        .nav-card.active {
          background: var(--female-pink);
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(255, 77, 125, 0.3);
        }

        .nav-card.active .nav-label, .nav-card.active .nav-icon {
          color: white;
        }

        .nav-icon {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }

        .nav-label {
          font-size: 0.75rem;
          font-weight: bold;
          color: var(--female-pink);
          white-space: nowrap;
        }

        .forum-title {
          text-align: center;
          padding: 10px;
          color: var(--female-pink);
          font-weight: bold;
          font-size: 1.2rem;
          background: white;
          margin: 0;
          border-bottom: 1px dashed var(--female-pink-light);
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          padding-bottom: 40px;
        }
      `}</style>

      {/* شريط الأقسام العلوي */}
      <div className="top-navbar-scroll">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className={`nav-card ${activeTab === section.id ? 'active' : ''}`}
            onClick={() => setActiveTab(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </div>
        ))}
      </div>

      {/* عنوان المنتدى أسفل الأقسام */}
      <h2 className="forum-title">منتدي الأرجوحة</h2>

      {/* منطقة عرض المحتوى المستدعى */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default ForumApp;
