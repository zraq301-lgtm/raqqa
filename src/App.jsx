import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react'; 
import { App as CapApp } from '@capacitor/app'; 
import { CapacitorHttp } from '@capacitor/core'; 
import { LocalNotifications } from '@capacitor/local-notifications'; 

// استيراد مكون الإعلان الجديد
import AdBanner from './components/AdBanner';

// استيراد خاصية فيربيس
import { applyRemoteSettings } from "./firebase-config";

// استيراد الأصول (Assets)
import healthImg from './assets/health.jpg';
import feelingsImg from './assets/feelings.jpg';
import intimacyImg from './assets/intimacy.jpg';
import swingImg from './assets/swing.jpg';
import insightImg from './assets/insight.jpg';
import videosImg from './assets/videos.jpg';
import virtualImg from './assets/virtual.jpg';

// استيراد الصفحات
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';

import './App.css';

/**
 * وظيفة لضمان صعود التمرير للأعلى عند تغيير الصفحة
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, [pathname]);
  return null;
}

/**
 * مكون النصيحة الذكية (TipOverlay)
 */
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

  const renderContent = () => {
    const content = tip.trim();
    if (content.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <img src={content} alt="رقة نصيحة" className="tip-media-content" />;
    }
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
    return <p className="tip-text-content">{tip}</p>;
  };

  return (
    <div className="tip-card-overlay" onClick={() => setIsVisible(false)}>
      <div className="tip-card-content" onClick={(e) => e.stopPropagation()}>
        <div className="tip-header">
          <span className="tip-icon">💡 إشراقة رقة</span>
          <button className="tip-close-btn" onClick={() => setIsVisible(false)}>×</button>
        </div>
        <div className="tip-body">{renderContent()}</div>
        <div className="tip-timer-bar"></div>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();

  useEffect(() => {
    applyRemoteSettings();
  }, []);

  // --- نظام المزامنة والجدولة المحلية المتطور ---
  const syncNotifications = useCallback(async () => {
    try {
      const localData = localStorage.getItem('raqqa_local_reminders');
      if (!localData) return;

      const reminders = JSON.parse(localData);

      const perms = await LocalNotifications.checkPermissions();
      if (perms.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const notificationsToSchedule = reminders
        .filter(rem => new Date(rem.scheduled_for) > new Date())
        .map(rem => ({
          id: Math.floor(Math.random() * 1000000),
          title: rem.title,
          body: rem.body, // هنا يتم تمرير التقارير الطويلة
          schedule: { at: new Date(rem.scheduled_for) },
          sound: 'default', // تفعيل التنبيه الصوتي الافتراضي للأندرويد
          attachments: rem.image_url ? [{ id: 'res', url: rem.image_url }] : [],
          extra: { report: rem.body },
          smallIcon: 'ic_stat_name',
          actionTypeId: ''
        }));

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        console.log("✅ تمت جدولة التقارير الذكية مع الصوت بنجاح");
      }
    } catch (err) {
      console.error("Local Notification Sync Error:", err);
    }
  }, []);

  useEffect(() => {
    syncNotifications();

    // الاستماع لحدث الحفظ الفوري من الأقسام
    const handleTrigger = () => {
      console.log("🔔 استقبال طلب مزامنة فوري للتقرير...");
      syncNotifications();
    };
    window.addEventListener('trigger_sync_notifications', handleTrigger);

    const setupBackButton = async () => {
      return await CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) { 
          CapApp.exitApp(); 
        } else { 
          window.history.back(); 
        }
      });
    };
    const listener = setupBackButton();
    
    return () => { 
      window.removeEventListener('trigger_sync_notifications', handleTrigger);
      listener.then(l => l.remove()); 
    };
  }, [syncNotifications, location.pathname]);

  return (
    <div className="app-container">
      <ScrollToTop />
      <TipOverlay />
      
      <header className="main-app-header" style={{ backgroundColor: '#fff', padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
        <a 
          href="https://www.facebook.com/profile.php?id=61571056531349" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: '#1877F2', fontWeight: 'bold', fontSize: '16px' }}
        >
          تواصل معنا
        </a>
      </header>

      <div className="global-ad-container" style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <AdBanner />
      </div>
      
      <header className="top-sticky-menu">
        <div className="top-cards-container">
          <Link to="/videos" className="top-card">
            <img src={videosImg} alt="المكتبة" className="custom-img-icon" />
            <div className="card-text"><span className="card-label">المكتبة</span></div>
          </Link>
          <Link to="/virtual-world" className="top-card">
            <img src={virtualImg} alt="عالم رقة" className="custom-img-icon" />
            <div className="card-text"><span className="card-label">عالم رقة</span></div>
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
