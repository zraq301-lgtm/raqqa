import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header'; // تأكد من إنشاء هذا الملف أيضاً
import Health from './pages/Health';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import './App.css';

// مكون إضافي للتحكم في تأثيرات التنقل (بديل دالة openFrame القديمة)
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
        {/* الهيدر ثابت في الأعلى */}
        <Header />
        
        <main className="content">
          <Routes>
            <Route path="/" element={<Health />} />
            <Route path="/health" element={<Health />} />
            <Route path="/swing" element={<Swing />} />
            <Route path="/insight" element={<Insight />} />
          </Routes>
        </main>

        {/* النيبار ثابت في الأسفل */}
        <Navbar />
      </div>
    </Router>
  );
}

export default App;
