import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app'; 

import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';

import { Heart, Sparkles, Activity, Flower2, MessageCircle, Video, Gem, Bell, User } from 'lucide-react';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  useEffect(() => {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) { CapApp.exitApp(); } else { window.history.back(); }
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="dribbble-container">
        
        {/* Header مستوحى من Dribbble */}
        <header className="dribbble-header">
          <button className="top-circle-btn"><Bell size={20} /></button>
          <div className="dribbble-brand">
            <span className="brand-dot"></span>
            <h1>رقة</h1>
          </div>
          <button className="top-circle-btn"><User size={20} /></button>
        </header>

        {/* روابط سريعة علوية (عالم رقة والفيديوهات) */}
        <div className="quick-access">
          <Link to="/videos" className="access-item">
            <div className="access-icon v-bg"><Video size={18} /></div>
            <span>المكتبة</span>
          </Link>
          <Link to="/virtual-world" className="access-item">
            <div className="access-icon g-bg"><Gem size={18} /></div>
            <span>عالم رقة</span>
          </Link>
        </div>

        {/* منطقة المحتوى الواسعة */}
        <main className="dribbble-main">
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

        {/* Navigation Bar السفلي الأنيق */}
        <nav className="dribbble-nav">
          <Link to="/feelings" className="nav-link-custom">
            <Heart size={22} />
            <span>المشاعر</span>
          </Link>
          <Link to="/intimacy" className="nav-link-custom">
            <Flower2 size={22} />
            <span>الحميمية</span>
          </Link>
          <Link to="/health" className="nav-link-custom active-health">
            <div className="floating-health">
              <Activity size={26} color="white" />
            </div>
          </Link>
          <Link to="/swing-forum" className="nav-link-custom">
            <MessageCircle size={22} />
            <span>الأرجوحة</span>
          </Link>
          <Link to="/insight" className="nav-link-custom">
            <Sparkles size={22} />
            <span>القفقة</span>
          </Link>
        </nav>
      </div>
    </Router>
  );
}

export default App;
