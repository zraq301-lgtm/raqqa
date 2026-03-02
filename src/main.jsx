import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import OneSignal from 'react-onesignal'; // استيراد مكتبة الإشعارات
import AppSwitcher from './AppSwitcher'; 
import './App.css';

const Main = () => {
  useEffect(() => {
    // تهيئة OneSignal بالمعرف الخاص بك
    OneSignal.init({
      appId: "726fe629-0b1e-4294-9a4b-39cf50212b42",
      allowLocalhostAsSecureOrigin: true,
    }).then(() => {
      // طلب الإذن من المستخدم لإرسال الإشعارات فور فتح التطبيق
      OneSignal.Notifications.requestPermission();
    });
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <AppSwitcher />
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
