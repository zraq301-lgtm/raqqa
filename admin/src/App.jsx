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
    </div>
  );
}

export default App;
