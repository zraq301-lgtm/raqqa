import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header'; 
import Health from './pages/Health';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import './App.css';

// تأمين الانتقال للسلس لأعلى الصفحة عند تبديل الأقسام [cite: 4, 5]
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
        {/* القسم العلوي الثابت: مكتبة الفيديوهات وعالم رقة */}
        <div className="top-sticky-menu">
          <Header />
          <div className="top-icons-row">
            <Link to="/videos" className="top-icon-item">
              <span className="icon">🎬</span>
              <span className="label">video library</span>
            </Link>
            <Link to="/virtual-world" className="top-icon-item">
              <span className="icon">🎡</span>
              <span className="label">virtual world</span>
            </Link>
          </div>
        </div>
        
        <main className="main-content">
          <Routes>
            {/* التطبيق يفتح دائماً على قسم الصحة (صحتك)  */}
            <Route path="/" element={<Health />} />
            <Route path="/health" element={<Health />} />
            <Route path="/swing-forum" element={<Swing />} />
            <Route path="/insight" element={<Insight />} />
            <Route path="/feelings" element={<div className="placeholder">عالم الأحاسيس</div>} />
            <Route path="/intimacy" element={<div className="placeholder">المودة والخصوصية</div>} />
          </Routes>
        </main>

        {/* القسم السفلي الثابت: الأيقونات الخمسة مع تمييز "صحتك" في المنتصف */}
        <div className="bottom-sticky-menu">
          <div className="bottom-icons-grid">
            <Link to="/feelings" className="nav-icon-item">
              <span className="icon">💖</span>
              <span className="label">feelings</span>
            </Link>
            <Link to="/intimacy" className="nav-icon-item">
              <span className="icon">🕯️</span>
              <span className="label">intimacy</span>
            </Link>
            
            {/* أيقونة "صحتك" المميزة في المنتصف */}
            <Link to="/health" className="nav-icon-item center-highlight">
              <div className="center-circle">
                <span className="icon">🩺</span>
              </div>
              <span className="label">صحتك</span>
            </Link>

            <Link to="/swing-forum" className="nav-icon-item">
              <span className="icon">🧚</span>
              <span className="label">swing forum</span>
            </Link>
            <Link to="/insight" className="nav-icon-item">
              <span className="icon">✨</span>
              <span className="label">القفقة</span>
            </Link>
          </div>
          <Navbar /> {/* استدعاء النيبار الأصلي [cite: 2, 7] */}
        </div>
      </div>
    </Router>
  );
}

export default App;
