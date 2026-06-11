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
        html {
          scroll-behavior: smooth;
        }

        .app-container {
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
