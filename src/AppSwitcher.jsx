import React, { useState, useEffect } from 'react';
import App from './App'; // ملف التطبيق الرئيسي المرفوع مسبقاً
import ProfileSetup from './pages/ProfileSetup'; // صفحة البروفايل بنظام الكروت

function AppSwitcher() {
  const [isRegistered, setIsRegistered] = useState(null);

  useEffect(() => {
    // التحقق مما إذا كانت المستخدمة قد سجلت بياناتها من قبل
    const userStatus = localStorage.getItem('isProfileComplete');
    if (userStatus === 'true') {
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
    }
  }, []);

  // منع ظهور أي شيء حتى يتم التحقق من الحالة
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
