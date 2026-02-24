import React, { useState, useEffect } from 'react';
import App from './App'; // ملف التطبيق الرئيسي
import ProfileSetup from './pages/ProfileSetup'; // صفحة البروفايل بنظام الكروت

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(null);

  useEffect(() => {
    // التحقق من ذاكرة الهاتف إذا كان البروفايل مكتملاً
    const userStatus = localStorage.getItem('isProfileComplete');
    setIsRegistered(userStatus === 'true');
  }, []);

  // حالة التحميل الأولية
  if (isRegistered === null) return null;

  return (
    <>
      {isRegistered ? (
        <App />
      ) : (
        <ProfileSetup onComplete={() => setIsRegistered(true)} />
      )}
    </>
  );
}

export default AppSwitcher;
