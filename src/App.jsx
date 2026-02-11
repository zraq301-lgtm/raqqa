import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app'; 

// استيراد المكونات والصفحات (دون تغيير)
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';

// استيراد الأيقونات (يمكنك استبدالها من iconMap.js لاحقاً إذا أردت)
import { 
  Heart, 
  Sparkles, 
  Video, 
  Activity, 
  Flower2, 
  Gem, 
  MessageCircle,
  Bell,
  Menu
} from 'lucide-react';

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
    const checkUpdates = async () => {
      console.log("التطبيق متصل الآن بمصدر التحديثات من جيت هب");
    };
    checkUpdates();

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
        
        {/* الهيدر الجديد: يحتوي على الفيديوهات وعالم رقة لتوفير مساحة في المنتصف */}
        <header className="professional-header">
          <div className="header-top-row">
            <button className="icon-btn"><Bell size={22} /></button>
            <div className="header-chips">
              <Link to="/videos" className="chip-btn">
                <Video size={16} />
                <span>المكتبة</span>
              </Link>
              <Link to="/virtual-world" className="chip-btn active">
                <Gem size={16} />
                <span>عالم رقة</span>
              </Link>
            </div>
            <button className="icon-btn"><Menu size={22} /></button>
          </div>
          <h1 className="brand-logo">رقة</h1>
        </header>
        
        {/* مساحة المحتوى الداخلي - أصبحت أكبر الآن */}
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

        {/* القائمة السفلية مع الأيقونة العائمة المصغرة */}
        <nav className="bottom-sticky-menu">
          <div className="nav-grid">
            {/* أيقونات الجانب الأيمن */}
            <Link to="/feelings" className="nav-item">
              <span className="nav-icon"><Heart size={20} /></span>
              <span className="nav-label">المشاعر</span>
            </Link>

            <Link to="/intimacy" className="nav-item">
              <span className="nav-icon"><Flower2 size={20} /></span>
              <span className="nav-label">الحميمية</span>
            </Link>
            
            {/* أيقونة الصحة العائمة (تم تصغيرها) */}
            <Link to="/health" className="nav-item center-action">
              <div className="center-circle small-fab">
                <span className="nav-icon"><Activity size={24} /></span>
              </div>
              <span className="nav-label bold">صحتك</span>
            </Link>

            {/* أيقونات الجانب الأيسر */}
            <Link to="/swing-forum" className="nav-item">
              <span className="nav-icon"><MessageCircle size={20} /></span>
              <span className="nav-label">الأرجوحة</span>
            </Link>
        
            <Link to="/insight" className="nav-item">
              <span className="nav-icon"><Sparkles size={20} /></span>
              <span className="nav-label">القفقة</span>
            </Link>
          </div>
        </nav>
      </div>
    </Router>
  );
}

export default App;
