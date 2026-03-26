import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react'; 
import { App as CapApp } from '@capacitor/app'; 
import { CapacitorHttp } from '@capacitor/core'; 
import { LocalNotifications } from '@capacitor/local-notifications'; 

// استبدال المكتبة بمكتبة التحديث الذاتي الموثوقة
import { CapacitorUpdater } from '@capgo/capacitor-updater';

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
 * وظيفة لضمان صعود التمرير للأعلى عند تغيير الصفحة لتعزيز تجربة المستخدم
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, [pathname]);
  return null;
}

/**
 * مكون النصيحة الذكية (TipOverlay) - يدعم النصوص، الصور، وفيديوهات اليوتيوب
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
            // إخفاء التنبيه تلقائياً بعد 20 ثانية
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
    // التحقق إذا كان المحتوى صورة
    if (content.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <img src={content} alt="رقة نصيحة" className="tip-media-content" />;
    }
    // التحقق إذا كان المحتوى فيديو يوتيوب
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
  // --- [النظام الاحترافي] مزامنة التحديثات من فرع Updates المخصص ---
  const syncAppUpdates = useCallback(async () => {
    const BASE_URL = 'https://raw.githubusercontent.com/zraq301-lgtm/raqqa/updates';
    try {
      // 1. فحص رقم الإصدار من ملف version.json
      const githubResponse = await CapacitorHttp.get({
        url: `${BASE_URL}/version.json`
      });
      
      const latestVersion = githubResponse.data.version;
      const currentVersion = parseInt(localStorage.getItem('raqqa_version_build') || '0');

      if (latestVersion > currentVersion) {
        // 2. تحميل الحزمة المضغوطة (Internal Update)
        const bundle = await CapacitorUpdater.download({
          url: `${BASE_URL}/update.zip`,
          version: latestVersion.toString()
        });

        if (bundle) {
          // 3. تخزين الإصدار الجديد وتطبيق التحديث
          localStorage.setItem('raqqa_version_build', latestVersion.toString());
          await CapacitorUpdater.set(bundle); 
          // سيقوم التطبيق بإعادة تشغيل نفسه تلقائياً بالنسخة الجديدة
        }
      }
    } catch (err) {
      console.log("OTA Update: No updates found at /updates branch.");
    }
  }, []);

  // --- نظام جدولة الإشعارات المحلية من قاعدة البيانات ---
  const syncNotifications = useCallback(async () => {
    try {
      const response = await CapacitorHttp.get({
        url: 'https://raqqa-hjl8.vercel.app/api/get-notifications',
        params: { user_id: "1" }
      });

      if (response.data && response.data.rows) {
        const reminders = response.data.rows;
        const perms = await LocalNotifications.checkPermissions();
        if (perms.display !== 'granted') await LocalNotifications.requestPermissions();

        // تنظيف الإشعارات القديمة المجدولة
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }

        // جدولة الإشعارات الجديدة
        const notificationsToSchedule = reminders
          .filter(rem => new Date(rem.scheduled_for) > new Date())
          .map(rem => ({
            id: parseInt(rem.id),
            title: rem.title,
            body: rem.body,
            schedule: { at: new Date(rem.scheduled_for) },
            extra: { url: rem.image_url },
            smallIcon: 'ic_stat_name', // يجب التأكد من وجودها في Android Res
            sound: 'default'
          }));

        if (notificationsToSchedule.length > 0) {
          await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        }
      }
    } catch (err) {
      console.error("Notification Sync Error:", err);
    }
  }, []);

  useEffect(() => {
    syncAppUpdates();
    syncNotifications();

    // التعامل مع زر الرجوع في أندرويد
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
    return () => { listener.then(l => l.remove()); };
  }, [syncNotifications, syncAppUpdates]);

  return (
    <div className="app-container">
      <ScrollToTop />
      <TipOverlay />
      
      {/* القائمة العلوية */}
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

      {/* القائمة السفلية الذكية */}
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
