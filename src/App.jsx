import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Health from './pages/Health'; [cite: 2]
import Swing from './pages/Swing'; [cite: 3]
import Insight from './pages/Insight'; [cite: 3]
import './App.css'; [cite: 3]

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); [cite: 5]
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        {/* شريط علوي ثابت */}
        <div className="fixed-top">
          <Header />
          <div className="top-nav-cards">
            <Link to="/videos" className="mini-card">video library</Link>
            <Link to="/virtual-world" className="mini-card">virtual world</Link>
          </div>
        </div>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Health />} /> [cite: 6]
            <Route path="/health" element={<Health />} /> [cite: 7]
            <Route path="/swing-forum" element={<Swing />} /> [cite: 7]
            <Route path="/insight" element={<Insight />} /> [cite: 7]
            <Route path="/feelings" element={<div className="placeholder">عالم الأحاسيس</div>} />
            <Route path="/intimacy" element={<div className="placeholder">المودة والخصوصية</div>} />
          </Routes>
        </main>

        {/* الكروت السفلية الثابتة فوق النيبار مباشرة */}
        <div className="fixed-bottom-menu">
          <div className="bottom-grid">
            <Link to="/feelings" className="nav-card">المشاعر <span>feelings</span></Link>
            <Link to="/intimacy" className="nav-card">الحميمية <span>intimacy</span></Link>
            <Link to="/health" className="nav-card center-highlight">صحتك <span>health</span></Link>
            <Link to="/swing-forum" className="nav-card">الأرجوحة <span>swing</span></Link>
            <Link to="/insight" className="nav-card">القفقة <span>insight</span></Link>
          </div>
          <Navbar /> [cite: 7]
        </div>
      </div>
    </Router>
  );
}

export default App;
