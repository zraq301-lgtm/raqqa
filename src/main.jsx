import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import OneSignal from 'react-onesignal'; 
import AppSwitcher from './AppSwitcher'; 
import './App.css';

const Main = () => {
  useEffect(() => {
    // وظيفة لتشغيل ون سيجنال
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "726fe629-0b1e-4294-9a4b-39cf50212b42",
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: true } // إضافة زر جرس صغير للتأكد من العمل
        });
        
        // تأخير طلب الإذن لثانية واحدة لضمان استقرار التطبيق
        setTimeout(() => {
          OneSignal.Notifications.requestPermission();
        }, 1000);
        
      } catch (error) {
        console.error("OneSignal Init Error:", error);
      }
    };

    initOneSignal();
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
