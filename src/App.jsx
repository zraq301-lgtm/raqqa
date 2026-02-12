import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app'; 

// استيراد المكونات والصفحات (كما هي تماماً)
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';

// استيراد الأيقونات من lucide-react (لضمان ظهورها داخل المربعات)
import { 
  Heart, 
  Sparkles, 
  Activity, 
  Flower2, 
  MessageCircle,
  Video,
  Gem
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
  // الحفاظ على وظائف Capacitor كما هي
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
      
      {/* التعديل الجديد للمنظر: محاكي الهاتف */}
      <div className="phoneContainer">
        <div className="screen">
          
          {/* الجزيرة التفاعلية (Dynamic Island) */}
          <div className="camera"></div>

          {/* هيدر بسيط علوي لعرض الروابط الإضافية دون زحام */}
          <div className="dynamic-top-bar">
             <Link to="/videos" className="top-link"><Video size={18} /></Link>
             <h1 className="mini-logo">رقة</h1>
             <Link to="/virtual-world" className="top-link"><Gem size={18} /></Link>
          </div>

          {/* منطقة المحتوى الداخلي السلسة */}
          <div className="main-content-scrollable">
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
          </div>

          {/* شريط الأيقونات السفلي (MenuBar) كما في كود Uiverse */}
          <div className="menuBar">
            <Link to="/feelings" className="twoApp">
              <Heart size={20} color="#ff748d" />
            </Link>
            
            <Link to="/intimacy" className="twoApp">
              <Flower2 size={20} color="#ff748d" />
            </Link>

            {/* أيقونة الصحة في المنتصف (يمكن تمييزها) */}
            <Link to="/health" className="twoApp health-active">
              <Activity size={24} color="#fff" />
            </Link>

            <Link to="/swing-forum" className="twoApp">
              <MessageCircle size={20} color="#ff748d" />
            </Link>
        
            <Link to="/insight" className="twoApp">
              <Sparkles size={20} color="#ff748d" />
            </Link>
          </div>

        </div>
      </div>
    </Router>
  );
}

export default App;
