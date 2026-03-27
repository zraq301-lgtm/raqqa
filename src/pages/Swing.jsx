import React, { useState, useEffect, useCallback } from 'react';
import { CapacitorHttp } from '@capacitor/core'; 
import { CapacitorUpdater } from '@capgo/capacitor-updater';

// استدعاء الصفحات من المسار المحدد: src/pages/SwingPage
import Home from '../pages/SwingPage/Home';
import MotherhoodHaven from '../pages/SwingPage/MotherhoodHaven';
import LittleOnesAcademy from '../pages/SwingPage/LittleOnesAcademy';
import WellnessOasis from '../pages/SwingPage/WellnessOasis';
import EleganceIcon from '../pages/SwingPage/EleganceIcon';
import CulinaryArts from '../pages/SwingPage/CulinaryArts';
import EmpowermentPaths from '../pages/SwingPage/EmpowermentPaths';
import HomeCorners from '../pages/SwingPage/HomeCorners';
import PassionsCrafts from '../pages/SwingPage/PassionsCrafts';
import SoulsLounge from '../pages/SwingPage/SoulsLounge';

const SwingForum = () => {
  // الافتراضي هو صفحة Home
  const [activeTab, setActiveTab] = useState('Home');

  // --- منطق التحديث الهوائي (OTA) المطبق على صفحة الأرجوحة ---
  const syncAppUpdates = useCallback(async () => {
    const BASE_URL = 'https://raw.githubusercontent.com/zraq301-lgtm/raqqa/updates';
    
    try {
      const githubResponse = await CapacitorHttp.get({
        url: `${BASE_URL}/version.json`,
        params: { t: new Date().getTime().toString() },
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      let remoteData = githubResponse.data;
      if (typeof remoteData === 'string') {
        remoteData = JSON.parse(remoteData);
      }

      const latestVersion = parseInt(remoteData.version);
      const currentVersion = parseInt(localStorage.getItem('raqqa_version_build') || '0');

      if (latestVersion > currentVersion) {
        const bundle = await CapacitorUpdater.download({
          url: `${BASE_URL}/update.zip`,
          version: latestVersion.toString(),
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (bundle) {
          localStorage.setItem('raqqa_version_build', latestVersion.toString());
          setTimeout(async () => {
            await CapacitorUpdater.set(bundle); 
            window.location.reload(); 
          }, 1000);
        }
      }
    } catch (err) {
      console.log("SwingForum Update Check: No new updates or offline.");
    }
  }, []);

  useEffect(() => {
    syncAppUpdates();
  }, [syncAppUpdates]);

  // مصفوفة الأقسام
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

  const renderCurrentPage = () => {
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
      <style>{`
        :root {
          --female-pink: #ff4d7d;
          --female-pink-light: rgba(255, 77, 125, 0.15);
          --soft-bg: #fff5f7;
          --glass-white: rgba(255, 255, 255, 0.9);
        }

        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: var(--soft-bg);
          direction: rtl;
          font-family: 'Tajawal', sans-serif;
        }

        .glass-header-nav {
          display: flex;
          overflow-x: auto;
          padding: 15px 10px;
          background: var(--glass-white);
          backdrop-filter: blur(12px);
          border-bottom: 2px solid var(--female-pink-light);
          gap: 12px;
          scrollbar-width: none;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .glass-header-nav::-webkit-scrollbar { display: none; }

        .section-item {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 20px;
          background: white;
          border-radius: 20px;
          border: 1px solid var(--female-pink-light);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section-item.active {
          background: var(--female-pink);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(255, 77, 125, 0.3);
        }

        .section-item.active .s-label, .section-item.active .s-icon {
          color: white;
        }

        .s-icon { font-size: 1.6rem; margin-bottom: 5px; }
        .s-label { font-size: 0.85rem; font-weight: bold; color: var(--female-pink); }

        .forum-banner {
          text-align: center;
          padding: 12px;
          background: #fff;
          color: var(--female-pink);
          font-size: 1.3rem;
          font-weight: 900;
          margin: 0;
          border-bottom: 1px dashed var(--female-pink);
        }

        .main-display-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
      `}</style>

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

      <div className="forum-banner">منتدى الأرجوحة</div>

      <div className="main-display-area">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default SwingForum;
