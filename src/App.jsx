import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Health from './pages/Health';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import './App.css';

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
        {/* شريط علوي ثابت - يحتوي على الفيديوهات والعالم الافتراضي */}
        <div className="fixed-top">
          <Header />
          <div className="top-nav-cards">
            <Link to="/videos" className="mini-card">video library <br/><span>مكتبة الفيديوهات</span></Link>
            <Link to="/virtual-world" className="mini-card">virtual world <br/><span>عالم رقة</span></Link>
          </div>
        </div>
        
        <main className="main-content">
          <Routes>
            {/* التطبيق يفتح دائماً على قسم الصحة (صحتك) */}
            <Route path="/" element={<Health />} />
            <Route path="/health" element={<Health />} />
            <Route path="/swing-forum" element={<Swing />} />
            <Route path="/insight" element={<Insight />} />
            <Route path="/feelings" element={<div className="placeholder">عالم الأحاسيس</div>} />
            <Route path="/intimacy" element={<div className="placeholder">المودة والخصوصية</div>} />
          </Routes>
        </main>

        {/* الكروت السفلية الثابتة - القفقة، المشاعر، الحميمية، الأرجوحة، وصحتك بالمنتصف */}
        <div className="fixed-bottom-menu">
          <div className="bottom-grid">
            <Link to="/feelings" className="nav-card">المشاعر <span>feelings</span></Link>
            <Link to="/intimacy" className="nav-card">الحميمية <span>intimacy</span></Link>
            
            {/* قسم الصحة بالوسط وبالأسفل باسم "صحتك" */}
            <Link to="/health" className="nav-card center-highlight">صحتك <span>health</span></Link>
            
            <Link to="/swing-forum" className="nav-card">الأرجوحة <span>swing forum</span></Link>
            <Link to="/insight" className="nav-card">القفقة <span>insight</span></Link>
          </div>
          <Navbar />
        </div>
      </div>
    </Router>
  );
}

export default App;
