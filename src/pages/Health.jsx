import { useEffect, useState } from 'react';

function Health() {
  useEffect(() => {
    // أي منطق برمجي كان في صفحة health.html يوضع هنا
    console.log("صفحة الصحة محملة الآن");
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--deep-rose)' }}>ركن الصحة والحميمية</h1>
      <p>هنا تظهر بياناتك المحدثة دائماً بفضل نظام React.</p>
      {/* ضع هنا كود HTML الخاص بصفحة الصحة من مشروعك القديم */}
    </div>
  );
}

export default Health;
