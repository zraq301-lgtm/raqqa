import React, { useState, useEffect, useCallback } from 'react';
import { CapacitorHttp } from '@capacitor/core'; 
import { CapacitorUpdater } from '@capgo/capacitor-updater';

// استدعاء الصفحات
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
  const [activeTab, setActiveTab] = useState('Home');
  const [isUpdating, setIsUpdating] = useState(false); // حالة لمعرفة إذا كان جاري التحديث
  const currentBuildVersion = localStorage.getItem('raqqa_version_build') || '1';

  // دالة الفحص والتحديث (تمت إضافة setIsUpdating لإعطاء مؤشر للمستخدم)
  const syncAppUpdates = useCallback(async (isManual = false) => {
    if (isManual) setIsUpdating(true);
    const BASE_URL = 'https://raw.githubusercontent.com/zraq301-lgtm/raqqa/updates';
    
    try {
      const githubResponse = await CapacitorHttp.get({
        url: `${BASE_URL}/version.json`,
        params: { t: new Date().getTime().toString() }, // منع الكاش
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      let remoteData = githubResponse.data;
      if (typeof remoteData === 'string') remoteData = JSON.parse(remoteData);

      const latestVersion = parseInt(remoteData.version);
      const currentVersion = parseInt(localStorage.getItem('raqqa_version_build') || '0');

      if (latestVersion > currentVersion) {
        const bundle = await CapacitorUpdater.download({
          url: `${BASE_URL}/update.zip`,
          version: latestVersion.toString(),
        });

        if (bundle) {
          localStorage.setItem('raqqa_version_build', latestVersion.toString());
          await CapacitorUpdater.set(bundle); 
          window.location.reload(); 
        }
      } else {
        if (isManual) alert("تطبيق رقة محدث بالفعل لأخر إصدار ✅");
      }
    } catch (err) {
      console.log("Update Error:", err);
      if (isManual) alert("عذراً، تعذر الاتصال بسيرفر التحديث حالياً.");
    } finally {
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    syncAppUpdates();
  }, [syncAppUpdates]);

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

        .app-container { display: flex; flex-direction: column; height: 100vh; background-color: var(--soft-bg); direction: rtl; font-family: 'Tajawal', sans-serif; }
        .glass-header-nav { display: flex; overflow-x: auto; padding: 15px 10px; background: var(--glass-white); backdrop-filter: blur(12px); border-bottom: 2px solid var(--female-pink-light); gap: 12px; position: sticky; top: 0; z-index: 1000; }
        .section-item { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; padding: 10px 20px; background: white; border-radius: 20px; border: 1px solid var(--female-pink-light); cursor: pointer; transition: 0.3s; }
        .section-item.active { background: var(--female-pink); transform: translateY(-3px); box-shadow: 0 5px 15px rgba(255, 77, 125, 0.3); }
        .section-item.active .s-label, .section-item.active .s-icon { color: white; }
        .s-icon { font-size: 1.6rem; margin-bottom: 5px; }
        .s-label { font-size: 0.85rem; font-weight: bold; color: var(--female-pink); }
        .forum-banner { text-align: center; padding: 12px; background: #fff; color: var(--female-pink); font-size: 1.3rem; font-weight: 900; border-bottom: 1px dashed var(--female-pink); }
        .main-display-area { flex: 1; overflow-y: auto; padding: 20px; }

        /* ستايل شريط التحديث اليدوي */
        .update-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 15px;
          background: white;
          border-top: 1px solid #eee;
        }
        .version-text { font-size: 10px; color: #888; }
        .update-btn {
          background: var(--female-pink-light);
          color: var(--female-pink);
          border: none;
          padding: 5px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
        }
        .update-btn:active { transform: scale(0.95); background: var(--female-pink); color: white; }
      `}</style>

      <nav className="glass-header-nav">
        {sections.map((sec) => (
          <div key={sec.id} className={`section-item ${activeTab === sec.id ? 'active' : ''}`} onClick={() => setActiveTab(sec.id)}>
            <span className="s-icon">{sec.icon}</span>
            <span className="s-label">{sec.label}</span>
          </div>
        ))}
      </nav>

      <div className="forum-banner">منتدى الأرجوحة</div>

      <div className="main-display-area">
        {renderCurrentPage()}
      </div>

      {/* شريط الإصدار مع زر التحديث اليدوي */}
      <footer className="update-footer">
        <span className="version-text">رقة - بناء: {currentBuildVersion}</span>
        <button 
          className="update-btn" 
          onClick={() => syncAppUpdates(true)}
          disabled={isUpdating}
        >
          {isUpdating ? "جاري الفحص..." : "فحص التحديثات ✨"}
        </button>
      </footer>
    </div>
  );
};

export default SwingForum;
