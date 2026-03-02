import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';

// ملاحظة: تم إزالة استيراد react-onesignal من هنا لمنع خطأ Rollup failed to resolve import
// وتم نقل منطق الإشعارات إلى AppSwitcher ليتناسب مع بيئة الأندرويد

const Main = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AppSwitcher />
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
