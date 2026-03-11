import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { App as CapApp } from '@capacitor/app'; 
import { CapacitorHttp } from '@capacitor/core'; 

// استيراد الصور من مجلد الأصول (Assets)
import healthImg from './assets/health.jpg';
import feelingsImg from './assets/feelings.jpg';
import intimacyImg from './assets/intimacy.jpg';
import swingImg from './assets/swing.jpg';
import insightImg from './assets/insight.jpg';
import videosImg from './assets/videos.jpg';
import virtualImg from './assets/virtual.jpg';

// استيراد الصفحات والمكونات
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';

import './App.css';

// وظيفة لضمان صعود التمرير للأعلى عند تغيير الصفحة
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, [pathname]);
  return null;
}

// --- مكون النصيحة العشوائية (TipOverlay) المطور ليدعم (نص/صورة/فيديو) ---
function TipOverlay() {
  const [tip, setTip] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const checkAndShowTip = async () => {
      const today = new Date().toLocaleDateString();
      const tipData = JSON.parse(localStorage.getItem('raqqa_tip_tracker') || '{"date":"","count":0}');
      
      if (tipData.date !== today) {
        tipData.date = today;
        tipData.count = 0;
      }

      if (tipData.count < 2) {
        try {
          const response = await fetch('https://raqqa-ruddy.vercel.app/api/tips');
          const data = await response.json();
          if (data.content) {
            setTip(data.content);
            setIsVisible(true);
            
            tipData.count += 1;
            localStorage.setItem('raqqa_tip_tracker', JSON.stringify(tipData));

            // إخفاء تلقائي بعد 20 ثانية
            setTimeout(() => setIsVisible(false), 20000);
          }
        } catch (err) {
          console.error("Tip Fetch Error:", err);
        }
      }
    };

    checkAndShowTip();
  }, [pathname]);

  if (!isVisible || !tip) return null;

  // دالة لتحديد نوع المحتوى ورسمه
  const renderContent = () => {
    const content = tip.trim();
    
    // 1. تحقق من روابط الصور
    if (content.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <img src={content} alt="رقة نصيحة" className="tip-media-content" />;
    }
    
    // 2. تحقق من روابط اليوتيوب (فيديو قصير)
    if (content.includes('youtube.com') || content.includes('youtu.be')) {
      let videoId = content.split('v=')[1] || content.split('/').pop();
      if (videoId.includes('&')) videoId = videoId.split('&')[0];
      return (
        <div className="tip-video-wrapper">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
            title="فيديو رقة"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // 3. الافتراضي هو "نص"
    return <p className="tip-text-content">{tip}</p>;
  };

  return (
    <div 
      className="tip-card-overlay" 
      onClick={() => setIsVisible(false)}
      onPointerMove={(e) => {
        // إذا سحب المستخدم إصبعه لمسافة جانبية يختفي الكارت
        if (Math.abs(e.movementX) > 10) setIsVisible(false);
      }}
    >
      <div className="tip-card-content">
        <div className="tip-header">
          <span className="tip-icon">💡 إشراقة رقة</span>
          <button className="tip-close-btn">×</button>
        </div>
        
        <div className="tip-body">
          {renderContent()}
        </div>

        <div className="tip-timer-bar"></div>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    const setupBackButton = async () => {
      const backButtonListener = await CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) { 
          CapApp.exitApp(); 
        } else { 
          window.history.back(); 
        }
      });
      return backButtonListener;
    };
    const listener = setupBackButton();
    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  return (
    <div className="app-container">
      <ScrollToTop />
      <TipOverlay />
      
      <header className="top-sticky-menu">
        <div className="top-cards-container">
          <Link to="/videos" className="top-card">
            <img src={videosImg} alt="المكتبة" className="custom-img-icon" />
            <div className="card-text">
              <span className="card-label">المكتبة</span>
            </div>
          </Link>

          <Link to="/virtual-world" className="top-card">
            <img src={virtualImg} alt="عالم رقة" className="custom-img-icon" />
            <div className="card-text">
              <span className="card-label">عالم رقة</span>
            </div>
          </Link>
        </div>
      </header>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/health" />} />
          <Route path="/health" element={<Health />} />
          <Route path="/feelings" element={<Feelings />} />
          <Route path="/intimacy" element={<Intimacy />} />
          <Route path="/swing-forum" element={<Swing />} />
          <Route path="/insight" element={<Insight />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/virtual-world" element={<VirtualWorld />} />
        </Routes>
      </main>

      <nav className="bottom-sticky-menu">
        <div className="nav-grid">
          <Link to="/feelings" className="nav-item">
            <img src={feelingsImg} alt="المشاعر" className="custom-img-icon-nav" />
            <span className="nav-label">المشاعر</span>
          </Link>

          <Link to="/intimacy" className="nav-item">
            <img src={intimacyImg} alt="الحميمية" className="custom-img-icon-nav" />
            <span className="nav-label">الحميمية</span>
          </Link>
          
          <Link to="/health" className="nav-item center-action">
            <div className="center-circle">
              <img src={healthImg} alt="صحتك" className="custom-img-icon-main" />
            </div>
            <span className="nav-label bold">صحتك</span>
          </Link>

          <Link to="/swing-forum" className="nav-item">
            <img src={swingImg} alt="الأرجوحة" className="custom-img-icon-nav" />
            <span className="nav-label">الأرجوحة</span>
          </Link>

          <Link to="/insight" className="nav-item">
            <img src={insightImg} alt="القفقة" className="custom-img-icon-nav" />
            <span className="nav-label">القفقة</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default App;
