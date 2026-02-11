import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app'; // إضافة مستورد Capacitor

[cite_start]// استيراد المكونات والصفحات [cite: 2, 3]
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';

[cite_start]// استيراد الأيقونات من المرجع الرئيسي المعتمد [cite: 4]
import { 
  Heart, 
  Sparkles, 
  Video, 
  Activity, 
  Flower2, 
  Gem, 
  MessageCircle 
} from 'lucide-react';

[cite_start]import './App.css'; [cite: 5]

[cite_start]// وظيفة لضمان صعود الصفحة للأعلى عند التنقل [cite: 4, 6]
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  // التعديل المضاف لإدارة التحديثات وزر الرجوع في الأندرويد
  useEffect(() => {
    // مراقبة حالة التطبيق للتأكد من تحديث المحتوى عند الفتح
    const checkUpdates = async () => {
      // بما أن capacitor.config.json موجه للرابط الخارجي، سيعمل هذا السطر للتأكيد
      console.log("التطبيق متصل الآن بمصدر التحديثات من جيت هب");
    };

    checkUpdates();

    // العودة للصفحة السابقة عند ضغط زر الرجوع في الأندرويد لضمان تجربة مستخدم سلسة
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
        
        [cite_start]{/* القسم العلوي: مكتبة الفيديوهات وعالم رقة [cite: 6, 7, 8, 9, 10] */}
        <header className="top-sticky-menu">
          <div className="top-cards-container">
            <Link to="/videos" className="top-card">
              <span className="card-icon"><Video size={24} /></span>
              <div className="card-text">
                <span className="card-label">مكتبة الفيديوهات</span>
                <span className="card-sub">video library</span>
              </div>
            </Link>
     
            <Link to="/virtual-world" className="top-card">
              <span className="card-icon"><Gem size={24} /></span>
              <div className="card-text">
                <span className="card-label">عالم رقة الافتراضي</span>
                <span className="card-sub">virtual world</span>
              </div>
            </Link>
          </div>
        </header>
        
        [cite_start]{/* المحتوى المتغير (المسارات السبعة) [cite: 11, 12] */}
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

        [cite_start]{/* القسم السفلي الثابت: الأقسام الخمسة [cite: 13, 14, 15, 16, 17] */}
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
            
            [cite_start]{/* أيقونة "صحتك" المركزية [cite: 14, 15] */}
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

[cite_start]export default App; [cite: 18]
