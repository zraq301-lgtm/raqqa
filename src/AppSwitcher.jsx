import React, { useState, useEffect } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';

// استيراد الـ Router لضمان تشغيل أزرار الدخول ومنع تعليقها
import { BrowserRouter } from 'react-router-dom'; 

// استيراد ClerkProvider لضمان عدم حدوث شاشة بيضاء
import { ClerkProvider } from "@clerk/clerk-react";

// مفتاح Clerk العام الخاص بتطبيقك
const CLERK_PUBLISHABLE_KEY = "pk_test_Y2xlcmstcmVxLWFwcC0xMi5jbGVyay5hY2NvdW50cy5kZXYk"; 

function AppSwitcher({ onComplete }) {
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return localStorage.getItem('isProfileComplete') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // --- وظيفة فحص التحديثات الجديدة ---
    const checkUpdate = async () => {
      const CURRENT_VERSION_CODE = 1653; 
      const JSON_URL = "https://raw.githubusercontent.com/zraq301-lgtm/raqqa/main/update.json";
      
      try {
        const response = await fetch(JSON_URL);
        const data = await response.json();
        
        if (data.is_live && data.latest_version_code > CURRENT_VERSION_CODE) {
          const lastIgnored = localStorage.getItem('ignored_version');
          
          if (lastIgnored !== data.latest_version_code.toString()) {
            const confirmUpdate = window.confirm("يوجد تحديث جديد لتطبيق رقة، هل تريد تحميل النسخة المحدثة الآن؟");
            if (confirmUpdate) {
              window.location.href = data.download_url;
            } else {
              localStorage.setItem('ignored_version', data.latest_version_code.toString());
            }
          }
        }
      } catch (err) {
        console.warn("فشل فحص التحديثات:", err);
      }
    };

    // إعداد زر الرجوع في الأندرويد بشكل ديناميكي آمن عبر Capacitor
    const setupBackButton = async () => {
      if (window && window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
          const { App: CapApp } = await import('@capacitor/app');
          CapApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              CapApp.exitApp();
            } else {
              window.history.back();
            }
          });
        } catch (e) {
          console.error("Capacitor App module not found:", e);
        }
      }
    };

    checkUpdate();
    setupBackButton();
  }, []);

  const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true');
    setIsRegistered(true);
    if (onComplete) onComplete();
  };

  return (
    <div className="switcher-wrapper" style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />}
    </div>
  );
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <AppSwitcher />
      </ClerkProvider>
    </BrowserRouter>
  );
}
