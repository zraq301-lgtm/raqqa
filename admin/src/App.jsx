// admin/src/App.jsx
import React, { useState } from 'react';
import SwingManagement from './pages/SwingManagement'; // استيراد صفحة إدارة الأرجوحة
import UploadManager from './pages/UploadManager'; // ✅ استيراد صفحة الرفع الجديدة من مسارها الصحيح

function App() {
  // حالة التحكم بالصفحة النشطة (الافتراضية هي صفحة الرفع الجديدة)
  const [activePage, setActivePage] = useState('upload');

  // دالة لعرض الصفحة بناءً على الزر المضغوط بسلاسة
  const renderPage = () => {
    switch (activePage) {
      case 'upload':
        return <UploadManager />;
      case 'swing':
        return <SwingManagement />;
      default:
        return <UploadManager />;
    }
  };

  return (
    <div className="app-container" dir="rtl">
      
      {/* منطقة عرض محتوى الصفحة النشطة */}
      <div className="page-content">
        {renderPage()}
      </div>

      {/* 📱 شريط التنقل السفلي الاحترافي للأيقونات */}
      <nav className="bottom-nav">
        <button 
          onClick={() => setActivePage('upload')} 
          className={`nav-item ${activePage === 'upload' ? 'active' : ''}`}
        >
          <span className="nav-icon">🚀</span>
          <span className="nav-text">رفع المحتوى</span>
        </button>

        <button 
          onClick={() => setActivePage('swing')} 
          className={`nav-item ${activePage === 'swing' ? 'active' : ''}`}
        >
          <span className="nav-icon">🎡</span>
          <span className="nav-text">إدارة الأرجوحة</span>
        </button>
      </nav>

      {/* التنسيقات العامة والتحريكات الانسيابية المحدثة لشريط التنقل */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          overflow-y: auto !important;
          scroll-behavior: smooth;
          background-color: #fdfaf7;
        }

        .app-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-y: visible;
          animation: appEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          will-change: transform, opacity;
        }

        /* حجز مساحة في الأسفل للمحتوى حتى لا يختفي خلف شريط الأيقونات الثابت */
        .page-content {
          flex: 1;
          padding-bottom: 80px; 
        }

        /* تنسيق شريط التنقل السفلي */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: space-around;
          align-items: center;
          border-top: 1px solid rgba(255, 77, 125, 0.15);
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.04);
          z-index: 10000;
        }

        /* تنسيق الأزرار داخل الشريط */
        .nav-item {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          color: #888888;
          font-family: 'Tajawal', sans-serif;
          transition: all 0.3s ease;
          width: 45%;
          height: 100%;
        }

        .nav-icon {
          font-size: 1.3rem;
          transition: transform 0.3s ease;
        }

        .nav-text {
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* الستايل الخاص بالأيقونة النشطة والمحددة حالياً */
        .nav-item.active {
          color: #FF4D7D; /* متناسق مع هوية رقة الزهرية */
        }

        .nav-item.active .nav-icon {
          transform: translateY(-2px) scale(1.15);
        }

        .nav-item.active .nav-text {
          font-weight: bold;
        }

        @keyframes appEntrance {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
