// admin/src/App.jsx
import React from 'react';
import SwingManagement from './pages/SwingManagement'; // استيراد صفحة إدارة الأرجوحة
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* استدعاء وعرض الصفحة هنا مباشرة */}
      <SwingManagement />
      
      {/* مستقبلاً يمكنك إضافة أزرار للتنقل بين الصفحات السبعة الأخرى هنا */}

      {/* إضافة تصفيفات السلاسة والتحريك الانسيابي عند أول ظهور للمكون */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          overflow-y: auto !important; /* يجبر النظام على السماح بالتمرير العمودي */
          scroll-behavior: smooth;
          background-color: #fdfaf7; /* متناسق مع لون لوحة التحكم */
        }

        .app-container {
          width: 100%;
          min-height: 100vh; /* يضمن تمدد الحاوية لتأخذ طول الشاشة وأكثر */
          display: block;
          overflow-y: visible; /* يسمح بظهور المحتوى الخارج عن حدود الشاشة الأولى */
          animation: appEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          will-change: transform, opacity;
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
