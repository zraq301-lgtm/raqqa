// 1. استيراد المكون في أعلى الملف
import AdBanner from '../components/AdBanner'; 

const ElegancePage = () => {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1>قسم الأناقة</h1>
      
      {/* 2. وضع المكون في المكان الذي تريده أن يظهر فيه الإعلان */}
      <AdBanner />
      
      {/* باقي محتوى الصفحة */}
      <p>محتوى العناية والجمال...</p>
    </div>
  );
};
