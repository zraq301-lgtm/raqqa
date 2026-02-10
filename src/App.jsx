import React from 'react';
import ReactDOM from 'react-dom';
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
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-viewport">
        {/* الجزء العلوي الثابت */}
        <header className="fixed-header">
          <Header />
          <div className="top-icon-nav">
            <Link to="/videos" className="icon-btn">
              <span className="emoji-icon">🎬</span>
              <span className="btn-text">video library</span>
            </Link>
            <Link to="/virtual-world" className="icon-btn">
              <span className="emoji-icon">🎡</span>
              <span className="btn-text">virtual world</span>
            </Link>
          </div>
        </header>
        
        {/* المحتوى الوسطي المتغير */}
        <main className="main-scroll-area">
          <Routes>
            <Route path="/" element={<Health />} />
            <Route path="/health" element={<Health />} />
            <Route path="/swing-forum" element={<Swing />} />
            <Route path="/insight" element={<Insight />} />
            <Route path="/feelings" element={<div className="page-view">عالم الأحاسيس</div>} />
            <Route path="/intimacy" element={<div className="page-view">المودة والخصوصية</div>} />
          </Routes>
        </main>

        {/* الجزء السفلي الثابت مع أيقونة صحتك بالمنتصف */}
        <footer className="fixed-footer-nav">
          <div className="bottom-icon-grid">
            <Link to="/feelings" className="nav-item">
              <span className="emoji">💖</span>
              <span className="label">feelings</span>
            </Link>
            <Link to="/intimacy" className="nav-item">
              <span className="emoji">🕯️</span>
              <span className="label">intimacy</span>
            </Link>
            
            <Link to="/health" className="nav-item highlight-item">
              <div className="pulse-circle">
                <span className="emoji">🩺</span>
              </div>
              <span className="label active">صحتك</span>
            </Link>

            <Link to="/swing-forum" className="nav-item">
              <span className="emoji">🧚</span>
              <span className="label">swing forum</span>
            </Link>
            <Link to="/insight" className="nav-item">
              <span className="emoji">✨</span>
              <span className="label">القفقة</span>
            </Link>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// كود الرندر لتعويض ملف main.jsx المحذوف
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

export default App;
