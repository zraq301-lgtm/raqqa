import React, { useState } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';

function AppSwitcher() {
  // جلب الحالة مباشرة عند التحميل لتجنب الـ null
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('isProfileComplete') === 'true';
  });

  const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true');
    setIsRegistered(true);
  };

  // عرض صفحة البروفايل أو التطبيق مباشرة
  return isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />;
}

export default AppSwitcher;
