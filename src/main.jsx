import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // تم حذف .jsx لضمان التوافق مع معايير Vite/Rollup
import './App.css'; // استدعاء التنسيق الجمالي الذي صممناه هنا بدلاً من HTML

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
