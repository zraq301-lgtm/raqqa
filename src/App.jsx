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
        <Header />

        {/* الكروت العلوية: عالم رقة ومكتبة الفيديوهات */}
        <div className="top-section">
          <Link to="/virtual-world" className="card glass-card">عالم رقة الافتراضي <br/><span>raqqa virtual world</span></Link>
          <Link to="/videos" className="card glass-card">مكتبة الفيديوهات <br/><span>video library</span></Link>
        </div>
        
        <main className="content">
          <Routes>
            {/* جعل قسم الصحة هو الصفحة الرئيسية الافتراضية */}
            <Route path="/" element={<Health />} />
            <Route path="/health" element={<Health />} />
            <Route path="/swing-forum" element={<Swing />} />
            <Route path="/insight" element={<Insight />} />
            <Route path="/feelings" element={<div className="page-placeholder">عالم الأحاسيس</div>} />
            <Route path="/intimacy" element={<div className="page-placeholder">المودة والخصوصية</div>} />
          </Routes>
        </main>

        {/* الكروت السفلية: توزيع أنيق وجذاب */}
        <div className="bottom-cards-grid">
          <Link to="/feelings" className="card pink-card">المشاعر <br/><span>feelings</span></Link>
          <Link to="/intimacy" className="card pink-card">الحميمية <br/><span>intimacy</span></Link>
          {/* قسم الصحة في المنتصف بالأسفل */}
          <Link to="/health" className="card main-health-card">صحتك <br/><span>health</span></Link>
          <Link to="/swing-forum" className="card pink-card">منتدى الأرجوحة <br/><span>swing forum</span></Link>
          <Link to="/insight" className="card pink-card">القفقة <br/><span>insight</span></Link>
        </div>

        <Navbar />
      </div>
    </Router>
  );
}

export default App;
