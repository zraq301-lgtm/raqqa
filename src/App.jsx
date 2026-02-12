import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app'; 

// استيراد المكونات والصفحات (تبقى كما هي تماماً)
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';

import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  useEffect(() => {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        
        {/* القسم العلوي: مكتبة الفيديوهات وعالم رقة باستخدام الصور المرفوعة */}
        <header className="top-sticky-menu">
          <div className="top-cards-container">
            <Link to="/videos" className="top-card">
              <span className="card-icon">
                <img src="/path/to/Gemini_Generated_Image_b8zbv7b8zbv7b8zb.jpg" alt="مكتبة الفيديوهات" className="custom-img-icon" />
              </span>
              <div className="card-text">
                <span className="card-label">مكتبة الفيديوهات</span>
                <span className="card-sub">video library</span>
              </div>
            </Link>

            <Link to="/virtual-world" className="top-card">
              <span className="card-icon">
                <img src="/path/to/Gemini_Generated_Image_za1pe5za1pe5za1p.jpg" alt="عالم رقة" className="custom-img-icon" />
              </span>
              <div className="card-text">
                <span className="card-label">عالم رقة الافتراضي</span>
                <span className="card-sub">virtual world</span>
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

        {/* القسم السفلي الثابت باستخدام الصور المرفوعة حسب ترتيبك */}
        <nav className="bottom-sticky-menu">
          <div className="nav-grid">
            <Link to="/feelings" className="nav-item">
              <span className="nav-icon">
                <img src="/path/to/Gemini_Generated_Image_bhnb4tbhnb4tbhnb.jpg" alt="المشاعر" className="custom-img-icon-nav" />
              </span>
              <span className="nav-label">المشاعر</span>
            </Link>

            <Link to="/intimacy" className="nav-item">
              <span className="nav-icon">
                <img src="/path/to/Gemini_Generated_Image_b5uw59b5uw59b5uw.jpg" alt="الحميمية" className="custom-img-icon-nav" />
              </span>
              <span className="nav-label">الحميمية</span>
            </Link>
            
            <Link to="/health" className="nav-item center-action">
              <div className="center-circle">
                <img src="/path/to/Gemini_Generated_Image_8vsp0e8vsp0e8vsp.jpg" alt="صحتك" className="custom-img-icon-main" />
              </div>
              <span className="nav-label bold">صحتك</span>
            </Link>

            <Link to="/swing-forum" className="nav-item">
              <span className="nav-icon">
                <img src="/path/to/Gemini_Generated_Image_j7n9aaj7n9aaj7n9.jpg" alt="الأرجوحة" className="custom-img-icon-nav" />
              </span>
              <span className="nav-label">الأرجوحة</span>
            </Link>

            <Link to="/insight" className="nav-item">
              <span className="nav-icon">
                <img src="/path/to/Gemini_Generated_Image_gw77gfgw77gfgw77.jpg" alt="القفقة" className="custom-img-icon-nav" />
              </span>
              <span className="nav-label">القفقة</span>
            </Link>
          </div>
        </nav>
      </div>
    </Router>
  );
}

export default App;
