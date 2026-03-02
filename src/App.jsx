import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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

function App() {
  // إدارة زر الرجوع في الأندرويد وتهيئة OneSignal
  useEffect(() => {
    // تعديل تهيئة OneSignal لتناسب مكتبة الموبايل (Native)
    const initNotifications = () => {
      const OneSignal = window.OneSignal;
      if (OneSignal) {
        try {
          OneSignal.setAppId("726fe629-0b1e-4294-9a4b-39cf50212b42");
          
          // طلب الإذن فوراً لضمان ظهور الرسالة للمستخدم (Native Prompt)
          OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
            console.log("User responded to notifications:", accepted);
          });
        } catch (e) {
          console.error("OneSignal Native Init Error:", e);
        }
      }
    };

    // التأكد من أن الجهاز جاهز قبل التشغيل
    document.addEventListener("deviceready", initNotifications, false);

    const backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) { 
        CapApp.exitApp(); 
      } else { 
        window.history.back(); 
      }
    });

    return () => {
      backButtonListener.remove();
      document.removeEventListener("deviceready", initNotifications);
    };
  }, []);

  return (
    <div className="app-container">
      <ScrollToTop />
      
      {/* الترويسة العلوية (Header) */}
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
      
      {/* منطقة عرض المحتوى الرئيسي */}
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

      {/* شريط التنقل السفلي (Navigation Bar) */}
      <nav className="bottom-sticky-menu">
        <div className="nav-grid">
          
          {/* المشاعر */}
          <Link to="/feelings" className="nav-item">
            <img src={feelingsImg} alt="المشاعر" className="custom-img-icon-nav" />
            <span className="nav-label">المشاعر</span>
          </Link>

          {/* الحميمية */}
          <Link to="/intimacy" className="nav-item">
            <img src={intimacyImg} alt="الحميمية" className="custom-img-icon-nav" />
            <span className="nav-label">الحميمية</span>
          </Link>
          
          {/* أيقونة الصحة المركزية (صحتك) */}
          <Link to="/health" className="nav-item center-action">
            <div className="center-circle">
              <img src={healthImg} alt="صحتك" className="custom-img-icon-main" />
            </div>
            <span className="nav-label bold">صحتك</span>
          </Link>

          {/* الأرجوحة */}
          <Link to="/swing-forum" className="nav-item">
            <img src={swingImg} alt="الأرجوحة" className="custom-img-icon-nav" />
            <span className="nav-label">الأرجوحة</span>
          </Link>

          {/* القفقة / البصيرة */}
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
