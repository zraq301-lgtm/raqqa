import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
// استيراد المكونات والصفحات [cite: 2]
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';

// استيراد الأيقونات من المرجع الرئيسي المعتمد
import { 
  Heart, 
  Sparkles, 
  Video, 
  Activity, 
  Flower2, 
  Gem, 
  MessageCircle 
} from 'lucide-react';

import './App.css';

// وظيفة لضمان صعود الصفحة للأعلى عند التنقل [cite: 4]
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        
        {/* القسم العلوي: مكتبة الفيديوهات وعالم رقة [cite: 6, 7] */}
        <header className="top-sticky-menu">
          <div className="top-cards-container">
            <Link to="/videos" className="top-card">
              {/* أيقونة الفيديوهات المعتمدة */}
              <span className="card-icon"><Video size={24} /></span>
              <div className="card-text">
                <span className="card-label">مكتبة الفيديوهات</span>
                <span className="card-sub">video library</span>
              </div>
            </Link>
            <Link to="/virtual-world" className="top-card">
              {/* أيقونة العالم الافتراضي المعتمدة */}
              <span className="card-icon"><Gem size={24} /></span>
              <div className="card-text">
                <span className="card-label">عالم رقة الافتراضي</span>
                <span className="card-sub">virtual world</span>
              </div>
            </Link>
          </div>
        </header>
        
        {/* المحتوى المتغير (المسارات السبعة) [cite: 9] */}
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

        {/* القسم السفلي الثابت: الأقسام الخمسة [cite: 10, 11, 12, 13, 14] */}
        <nav className="bottom-sticky-menu">
          <div className="nav-grid">
            <Link to="/feelings" className="nav-item">
              <span className="nav-icon"><Heart size={20} /></span>
              <span className="nav-label">المشاعر</span>
              <span className="nav-sub">feelings</span>
            </Link>

            <Link to="/intimacy" className="nav-item">
              <span className="nav-icon"><Flower2 size={20} /></span>
              <span className="nav-label">الحميمية</span>
              <span className="nav-sub">intimacy</span>
            </Link>
            
            {/* أيقونة "صحتك" المركزية [cite: 12] */}
            <Link to="/health" className="nav-item center-action">
              <div className="center-circle">
                <span className="nav-icon large"><Activity size={28} /></span>
              </div>
              <span className="nav-label bold">صحتك</span>
              <span className="nav-sub">health</span>
            </Link>

            <Link to="/swing-forum" className="nav-item">
              <span className="nav-icon"><MessageCircle size={20} /></span>
              <span className="nav-label">الأرجوحة</span>
              <span className="nav-sub">swing forum</span>
            </Link>
        
            <Link to="/insight" className="nav-item">
              <span className="nav-icon"><Sparkles size={20} /></span>
              <span className="nav-label">القفقة</span>
              <span className="nav-sub">insight</span>
            </Link>
          </div>
        </nav>
      </div>
    </Router>
  );
}

export default App;
