import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
// استيراد المكونات والصفحات [cite: 2, 17]
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';
import './App.css'; // [cite: 3, 18]

// وظيفة لضمان صعود الصفحة للأعلى عند التنقل [cite: 4, 19]
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
        
        {/* القسم العلوي: مكتبة الفيديوهات وعالم رقة فقط [cite: 6, 7, 21, 22] */}
        <header className="top-sticky-menu">
          <div className="top-cards-container">
            <Link to="/videos" className="top-card">
              <span className="card-icon">🎬</span>
              <div className="card-text">
                <span className="card-label">مكتبة الفيديوهات</span>
                <span className="card-sub">video library</span>
              </div>
            </Link>
            <Link to="/virtual-world" className="top-card">
              <span className="card-icon">🎡</span>
              <div className="card-text">
                <span className="card-label">عالم رقة الافتراضي</span>
                <span className="card-sub">virtual world</span>
              </div>
            </Link>
          </div>
        </header>
        
        {/* المحتوى المتغير (المسارات السبعة) [cite: 9, 24] */}
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

        {/* القسم السفلي الثابت: الأقسام الخمسة [cite: 10, 11, 12, 13, 14, 25, 26, 27, 28, 29] */}
        <nav className="bottom-sticky-menu">
          <div className="nav-grid">
            <Link to="/feelings" className="nav-item">
              <span className="nav-icon">💖</span>
              <span className="nav-label">المشاعر</span>
              <span className="nav-sub">feelings</span>
            </Link>

            <Link to="/intimacy" className="nav-item">
              <span className="nav-icon">🕯️</span>
              <span className="nav-label">الحميمية</span>
              <span className="nav-sub">intimacy</span>
            </Link>
            
            {/* أيقونة "صحتك" المركزية [cite: 12, 27] */}
            <Link to="/health" className="nav-item center-action">
              <div className="center-circle">
                <span className="nav-icon large">🩺</span>
              </div>
              <span className="nav-label bold">صحتك</span>
              <span className="nav-sub">health</span>
            </Link>

            <Link to="/swing-forum" className="nav-item">
              <span className="nav-icon">🧚</span>
              <span className="nav-label">الأرجوحة</span>
              <span className="nav-sub">swing forum</span>
            </Link>
        
            <Link to="/insight" className="nav-item">
              <span className="nav-icon">✨</span>
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
