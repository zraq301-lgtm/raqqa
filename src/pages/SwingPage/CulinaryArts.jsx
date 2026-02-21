import React from 'react';

// تأكد أن الاسم يبدأ بحرف كبير CulinaryArts
const CulinaryArts = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      direction: 'rtl',
      marginTop: '50px' 
    }}>
      <div style={{ fontSize: '50px', marginBottom: '20px' }}>🍳</div>
      <h2 style={{ color: '#ff4d7d' }}>قسم فنون الطهي</h2>
      <p style={{ color: '#666' }}>هذه الصفحة تعمل الآن بنجاح!</p>
      
      <div style={{
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '15px',
        border: '1px dashed #ff4d7d',
        marginTop: '20px'
      }}>
        جاري تحضير أشهى الوصفات...
      </div>
    </div>
  );
};

// السطر الأهم الذي يمنع الشاشة البيضاء
export default CulinaryArts;
