import React, { useState } from 'react';
import App from './App';
import ProfileSetup from './pages/ProfileSetup';

function AppSwitcher() {
  // التحقق من الحالة فوراً عند التشغيل
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('isProfileComplete') === 'true';
  });

  const handleComplete = () => {
    localStorage.setItem('isProfileComplete', 'true');
    setIsRegistered(true); // هذا التغيير سيجعل التطبيق يعرض <App /> فوراً
  };

  return isRegistered ? <App /> : <ProfileSetup onComplete={handleComplete} />;
}

export default AppSwitcher;
