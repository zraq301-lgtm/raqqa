import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react'; // أضفنا useState هنا
import { App as CapApp } from '@capacitor/app'; 
import { CapacitorHttp } from '@capacitor/core';
import healthImg from './assets/health.jpg';
import feelingsImg from './assets/feelings.jpg';
import intimacyImg from './assets/intimacy.jpg';
import swingImg from './assets/swing.jpg';
import insightImg from './assets/insight.jpg';
import videosImg from './assets/videos.jpg';
import virtualImg from './assets/virtual.jpg';
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

// --- مكون صفحة البروفيل الإجبارية ---
function ProfileSetup({ onComplete }) {
  const [name, setName] = useState('');
  
  const handleSubmit = () => {
    if (name.trim() !== '') {
      localStorage.setItem('user_profile_complete', 'true');
      onComplete();
    } else {
      alert("الرجاء إدخال الاسم للمتابعة");
    }
  };

  return (
    <div className="profile-setup-container" style={{ padding: '50px', textAlign: 'center' }}>
      <h2>مرحباً بكِ في رقة</h2>
      <p>يرجى إدخال اسمكِ لإعداد ملفكِ الشخصي</p>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="اسمكِ هنا..."
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '20px', width: '80%' }}
      />
      <br />
      <button 
        onClick={handleSubmit}
        style={{ padding: '10px 30px', backgroundColor: '#e91e63', color: 'white', border: 'none', borderRadius: '20px' }}
      >
        تأكيد ودخول
      </button>
    </div>
  );
}

function App() {
  // حالة التحقق من اكتمال البروفيل
  const [isProfileDone, setIsProfileDone] = useState(localStorage.getItem('user_profile_complete') === 'true');

  useEffect(() => {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) { 
        CapApp.exitApp(); 
      } else { 
        window.history.back(); 
      }
    });
  }, []);

  // إذا لم يتم ملء البيانات، تظهر صفحة البروفيل فقط
  if (!isProfileDone) {
    return <ProfileSetup onComplete={() => setIsProfileDone(true)} />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        
        <header className="top-sticky-menu">
          <div className="top-cards-container">
            <Link to="/videos" className="top-card">
              <img src={videosImg} alt="المكتبة" className="custom-img-icon" />
              <div className="card-text">
                <span className="card-label">المكتبة</span>
              </div>
            </Link>

            <Link to="/virtual-world" className="top-card">
              <img src={virtualImg} alt="عالم رقة" className="custom-img-icon" />
              <div className="card-text">
                <span className="card-label">عالم رقة</span>
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

        <nav className="bottom-sticky-menu">
          <div className="nav-grid">
            
            <Link to="/feelings" className="nav-item">
              <img src={feelingsImg} alt="المشاعر" className="custom-img-icon-nav" />
              <span className="nav-label">المشاعر</span>
            </Link>

            <Link to="/intimacy" className="nav-item">
              <img src={intimacyImg} alt="الحميمية" className="custom-img-icon-nav" />
              <span className="nav-label">الحميمية</span>
            </Link>
            
            <Link to="/health" className="nav-item center-action">
              <div className="center-circle">
                <img src={healthImg} alt="صحتك" className="custom-img-icon-main" />
              </div>
              <span className="nav-label bold">صحتك</span>
            </Link>

            <Link to="/swing-forum" className="nav-item">
              <img src={swingImg} alt="الأرجوحة" className="custom-img-icon-nav" />
              <span className="nav-label">الأرجوحة</span>
            </Link>

            <Link to="/insight" className="nav-item">
              <img src={insightImg} alt="القفقة" className="custom-img-icon-nav" />
              <span className="nav-label">القفقة</span>
            </Link>
            
          </div>
        </nav>
      </div>
    </Router>
  );
}

export default App;
